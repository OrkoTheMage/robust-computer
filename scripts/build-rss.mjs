#!/usr/bin/env node
'use strict'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/**
 * Regenerate the Field Notes feed files from the array in
 * `landing/src/data/fieldNotes.js`. By default writes all four:
 *
 *   landing/public/rss.xml       — full feed, RSS 2.0 XML
 *   landing/public/feed.txt      — full feed, plain text
 *   landing/public/latest.xml    — latest post only, RSS 2.0 XML
 *   landing/public/latest.txt    — latest post only, plain text
 *
 * The `latest.*` pair is the public link target for "ping me
 * when there's a new post" — feed readers and one-off
 * subscribers can poll a tiny file instead of re-parsing the
 * whole archive. The `rss.xml` / `feed.txt` pair stays the
 * full archive for readers that want the back catalog.
 *
 * All four files are committed artifacts; consumers don't
 * have to ship a build step. Run this script after adding or
 * editing a post and commit the result.
 *
 * After writing the feed files, the script fires a
 * `POST /api/newsletter/broadcast` against the running
 * server if `API_URL` and `NEWSLETTER_ADMIN_SECRET` are in
 * the environment. The server queues a broadcast to every
 * active subscriber who hasn't received the latest slug yet
 * (see `server/src/utils/newsletterBroadcast.js`). The
 * broadcast itself is async — the script returns as soon as
 * the server returns 202, and the server logs progress from
 * then on.
 *
 * Env loading is a tiny inline parser (KEY=value lines, no
 * quoting) so the script doesn't need dotenv as a transitive
 * dependency — the server already requires it, but it's not
 * hoisted to the root node_modules. `.env.<NODE_ENV>` is
 * loaded if it exists, but only for keys that aren't already
 * in `process.env` (shell-set vars win). When
 * `NODE_ENV === 'production'` it loads `.env.prod`;
 * otherwise `.env.dev`. Both files are gitignored.
 *
 * Usage:
 *   node scripts/build-rss.mjs                # write all four files + broadcast
 *   node scripts/build-rss.mjs --xml-only     # only the XML files
 *   node scripts/build-rss.mjs --txt-only     # only the TXT files
 *   node scripts/build-rss.mjs --full-only    # skip the latest only
 *   node scripts/build-rss.mjs --latest-only  # skip the full files
 *   node scripts/build-rss.mjs --no-write     # skip file writes (broadcast only)
 *   node scripts/build-rss.mjs --no-broadcast # skip the broadcast (build only)
 *   node scripts/build-rss.mjs --dry-run      # print everything to stdout
 *
 * `--no-write` and `--no-broadcast` are independent of the
 * format/variant flags and compose with them. They're how the
 * yarn aliases split the two concerns:
 *   - `feeds:build`         — pre-commit, write files only
 *   - `feeds:broadcast-dev` — dev send, broadcast only
 *   - `feeds:broadcast`     — prod send, broadcast only
 *
 * Format flags and variant flags compose: `--xml-only
 * --latest-only` writes only `latest.xml`. `--full-only
 * --xml-only` writes only `rss.xml`.
 *
 * Why not a Vite plugin: the public folder is served as-is
 * (no transform), and a regen step at edit time is more
 * auditable than a side-effect at bundle time.
 *
 * The data module is intentionally self-contained (it does not
 * import from `landing/src/config.js`), so it loads cleanly in
 * raw Node without needing the Vite-specific `import.meta.env`
 * shim.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

// ── arg parsing ──────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const xmlOnly = args.includes('--xml-only')
const txtOnly = args.includes('--txt-only')
const fullOnly = args.includes('--full-only')
const latestOnly = args.includes('--latest-only')
const noWrite = args.includes('--no-write')
const noBroadcast = args.includes('--no-broadcast')

// `--xml-only` and `--txt-only` are mutually exclusive; if
// neither is set we write both formats.
const writeXml = !txtOnly
const writeTxt = !xmlOnly

// `--full-only` and `--latest-only` are mutually exclusive; if
// neither is set we write both variants.
const writeFull = !latestOnly
const writeLatest = !fullOnly

// ── env loading ──────────────────────────────────────────────────────────
// Tiny inline .env parser. Reads KEY=value lines, ignores
// comments and blank lines, doesn't quote. Only sets a key if
// it's not already in process.env (shell wins). NODE_ENV
// picks which file to load: production -> .env.prod, anything
// else -> .env.dev.
const NODE_ENV = process.env.NODE_ENV || 'development'
const envFileName = NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
const envFilePath = path.join(repoRoot, envFileName)

if (fs.existsSync(envFilePath)) {
  const content = fs.readFileSync(envFilePath, 'utf8')
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    if (!key || key in process.env) continue
    process.env[key] = line.slice(eq + 1).trim()
  }
}

// ── dynamic import of the data module ────────────────────────────────────
// Both modules load cleanly in raw Node — they have no Vite-specific
// `import.meta.env` reads, so the regen script doesn't need the Vite
// shim. `BRAND_DOMAIN` is imported from `data/brand.js` (the single
// source of truth for brand strings); the field-notes module re-exports
// nothing we need beyond the builders and `getLatest`.
const fieldNotesPath = path.join(
  repoRoot,
  'landing/src/data/fieldNotes.js',
)
const brandPath = path.join(
  repoRoot,
  'landing/src/data/brand.js',
)
const { buildRss, buildFeedTxt, getLatest } = await import(
  pathToFileURL(fieldNotesPath).href
)
const { BRAND_DOMAIN } = await import(pathToFileURL(brandPath).href)

// Latest post as a one-element array. `getLatest()` returns
// null if the data is empty; fall back to an empty array so
// the builders still emit a well-formed (but item-less) feed
// rather than throwing.
const latestNote = getLatest()
const latestNotes = latestNote ? [latestNote] : []

// ── build the (path, content) pairs we'll write ─────────────────────────
// Each pair is independent so --dry-run can print them all
// and any combination of format/variant flags just narrows
// the list.
const files = []

if (writeFull) {
  if (writeXml) files.push(['landing/public/rss.xml', buildRss()])
  if (writeTxt) files.push(['landing/public/feed.txt', buildFeedTxt()])
}
if (writeLatest) {
  if (writeXml) files.push(['landing/public/latest.xml', buildRss(latestNotes)])
  if (writeTxt) files.push(['landing/public/latest.txt', buildFeedTxt(latestNotes)])
}

if (dryRun) {
  files.forEach(([rel, content], i) => {
    if (i > 0) process.stdout.write('\n')
    process.stdout.write(`── ${rel}\n`)
    process.stdout.write(content)
  })
  process.exit(0)
}

// ── write ────────────────────────────────────────────────────────────────
if (noWrite) {
  console.log('⊘ File writes skipped (--no-write)')
} else {
  for (const [rel, content] of files) {
    const outPath = path.resolve(repoRoot, rel)
    fs.writeFileSync(outPath, content, 'utf8')
    console.log(`✓ Wrote ${path.relative(repoRoot, outPath)}`)
  }
}

// ── broadcast ───────────────────────────────────────────────────────────
// Fires `POST /api/newsletter/broadcast` against the running
// server if the env has `API_URL` and `NEWSLETTER_ADMIN_SECRET`.
// Skipped silently otherwise (a quick local regen doesn't need
// to email every subscriber, and a CI without those vars just
// regenerates feeds without broadcasting).
//
// The broadcast is best-effort — failure logs a warning but
// doesn't fail the build. The feed files are already on disk;
// whether the email blast lands is a separate concern that
// the server's own run summary reports.
const apiUrl = process.env.API_URL
const adminSecret = process.env.NEWSLETTER_ADMIN_SECRET

if (noBroadcast) {
  console.log('⊘ Broadcast skipped (--no-broadcast)')
} else if (latestNote && apiUrl && adminSecret) {
  const url = `https://${BRAND_DOMAIN}/field-notes/${latestNote.slug}`
  const payload = {
    slug: latestNote.slug,
    issuePrefix: latestNote.issuePrefix,
    title: latestNote.title,
    description: latestNote.description,
    pubDate: latestNote.pubDate,
    url,
    ...(latestNote.author ? { author: latestNote.author } : {}),
  }
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/newsletter/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': adminSecret,
      },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      console.log(`✓ Broadcast queued for ${latestNote.slug} (HTTP ${res.status})`)
    } else {
      let detail = ''
      try {
        detail = await res.text()
      } catch {
        // ignore — non-JSON body, status code is enough
      }
      console.warn(
        `⚠ Broadcast endpoint returned ${res.status}: ${detail || '(no body)'}`
      )
    }
  } catch (err) {
    console.warn(`⚠ Broadcast request failed: ${err.message}`)
  }
} else if (latestNote && (!apiUrl || !adminSecret)) {
  console.log(
    '⊘ Broadcast skipped (set API_URL + NEWSLETTER_ADMIN_SECRET to enable)'
  )
}