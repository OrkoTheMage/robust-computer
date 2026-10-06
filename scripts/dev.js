#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const net = require('node:net')
const concurrently = require('concurrently')

/**
 * Wrapper around the root `yarn dev` that lets you choose which env file
 * (.env.dev or .env.prod) the sub-projects load at boot.
 *
 *   yarn dev                # default — loads .env.dev
 *   yarn dev:prod           # load .env.prod everywhere — server talks to prod DB
 *
 * What it does:
 *   - Sets NODE_ENV for the server, which makes server/src/config.js pick
 *     .env.prod (otherwise it picks .env.dev).
 *   - Passes --mode dev|prod to the Vite app, which makes Vite pick
 *     .env.dev or .env.prod from the repo root (vite.config.js sets
 *     `envDir: '../'`).
 *   - Pre-flight checks that 3000 and 5000 are both free before
 *     spawning anything. Without this, a busy port surfaces as a
 *     cryptic Vite "address already in use" (landing) or a silent
 *     fallback that breaks the /api proxy wiring.
 *   - Allocates the server port up front and injects PORT into every
 *     child's env, so Vite's `/api` proxy (which reads
 *     `process.env.PORT || 5000`) always points at the port the
 *     server actually bound to.
 *   - Prints a colored banner with the Mongo DB name + every port
 *     parsed from the chosen env file, so you can see which DB and
 *     which ports you're about to hit before any process connects.
 *
 * Override individual vars from your shell as usual, e.g.:
 *   VITE_API_URL= yarn dev:prod   # override one var, keep the rest of .env.prod
 */

// Default ports. Mirrors `port:` in landing/vite.config.js (3000)
// and the `PORT` fallback in server/src/config.js (5000). Change
// one, change them all. `PORT` from the user's shell still wins for
// the server; landing is intentionally fixed because silently moving
// it would orphan the developer's open browser tabs.
const DEFAULT_SERVER_PORT = 5000
const LANDING_DEV_PORT = 3000

// Bind a probe socket to `port` to verify it's free before spawning
// the children. Bind to 0.0.0.0 so we don't get fooled by IPv4/IPv6
// binding differences (binding only to 127.0.0.1 would say the port
// is free when in fact something else on the host has it on the
// wildcard). There's a tiny TOCTOU race between this check and the
// children binding it; acceptable for dev.
const assertPortFree = (port, label) => new Promise((resolve, reject) => {
  const tester = net.createServer()
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const tag = label ? `${label} (port ${port})` : `Port ${port}`
        const override = port === DEFAULT_SERVER_PORT
          ? `, or pick a different port with:  PORT=<free-port> yarn dev`
          : ''
        reject(new Error(
          `${tag} is already in use.\n` +
          `  Find the holder with:  lsof -i :${port}  (or)  ss -tlnp | grep :${port}\n` +
          `  Stop it${override}`
        ))
      } else {
        reject(err)
      }
    })
    .once('listening', () => tester.close(() => resolve()))
    .listen(port, '0.0.0.0')
})

