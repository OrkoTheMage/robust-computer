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
 *   dynamically from `data/feed.js` so a new post
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

// Pull per-post routes from the `feed` data so a new post is
// prerendered automatically. Importing this module pulls in
// `marked`, `DOMPurify`, and the markdown block parser via
// the build chain — same transitive deps the repo-root
// `scripts/build-issue-cards.mjs` uses, so the prerendered
// HTML always reflects the same source-of-truth the live
// page does. The array is `feed`.
const { feed } = await import(
  pathToFileURL(path.join(repoRoot, 'src/data/feed.js')).href
)
const postRoutes = feed.map((post) => `/field-notes/${post.slug}`)

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

// ── critical-CSS extraction ────────────────────────────────────────────
// Walks `document.styleSheets` in the rendered page and
// returns every readable CSS rule as a single string.
//
// Why this exists
//   The deferred stylesheet at `/assets/index-*.css` only
//   contains the static CSS (`:root`, `@font-face`, body,
//   highlight.js, resets) — emotion inserts the dynamic
//   `.css-XXXX` class rules at runtime via `insertRule()`
//   into a single `<style data-emotion>` tag in the head.
//   In speedy mode (the default) those rules live in the
//   CSSOM, not in the style tag's `textContent`, so the
//   captured `page.content()` only ever contains an empty
//   `<style data-emotion="css" data-s="">` placeholder.
//
//   Without inlining, the prerendered HTML serves the
//   React tree (every `class="css-XXX"` and the body's
//   styled wrappers) before the deferred stylesheet
//   finishes loading. First paint falls back to the user-
//   agent stylesheet: SVGs render at their natural 512×512
//   size (no `img,svg { max-width: 100% }` reset), the
//   body keeps the UA-default grey instead of `--paper`,
//   and the flex/grid containers collapse so all the
//   `<img>` siblings stack vertically.
//
//   We extract every rule from `document.styleSheets`
//   after the page settles, concatenate them in document
//   order, and inline the result into `<head>` of the
//   captured HTML. The bundle ends up inlined into the
//   rendered HTML (a few KB per route), the deferred
//   `<link>` is removed because it would otherwise
//   double-load the same rules, and first paint shows the
//   styled layout immediately.
//
// Cross-origin sheets (none today) are skipped on
// `SecurityError` — we only inline same-origin CSS.
const extractCriticalCss = (page) =>
  page.evaluate(() => {
    let css = ''
    for (const sheet of document.styleSheets) {
      let rules
      try {
        rules = sheet.cssRules
      } catch {
        // CORS-blocked cross-origin sheet — skip it. The
        // render only matters for same-origin rules the
        // browser would have applied at first paint; cross-
        // origin sheets arrive async and aren't part of the
        // critical path either way.
        continue
      }
      for (const rule of rules) {
        css += rule.cssText + '\n'
      }
    }
    return css
  })

// ── capture one route ───────────────────────────────────────────────────
// Loads the URL in a headless browser, waits for React to
// mount + the SEO component's `useEffect` to fire, then
// captures both the rendered HTML and the live CSS rules.
//
// `waitForFunction` polls the meta[property="og:title"] tag
// for the brand-prefixed title (every page sets
// `${BASE}BR - <title>` so the og:title always starts
// with "Robust Computer"). When that's true, the SEO
// component has run and the meta tags are stable.
//
// Returns `{ html, css }`. `css` is the concatenated
// `cssText` of every same-origin stylesheet on the page at
// capture time (emotion-injected rules + the contents of
// `/assets/index-*.css`) — see `extractCriticalCss` for why
// this is read from `document.styleSheets` rather than
// scraped out of the existing `<style>` tags.
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
  // Capture HTML + CSS in parallel. They're independent
  // pulls on the same page session — running them
  // concurrently shrinks the total prerender time.
  const [html, css] = await Promise.all([
    page.content(),
    extractCriticalCss(page),
  ])
  return { html, css }
}

// ── main flow ───────────────────────────────────────────────────────────
const run = async () => {
  console.log(`▸ starting vite preview server`)
  const { child: server, port } = await startPreviewServer()
  console.log(`▸ preview ready on http://127.0.0.1:${port}`)

  // Lazy-import the headless-browser stack so the
  // `--dry-run` path doesn't pay the (heavy)
  // browser-dependency startup cost. We use
  // `puppeteer-core` (no auto-downloaded Chrome) +
  // `@sparticuz/chromium` (bundles Chrome + all required
  // system libraries into a single executable).
  //
  // Why `@sparticuz/chromium`: the build machine (Vercel,
  // and most CI containers) doesn't have the system
  // libraries Chrome expects (`libnspr4.so`, `libnss3.so`,
  // `libatk`, …) so the bundled Chromium fails to launch
  // with `error while loading shared libraries`. The
  // sparticuz Chromium is built specifically for these
  // restricted environments — it bundles every dynamic
  // library the binary needs into one executable, so the
  // same script runs locally and on Vercel without any
  // apt-get / system-package step.
  //
  // `chromium.executablePath()` resolves to the bundled
  // binary inside `node_modules/@sparticuz/chromium/`;
  // `chromium.args` are the CLI flags the binary expects
  // on restricted environments. On a normal dev machine
  // the same executable launches fine — the script stays
  // identical across environments.
  const [{ default: puppeteer }, { default: chromium }] = await Promise.all([
    import('puppeteer-core'),
    import('@sparticuz/chromium'),
  ])

  let browser
  try {
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
      ],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
    const page = await browser.newPage()

    for (const route of routes) {
      const url = `http://127.0.0.1:${port}${route}`
      const outPath = route === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, route, 'index.html')

      console.log(`▸ ${route}: capturing → ${path.relative(repoRoot, outPath)}`)
      const { html, css } = await captureRoute(page, url)

      // Inline critical CSS into `<head>` so the first
      // paint already has the styled layout. Without this,
      // the prerendered HTML serves the React tree with
      // `css-XXXX` classes before the deferred
      // `/assets/index-*.css` finishes loading — a grey
      // background, all SVGs at natural size, no flex/grid
      // layout. See `extractCriticalCss` for the full story.
      //
      // The inline block is injected with a `data-` marker
      // so future debugging / diff tools can spot the
      // prerendered CSS in the served HTML.
      //
      // The deferred `<link rel="stylesheet" href="/assets/
      // index-*.css">` is stripped at the same time because
      // its rules are now inlined — leaving it would double-
      // load the same bytes and waste a network round-trip
      // on every prerendered page.
      let out = html
      if (css) {
        out = out.replace(
          /<link rel="stylesheet"[^>]*\/assets\/index-[^>]*>\n?/,
          '',
        )
        out = out.replace(
          /<\/head>/i,
          `<style data-prerendered-critical>${css}</style></head>`,
        )
      }
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, out)
      console.log(
        `✓ Wrote ${path.relative(repoRoot, outPath)} (${out.length} bytes, ${css.length} bytes inlined CSS)`,
      )
    }
  } finally {
    if (browser) {
      try { await browser.close() } catch {}
    }
    await stopPreviewServer(server)
  }
}

await run()