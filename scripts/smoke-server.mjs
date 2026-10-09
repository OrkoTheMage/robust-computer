#!/usr/bin/env node

import { pathToFileURL, fileURLToPath } from 'node:url'
import path from 'node:path'
import net from 'node:net'
import { createRequire } from 'node:module'

/**
 * scripts/smoke-server.mjs
 *
 * Headless smoke test for the server pipeline. Two sections:
 *
 *   1. Mongo Connection — confirms the dev MongoDB is reachable
 *      AND that the route-level surface works end-to-end. Connects
 *      via the same `config.mongoUri` and `mongoose.connect(…)`
 *      the API server boots with in production; if the connection
 *      works here, the prod config is likely good too (same
 *      driver, same auth, same code path). Then roundtrips a
 *      real Subscriber doc through the same `Subscriber` model
 *      the API route uses — schema validation, unique email
 *      index, timestamp defaults. Each run deletes any prior
 *      `smoke-marker@robust.computer` and writes a fresh one, so
 *      the dev DB always has exactly one smoke-owned Subscriber
 *      after the run completes.
 *
 *   2. Email Sends — for each of the four
 *      `server/src/utils/email/*.js` helpers:
 *
 *      a. Loads `server/src/utils/email.js` in-process — same
 *         module `yarn dev` boots. The import side-effects load
 *         `server/src/config.js` (reading `.env.dev`) and create
 *         the nodemailer transport the API server uses, so the
 *         SMTP target matches whatever `.env.dev` (or
 *         `SMTP_HOST` / `SMTP_PORT`) is configured for.
 *
 *      b. Invokes the helper once with realistic fixture data.
 *
 *      c. Polls Mailpit's HTTP API for the expected subject
 *         line (a typical SMTP submission lands in Mailpit's
 *         database within ~100ms; we poll for up to three
 *         seconds).
 *
 * The email module's `dispatch` catches send failures internally
 * and only logs them, so a silent failure mode looks like
 * "helper resolved without throwing, no mail landed". The Mailpit
 * subject query is what turns that into a check failure: if
 * Mailpit didn't receive the message, we know the transport is
 * mis-wired (DNS, port, auth) even though the helper returned.
 *
 * Output is grouped into two sections ("Mongo Connection" and
 * "Email Sends") with one tri-state line per check:
 *
 *   ✅  check passed
 *   ❌  check failed (printed before exit)
 *
 * Designed to run against a running `yarn dev` (Mailpit is on
 * `:1025` / `:8025` by default). The API server itself does NOT
 * need to be running — the smoke imports the email module
 * directly, which is self-contained.
 *
 *   yarn smoke:server
 *   yarn smoke:server --mailpit-smtp=localhost:1025 --mailpit-http=http://localhost:8025
 *
 * Exit codes:
 *   0  — every check passed
 *   1  — at least one check failed (printed before exit)
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const serverEmailModule = path.join(repoRoot, 'server/src/utils/email.js')
const serverConfigModule = path.join(repoRoot, 'server/src/config.js')

// `createRequire` rooted at `server/package.json` so `mongoose`
// resolves to `server/node_modules/mongoose` (the smoke script
// itself sits in `scripts/`, whose node_modules doesn't carry
// the server-side deps).
const serverRequire = createRequire(pathToFileURL(path.join(repoRoot, 'server/package.json')).href)

// ── arg parsing ──────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
if (argv.includes('--help') || argv.includes('-h')) {
  console.log(`
  Usage: yarn smoke:server [--mailpit-smtp=host:port] [--mailpit-http=http://host:port]

  Headless smoke test for the server pipeline. Two sections:

    1. Mongo Connection — connects via the same
       mongoose.connect(config.mongoUri) the server boots with,
       then deletes any prior smoke-marker Subscriber and writes
       a fresh one through the real Subscriber model (schema
       validation + unique-email index). The doc persists in the
       dev DB after the run.
    2. Email Sends — loads server/src/utils/email.js in-process,
       invokes each of the four utils/email/*.js helpers once
       with realistic fixture data, and asserts that Mailpit
       captured the inbound SMTP transaction for each (verified
       by polling Mailpit's HTTP API for the expected subject).

  Requires:
    - Mailpit running on the SMTP port (default :1025) and HTTP
      port (default :8025). Start it with: yarn mail
    - NODE_ENV unset or "development" — production boots the
      Resend HTTPS transport which Mailpit cannot capture.
    - .env.dev filled in (the email and config modules read
      server/src/config.js, which requires MONGODB_URI even
      though the smoke's Mongo check exercises the same URI).

  The API server itself does NOT need to be running.

  Options:
    --mailpit-smtp=host:port      Mailpit SMTP target (default
                                  localhost:1025; honours
                                  SMTP_HOST / SMTP_PORT env)
    --mailpit-http=http://host:p Mailpit HTTP API base (default
                                  http://localhost:8025; honours
                                  MAILPIT_HTTP_PORT env)
    --no-color                    Suppress ANSI colors
    --help, -h                    Show this message

  Exit codes:
    0  every check passed
    1  at least one check failed (printed before exit)
`)
  process.exit(0)
}

// ── ANSI colors ──────────────────────────────────────────────────────────
const useColor = process.stdout.isTTY && !argv.includes('--no-color')
const RESET = '\x1b[0m'
const DIM = '\x1b[2m'
const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const c = (color, s) => (useColor ? `${color}${s}${RESET}` : s)

// ── Mailpit config ───────────────────────────────────────────────────────
// SMTP target: --mailpit-smtp flag wins over SMTP_HOST/SMTP_PORT env,
// which win over the default localhost:1025. Two flags (and two env
// vars) is intentional — splitting host from port matches how
// `scripts/mailpit.js` reads them and how Vite reads SMTP_PORT in
// the deployer-only `.env.example`.
const argValue = (flag) => {
  const match = argv.find((a) => a.startsWith(flag + '='))
  return match ? match.slice(flag.length + 1) : null
}

const smtpArg = argValue('--mailpit-smtp')
const smtpTarget = smtpArg || null
const smtpHost = smtpTarget ? smtpTarget.split(':')[0] : (process.env.SMTP_HOST || 'localhost')
const smtpPort = smtpTarget
  ? parseInt(smtpTarget.split(':')[1], 10)
  : (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 1025)

const httpArg = argValue('--mailpit-http')
const mailpitHttpBase = (httpArg || `http://localhost:${process.env.MAILPIT_HTTP_PORT || 8025}`).replace(/\/+$/, '')

// ── helpers ──────────────────────────────────────────────────────────────
const probeTcp = (host, port, timeoutMs = 1000) => new Promise((resolve) => {
  const socket = new net.Socket()
  let done = false
  const finish = (ok) => {
    if (done) return
    done = true
    socket.destroy()
    resolve(ok)
  }
  socket.setTimeout(timeoutMs)
  socket.once('connect', () => finish(true))
  socket.once('timeout', () => finish(false))
  socket.once('error', () => finish(false))
  socket.connect(port, host)
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const fetchJson = async (url, init) => {
  const res = await fetch(url, init)
  let body
  try { body = await res.json() } catch { body = null }
  return { status: res.status, body, ok: res.ok }
}

let exitCode = 0
const failures = []
const startTime = Date.now()

// ── pre-flight: NODE_ENV must be dev ─────────────────────────────────────
// The email module's transport branch is selected by `config.isProduction`.
// Production boots Resend (HTTPS, no SMTP listener) so Mailpit cannot
// capture the send. We refuse rather than letting every check silently
// fail with a less-obvious message.
if (process.env.NODE_ENV === 'production') {
  console.error(c(RED, '❌ smoke:server requires the dev (Mailpit/SMTP) transport.'))
  console.error(c(YELLOW, '   Unset NODE_ENV or set it to "development".'))
  console.error(c(DIM,   '   (Production loads the Resend HTTPS transport — Mailpit can\'t catch it.)'))
  process.exit(1)
}

// ── pre-flight: Mailpit reachable ────────────────────────────────────────
console.log(`🔌 Probing Mailpit SMTP at ${smtpHost}:${smtpPort}...`)
const smtpUp = await probeTcp(smtpHost, smtpPort)
if (!smtpUp) {
  console.error(c(RED, `❌ Mailpit SMTP port unreachable at ${smtpHost}:${smtpPort}`))
  console.error(c(YELLOW, '   Start it with: yarn mail'))
  console.error(c(DIM,   '   Or pass --mailpit-smtp=host:port to point at a different catcher.'))
  process.exit(1)
}
console.log(`✓ Mailpit SMTP accepting connections`)

console.log(`🔌 Probing Mailpit HTTP API at ${mailpitHttpBase}...`)
// Mailpit's database can take a beat to open after the SMTP listener
// binds; retry the HTTP probe up to five times before declaring
// unreachable.
let httpUp = false
for (let attempt = 1; attempt <= 5; attempt++) {
  try {
    const res = await fetch(`${mailpitHttpBase}/api/v1/info`, { signal: AbortSignal.timeout(2000) })
    if (res.ok) { httpUp = true; break }
  } catch {
    // fall through to retry
  }
  if (attempt < 5) await sleep(500)
}
if (!httpUp) {
  console.error(c(RED, `❌ Mailpit HTTP API unreachable at ${mailpitHttpBase}/api/v1/info`))
  console.error(c(YELLOW, `   Pass --mailpit-http=http://host:port to point at a different catcher.`))
  process.exit(1)
}
console.log(`✓ Mailpit HTTP API responding`)
console.log('')

// ── Section 1: Mongo connection ──────────────────────────────────
// One `results[]` array covers both sections (Mongo + Email Sends)
// so the summary has a single tally. We declare it before the
// first section so the Mongo push has somewhere to land.
const results = []

// `createRequire` is the standard ESM bridge for CJS deps. Rooted
// at server/package.json so mongoose resolves to
// server/node_modules/mongoose. We load Mongoose + config
// together because both are read together throughout this
// section.
const mongoose = serverRequire('mongoose')
const serverConfig = (await import(pathToFileURL(serverConfigModule).href)).default

// Credentials in the `mongodb…://user:pass@host/db` URI are not
// safe to log; redact them. The hostname + db path stay visible
// so an operator can confirm the dev cluster at a glance.
const redactedMongoUri = serverConfig.mongoUri.replace(/^mongodb(?:\+srv)?:\/\/[^@]+@/, 'mongodb+srv://***@')

console.log('══════════════════════════════════════════════════════')
console.log('Checking Mongo Connection...')
console.log('══════════════════════════════════════════════════════')

const connectStart = Date.now()
try {
  await mongoose.connect(serverConfig.mongoUri, { serverSelectionTimeoutMS: 3000 })
  await mongoose.connection.db.admin().ping()
  const ms = Date.now() - connectStart
  console.log(c(GREEN, `✅ connect (${ms}ms, env=${serverConfig.env})`))
  results.push({ label: 'mongo connect', ok: true })
} catch (err) {
  const ms = Date.now() - connectStart
  console.log(c(RED, `❌ connect failed after ${ms}ms: ${err.message}`))
  console.error(c(DIM,   `   target: ${redactedMongoUri}`))
  console.error(c(YELLOW,'   Update MONGODB_URI in .env.dev or your IP allowlist.'))
  await mongoose.disconnect().catch(() => {})
  results.push({ label: 'mongo connect', ok: false, reason: err.message })
  exitCode = 1
  // Mongo is the only check that produces its own summary here:
  // a connect failure means every later check (email Sends) will
  // fail too because email.js still depends on config.js having
  // loaded, AND the user has explicitly asked the smoke to
  // confirm the dev DB connection before anything else runs.
  // Failing fast gives a clearer signal than cascading.
  process.exit(1)
}

// Roundtrip a real Subscriber doc — exercises the same Mongoose
// model `POST /api/newsletter` uses (schema validation, unique
// email index, timestamp defaults). The smoke OWNS this doc:
// each run deletes any prior marker and writes a fresh one, so
// the dev DB always has exactly one smoke-managed Subscriber.
// After the create we read it back to confirm the round-trip,
// then disconnect — the doc persists in Mongo regardless.
const SMOKE_SUBSCRIBER_EMAIL = 'smoke-marker@robust.computer'
const SubscriberModule = await import(
  pathToFileURL(path.join(repoRoot, 'server/src/models/Subscriber.js')).href
)
const Subscriber = SubscriberModule.default

const rtStart = Date.now()
let priorMarkerCount = 0
try {
  // Delete any prior marker. deleteOne is a no-op when there's
  // no match, so it doubles as the "first run" path. Capture
  // the deletedCount so the log line shows whether we replaced
  // an old marker or wrote fresh.
  const deletion = await Subscriber.deleteOne({ email: SMOKE_SUBSCRIBER_EMAIL })
  priorMarkerCount = deletion.deletedCount || 0

  await Subscriber.create({ email: SMOKE_SUBSCRIBER_EMAIL })
  const read = await Subscriber.findOne({ email: SMOKE_SUBSCRIBER_EMAIL })
  if (!read || read.email !== SMOKE_SUBSCRIBER_EMAIL) {
    throw new Error('created subscriber not found via findOne')
  }
  const ms = Date.now() - rtStart
  const verb = priorMarkerCount > 0 ? 'delete + create + read' : 'create + read'
  console.log(c(GREEN, `✅ subscriber roundtrip (${verb} ${ms}ms, target: ${redactedMongoUri})`))
  results.push({ label: 'mongo subscriber roundtrip', ok: true })
} catch (err) {
  const ms = Date.now() - rtStart
  console.log(c(RED, `❌ subscriber roundtrip failed after ${ms}ms: ${err.message}`))
  results.push({ label: 'mongo subscriber roundtrip', ok: false, reason: err.message })
  exitCode = 1
} finally {
  // Disconnect so we don't hold idle connection sockets open
  // through the rest of the run. The Subscriber doc PERSISTS in
  // Mongo — disconnecting only closes our client connection,
  // it doesn't drop the doc the user asked us to leave behind.
  await mongoose.disconnect().catch(() => {})
}
console.log('')

// If Mongo's connect succeeded but the subscriber roundtrip
// failed, we still proceed to the email checks (the email helpers
// are independent of Mongo). The summary will reflect the
// roundtrip failure.

// ── clear Mailpit inbox ──────────────────────────────────────────────────
// Mailpit's database persists between runs. Clear via the HTTP API so
// the smoke isn't polluted with messages from previous runs — a stale
// "Welcome to Field Notes" would otherwise satisfy the
// subscriber-confirmation check without any code having sent anything.
console.log(c(CYAN, '🧹 Clearing Mailpit inbox before run...'))
const clearRes = await fetchJson(`${mailpitHttpBase}/api/v1/messages`, { method: 'DELETE' })
if (!clearRes.ok) {
  console.error(c(RED, `❌ Failed to clear Mailpit inbox (HTTP ${clearRes.status})`))
  process.exit(1)
}
console.log(c(DIM, '   done'))

// ── import the email module ──────────────────────────────────────────────
// Dynamic import so `import 'nodemailer'` inside email.js resolves
// from `server/node_modules/nodemailer` (Node walks up the tree from
// the imported module's directory). The import's side effects load
// .env.dev via server/src/config.js and create the nodemailer
// transport — same transport `yarn dev` uses.
let emailModule
try {
  emailModule = await import(pathToFileURL(serverEmailModule).href)
} catch (err) {
  console.error(c(RED, '❌ Failed to load server/src/utils/email.js:'))
  console.error(c(RED, `   ${err.message}`))
  console.error(c(DIM, '   Is your .env.dev filled in? config.js requires MONGODB_URI'))
  console.error(c(DIM, '   (the smoke itself doesn\'t touch Mongo, but the email module\'s'))
  console.error(c(DIM, '    import triggers config.js to validate env vars).'))
  process.exit(1)
}

const {
  sendSubscriberConfirmation,
  sendEnquiryNotification,
  sendBugReportNotification,
  sendNewIssueNotification,
} = emailModule

// ── fixtures ─────────────────────────────────────────────────────────────
// Each fixture is a synthetic send. Subjects are whatever the renderer
// in `utils/email/*.js` produces with these inputs — we don't
// parameterize them with a timestamp so the smoke also exercises
// the renderer as part of the assertion (a regression in a renderer
// that changes the subject will surface as a Mailpit miss).
const fixtures = [
  {
    label: 'subscriber confirmation',
    subject: 'Welcome to Field Notes',
    send: () => sendSubscriberConfirmation('smoke-subscriber@robust.computer'),
  },
  {
    label: 'enquiry notification',
    subject: '[Robust Computer] New enquiry from Smoke Tester',
    send: () => sendEnquiryNotification({
      name: 'Smoke Tester',
      email: 'smoke-enquiry@robust.computer',
      company: 'Smoke Co',
      projectType: 'webapp',
      budget: '5k_15k',
      message: 'Smoke test enquiry — verifying the enquirer email renders end-to-end through Mailpit.',
    }),
  },
  {
    label: 'bug report notification',
    subject: '[Robust Computer] Bug report from Smoke Tester',
    send: () => sendBugReportNotification({
      name: 'Smoke Tester',
      email: 'smoke-reporter@robust.computer',
      whatWereYouDoing: 'Running yarn smoke:server',
      whatExpected: 'A clean bug-report email captured by Mailpit',
      whatHappened: 'No crash (this is the success case)',
      browserDevice: `Node ${process.version} / smoke:server`,
    }),
  },
  {
    label: 'new issue notification',
    subject: 'Issue 999: Smoke test issue',
    send: () => sendNewIssueNotification({
      email: 'smoke-subscriber@robust.computer',
      issue: {
        slug: 'smoke-issue-999',
        issuePrefix: 'Issue 999',
        title: 'Smoke test issue',
        description: 'A synthetic issue used to verify the new-issue notification path during yarn smoke:server.',
        url: 'http://localhost:3000/field-notes/smoke-issue-999',
      },
    }),
  },
]

// ── per-helper check ─────────────────────────────────────────────────────
// Call the helper, then poll Mailpit's search API for the expected
// subject. Polling for up to POLL_TIMEOUT_MS keeps a slow CI box
// from false-negative-ing (a typical submission lands in <100ms).
const POLL_INTERVAL_MS = 100
const POLL_TIMEOUT_MS = 3000

const searchSubject = async (subject) => {
  // `query=subject:"<exact>"` is Mailpit's exact-match form for the
  // search endpoint. URLSearchParams handles the quoting/encoding of
  // the spaces and colons that appear in subjects (e.g.
  // "Issue 999: Smoke test issue"). Returning [] when the API call
  // itself fails (non-2xx, network error) lets the polling loop
  // treat it identically to "found nothing yet".
  const params = new URLSearchParams({ query: `subject:"${subject}"` })
  try {
    const res = await fetch(`${mailpitHttpBase}/api/v1/search?${params}`)
    if (!res.ok) return []
    const body = await res.json()
    return Array.isArray(body.messages) ? body.messages : []
  } catch {
    return []
  }
}

const awaitMessage = async (subject) => {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  let lastTotalHits = 0
  while (Date.now() < deadline) {
    const hits = await searchSubject(subject)
    lastTotalHits = hits.length
    if (hits.length > 0) return { ok: true, hits: hits.length }
    await sleep(POLL_INTERVAL_MS)
  }
  return { ok: false, hits: lastTotalHits }
}

console.log('')
console.log('══════════════════════════════════════════════════════')
console.log('Checking Email Sends...')
console.log('══════════════════════════════════════════════════════')

for (const fixture of fixtures) {
  try {
    await fixture.send()
  } catch (err) {
    console.log(c(RED,   `❌ ${fixture.label.padEnd(28)} (subject: ${fixture.subject}) — helper threw: ${err.message}`))
    results.push({ label: fixture.label, subject: fixture.subject, ok: false, reason: `helper threw: ${err.message}` })
    failures.push(`${fixture.label}: helper threw — ${err.message}`)
    exitCode = 1
    continue
  }

  const { ok, hits } = await awaitMessage(fixture.subject)
  if (ok) {
    console.log(c(GREEN, `✅ ${fixture.label.padEnd(28)} (subject: ${fixture.subject})`))
    results.push({ label: fixture.label, subject: fixture.subject, ok: true, hits })
  } else {
    console.log(c(RED,   `❌ ${fixture.label.padEnd(28)} (subject: ${fixture.subject}) — no match in Mailpit within ${POLL_TIMEOUT_MS}ms`))
    results.push({ label: fixture.label, subject: fixture.subject, ok: false, reason: `no Mailpit match within ${POLL_TIMEOUT_MS}ms` })
    failures.push(`${fixture.label}: no Mailpit match (subject "${fixture.subject}")`)
    exitCode = 1
  }
}

// ── summary ──────────────────────────────────────────────────────────────
const passed = results.filter((r) => r.ok).length
const failed = results.filter((r) => !r.ok).length
const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

console.log('')
console.log('══════════════════════════════════════════════════════')
console.log(`Summary:  ${passed}/${results.length} check(s) passed`)
if (failed === 0) {
  console.log('✅ All checks passed.')
} else {
  console.log(c(RED, `❌ ${failed} check(s) failed`))
}
console.log(`Done in ${elapsed}s`)

if (failures.length > 0) {
  console.log('')
  for (const f of failures) console.log(c(DIM, `  - ${f}`))
}

process.exit(exitCode)