async function main() {
  // ── arg parsing ────────────────────────────────────────────────────────
  const args = process.argv.slice(2)

  let env = 'dev'
  const eqFlag = args.find((a) => a.startsWith('--env='))
  if (eqFlag) {
    env = eqFlag.slice('--env='.length)
  } else {
    const idx = args.indexOf('--env')
    if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
      env = args[idx + 1]
    }
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
  Usage: yarn dev [--env=<dev|prod>]

  Options:
    --env=dev   Load .env.dev for server + Vite (default)
    --env=prod  Load .env.prod for server + Vite (server talks to prod DB)
    --help, -h  Show this message
`)
    process.exit(0)
  }

  if (!['dev', 'prod'].includes(env)) {
    console.error(`\n  ❌ Invalid --env value: "${env}". Use "dev" or "prod".\n`)
    process.exit(1)
  }

  // ── banner ─────────────────────────────────────────────────────────────
  const RESET = '\x1b[0m'
  const BRIGHT = '\x1b[1m'
  const RED_BG = '\x1b[41m\x1b[97m'
  const BLUE_BG = '\x1b[44m\x1b[97m'
  const DIM = '\x1b[2m'
  const YELLOW = '\x1b[33m'

  const bg = env === 'prod' ? RED_BG : BLUE_BG
  console.log(`${bg}${BRIGHT}  ${env.toUpperCase()} ENV  ${RESET}`)

  // Parse MONGODB_URI from the chosen env file so the user can see
  // which DB they're about to hit. Pure read — no env vars are
  // actually set here.
  const envFile = path.resolve(__dirname, '..', `.env.${env}`)
  let dbName = '(unknown)'
  try {
    const content = fs.readFileSync(envFile, 'utf8')
    const m = content.match(
      /^MONGODB_URI\s*=\s*mongodb(?:\+srv)?:\/\/[^/?]+\/([^?\s]+)/m,
    )
    if (m) dbName = m[1]
  } catch {
    dbName = `(${path.basename(envFile)} not found)`
  }

  // Resolve the server port. `PORT` from the user's shell wins
  // otherwise we use the default. We DO NOT walk to the next free
  // port — Vite's proxy reads this exact value, so a silent
  // re-allocation would break the wiring. If the requested port is
  // in use, the user sees a clear error and can either stop the
  // conflicting process or pick a different port via `PORT=`.
  const serverPort = parseInt(process.env.PORT, 10) || DEFAULT_SERVER_PORT

  // Pre-flight: probe every port we're about to bind, in order, so
  // we fail loud on the first conflict instead of letting the
  // children race each other (or worse, silently re-allocate and
  // leave stale browser tabs). Sequential so the user sees one
  // clear error at a time.
  await assertPortFree(LANDING_DEV_PORT, 'landing dev port')
  await assertPortFree(serverPort, 'server port')

  const lines = [
    `  ${DIM}server   ← .env.${env} → MONGODB_URI .../${dbName}, port ${serverPort}${RESET}`,
    `  ${DIM}landing  ← vite --mode ${env} on port ${LANDING_DEV_PORT} (loads .env.${env})${RESET}`,
  ]
  if (env === 'prod') {
    lines.push(`  ${YELLOW}⚠  pointing at production — destructive ops are your responsibility${RESET}`)
  }
  console.log(lines.join('\n'))
  console.log()

  // ── spawn ──────────────────────────────────────────────────────────────
  // NODE_ENV is the conventional `production`/`development`, while
  // our CLI flag is `prod`/`dev`. Map them so the server's
  // config.js (which checks `NODE_ENV === 'production'`) picks the
  // right env file.
  const nodeEnv = env === 'prod' ? 'production' : 'development'
  // Inject PORT so the server binds to the port we just allocated
  // AND Vite's /api proxy (which reads `process.env.PORT || 5000`)
  // points at it. `dotenv.config()` in server/src/config.js leaves
  // any pre-existing PORT in process.env alone, so this wins over
  // the value baked into .env.dev.
  const childEnv = { ...process.env, NODE_ENV: nodeEnv, PORT: String(serverPort) }

  const { result } = concurrently(
    [
      {
        command: `node_modules/.bin/vite --mode ${env}`,
        name: 'landing',
        cwd: 'landing',
        env: childEnv,
        prefixColor: 'cyan',
      },
      {
        command: 'node --import ./scripts/sync-version.mjs --watch src/index.js',
        name: 'server',
        cwd: 'server',
        env: childEnv,
        prefixColor: 'yellow',
      },
    ],
    { timestampFormat: 'HH:mm:ss' },
  )

  result.then(
    () => process.exit(0),
    () => process.exit(1),
  )
}

main().catch((err) => {
  console.error('\n  ❌ dev script failed:', err.message, '\n')
  process.exit(1)
})
