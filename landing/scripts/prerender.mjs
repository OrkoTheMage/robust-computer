#!/usr/bin/env node
'use strict'

import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

/**
 * Pre-render every public route's `<head>` at build time
 * so social-platform crawlers see the right Open Graph /
 * Twitter Card meta tags without executing JavaScript.
 *
 * Why this exists
 *   Vite's default SPA build emits a single `index.html`
 *   that React mounts into client-side. The `<meta>`
 *   tags in that file are the home-page defaults — every
 *   route serves the same head until React mounts and the
 *   SEO component overwrites the tags via `useEffect`.
 *   Twitter, Facebook, LinkedIn, Discord, WhatsApp, and
 *   most other crawlers fetch the page server-side and
 *   never wait for JavaScript, so they read the static
 *   head and use the home-page card for every URL. That
 *   breaks the per-post social preview that Chunk 3 was
 *   supposed to deliver.
 *
 *   This script runs after `vite build`, spins up
 *   `vite preview` against the freshly built `dist/`,
 *   drives a headless browser through every public route,
 *   and writes the React-mounted HTML (with the SEO
 *   component's per-page meta tags baked into `<head>`)
 *   back to `dist/<route>/index.html`. Vercel then serves
 *   the pre-rendered file at the matching URL, and the
 *   crawlers see per-page meta tags directly.
 *
 * Routes
 *   The list below is the SEO-relevant subset of
 *   `src/App.jsx`'s `<Route>` declarations. Skipped
 *   on purpose:
 *
 *     - `/unsubscribe`  — utility route, no social sharing,
 *                         never gets a per-page meta tag.
 *     - `/bug-report`   — same; utility.
 *     - `*`             — catch-all 404, never indexed.
 *
 *   Per-post pages (`/field-notes/<slug>`) are pulled
 *   dynamically from `data/fieldNotes.js` so a new post
 *   is prerendered automatically once it's added there.
 *
 * Build pipeline
 *   Wired into `landing/package.json`'s `build` script:
 *
 *     "build": "vite build --mode prod && node ./scripts/prerender.mjs"
 *
 *   Vercel's project is rooted at `landing/`, so its
 *   install picks up `puppeteer` and `yauzl` from this
 *   package's `devDependencies` — that's why those two
 *   packages live here and not in the repo root. The
 *   build runs Vite, then runs this script against the
 *   freshly-built `dist/`. No separate deploy step — the
 *   prerendered HTML files are part of the bundle Vercel
 *   ships.
 *
 * Idempotency
 *   Puppeteer is deterministic given the same input +
 *   same Chromium version, so the bytes are stable across
 *   reruns. The script overwrites any existing
 *   `<route>/index.html` rather than diffing, so a partial
 *   previous run doesn't leave stale files behind.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const distDir = path.join(repoRoot, 'dist')

// ── guards ──────────────────────────────────────────────────────────────
if (!fs.existsSync(distDir)) {
  console.error(`error: ${distDir} does not exist. Run \`vite build\` first.`)
  process.exit(1)
}

// ── arg parsing ──────────────────────────────────────────────────────────
const hasFlag = (name) => process.argv.includes(`--${name}`)
const dryRun = hasFlag('dry-run')

// ── routes to prerender ─────────────────────────────────────────────────
// Static SEO routes. Pulled from the `<Route>` declarations
// in `src/App.jsx`; see the file-level comment for the
// rationale on which routes are skipped.
const STATIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/field-notes',
]

// Pull per-post routes from the field-notes data so a new
// post is prerendered automatically. Importing this module
// pulls in `marked`, `DOMPurify`, and the markdown block
// parser via the build chain — same transitive deps the
// repo-root `scripts/build-issue-cards.mjs` uses, so the
// prerendered HTML always reflects the same source-of-truth
// the live page does.
const { fieldNotes } = await import(
  pathToFileURL(path.join(repoRoot, 'src/data/fieldNotes.js')).href
)
const postRoutes = fieldNotes.map((n) => `/field-notes/${n.slug}`)

const routes = [...STATIC_ROUTES, ...postRoutes]

if (dryRun) {
  for (const route of routes) {
    console.log(`── dist${route === '/' ? '/index.html' : `${route}/index.html`}`)
  }
  process.exit(0)
}

// ── free-port helper (same shape as build-issue-cards.mjs) ─────────────
const getFreePort = async () =>
  new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
  })

// Probe the preview server until it responds. Vite's
// preview is a thin static server; once it binds, every
// route returns 200 (with SPA fallback to `index.html`
// for routes that haven't been pre-rendered yet).
const waitForUrl = async (url, { timeoutMs = 30_000 } = {}) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok || res.status < 500) return
    } catch {
      // not yet
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`preview server did not respond at ${url} within ${timeoutMs}ms`)
}

// ── vite preview lifecycle ─────────────────────────────────────────────
// `vite preview` serves `dist/` with SPA fallback to
// `index.html`. We invoke it via yarn so the bin resolution
// picks up the right copy from `node_modules/vite/` (Vite
// is a dep of this package, not of the repo root).
const startPreviewServer = async () => {
  const port = await getFreePort()
  const child = spawn(
    'yarn',
    ['preview', '--port', String(port), '--host', '127.0.0.1'],
    {
      cwd: path.join(repoRoot),
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  child.stdout.on('data', () => {})  // swallow Vite's noise
  child.stderr.on('data', () => {})
  await waitForUrl(`http://127.0.0.1:${port}/`)
  return { child, port }
}

const stopPreviewServer = (child) =>
  new Promise((resolve) => {
    if (!child || child.killed) return resolve()
    const killTimer = setTimeout(() => {
      try { child.kill('SIGKILL') } catch {}
      resolve()
    }, 5000)
    child.once('exit', () => {
      clearTimeout(killTimer)
      resolve()
    })
    try { child.kill('SIGTERM') } catch {}
  })

// ── capture one route ───────────────────────────────────────────────────
// Loads the URL in a headless browser, waits for React to
// mount + the SEO component's `useEffect` to fire, then
// captures the rendered HTML. The captured HTML includes
// the per-page meta tags (og:*, twitter:*, title,
// description, canonical, JSON-LD) and the React-rendered
// body.
//
// `waitForFunction` polls the meta[property="og:title"] tag
// for the brand-prefixed title (every page sets
// `${BASE}BR - <title>` so the og:title always starts
// with "Robust Computer"). When that's true, the SEO
// component has run and the meta tags are stable.
const captureRoute = async (page, url) => {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(
    () => {
      const og = document.head.querySelector('meta[property="og:title"]')
      return og && og.getAttribute('content').startsWith('Robust Computer')
    },
    { timeout: 10_000 },
  )
  // One more tick so any layout shifts after `useEffect`
  // settle before the snapshot is taken. Per-route
  // screenshots aren't the goal here, but a few extra ms
  // keep the React tree consistent with what crawlers see.
  await new Promise((resolve) => setTimeout(resolve, 50))
  return page.content()
}

// ── main flow ───────────────────────────────────────────────────────────
const run = async () => {
  console.log(`▸ starting vite preview server`)
  const { child: server, port } = await startPreviewServer()
  console.log(`▸ preview ready on http://127.0.0.1:${port}`)

  // Lazy-import puppeteer so this script's `--dry-run`
  // path doesn't pay the (heavy) browser-dependency
  // startup cost. The dep tree is the same as
  // `scripts/build-issue-cards.mjs`; both ship under the
  // repo-root `puppeteer` devDependency.
  const { default: puppeteer } = await import('puppeteer')

  let browser
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()

    for (const route of routes) {
      const url = `http://127.0.0.1:${port}${route}`
      const outPath = route === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, route, 'index.html')

      console.log(`▸ ${route}: capturing → ${path.relative(repoRoot, outPath)}`)
      const html = await captureRoute(page, url)
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, html)
      console.log(`✓ Wrote ${path.relative(repoRoot, outPath)} (${html.length} bytes)`)
    }
  } finally {
    if (browser) {
      try { await browser.close() } catch {}
    }
    await stopPreviewServer(server)
  }
}

await run()