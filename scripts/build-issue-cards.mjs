#!/usr/bin/env node
'use strict'

import fs from 'node:fs'
import net from 'net'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

/**
 * Regenerate the per-issue Open Graph and Twitter cards by
 * screenshotting the live article page with a headless
 * browser. Each card is a real snapshot of the post itself
 * — captured from `/field-notes/<slug>/` after React mounts
 * and fonts load, framed for the platform's preview crop.
 *
 *   landing/public/field-notes/<slug>/og.png      — 1200×630, OG / Facebook / LinkedIn / Slack
 *   landing/public/field-notes/<slug>/twitter.png — 1200×675, Twitter summary_large_image
 *
 * Both files are committed artifacts, same pattern as the
 * rss/feed/sitemap files written by `scripts/build-rss.mjs`
 * — consumers don't ship a build step.
 *
 * `scripts/build-rss.mjs` invokes this script as part of
 * its regen flow (pre-commit + post-deploy), so editing a
 * post's title / issuePrefix / pubDate / body and running
 * `yarn feeds:build` is enough to refresh every public
 * surface (RSS, plain-text, sitemap, OG, Twitter). The
 * script can also be run on its own:
 *
 *   node scripts/build-issue-cards.mjs            # every issue
 *   node scripts/build-issue-cards.mjs --slug=<slug>  # one issue
 *   node scripts/build-issue-cards.mjs --dry-run   # preview without writing
 *
 * Why the two ratios stay separate (and not a single
 * `og.png` reused for both): OG / Facebook / LinkedIn /
 * Slack crop to 1.91:1 (1200×630) while Twitter
 * summary_large_image crops to 1.78:1 (1200×675). Sharing
 * one file means one platform gets a letterbox / crop the
 * other doesn't — the SEO component's `twitterImage` prop
 * is independent for the same reason, see
 * `landing/src/components/seo/SEO.jsx`.
 *
 * Why a real browser rather than an SVG composite
 *   An earlier version of this script generated an SVG
 *   that re-typed the article's title and lede in the
 *   brand style. The result looked like a "designed
 *   preview" but it was not the page — it was a
 *   stylization. The cards now capture the actual page:
 *   the HeaderBox (kicker chip + display title + publish
 *   date) and the Sheet (rendered markdown body) come
 *   from the same React tree a reader sees when they visit
 *   /field-notes/<slug>/, so the social-card preview
 *   matches the page pixel-for-pixel (modulo font
 *   sub-pixel rendering, which Chromium is consistent
 *   about across runs).
 *
 * What gets hidden before the screenshot
 *   The article page has surrounding chrome that doesn't
 *   belong on a social card: the site Navbar (`<nav>`),
 *   the page-level PageHeader (`<header>`, which carries
 *   the "FIELD NOTES" eyebrow + channel lead), and the
 *   site Footer (`<footer>`, plus the `<nav>` inside it).
 *   The script injects a stylesheet before screenshotting
 *   that hides every `<header>`, `<nav>`, and `<footer>`
 *   on the page — these are the real HTML5 semantic tags
 *   emitted by the styled-components, not class-name
 *   patterns. After the hide, the HeaderBox sits at the
 *   top of the viewport and the Sheet fills the rest, so
 *   the crop captures only the article content (HeaderBox
 *   + Sheet + author stamp if any). This keeps the social
 *   preview focused on the post — same logic as a news
 *   site's "share this article" image.
 *
 * Infrastructure — Vite dev server
 *   The page is a React SPA; the dev server is what
 *   actually renders it. The script spawns `vite` from
 *   the `landing/` subdir on a free port, polls that port
 *   until the dev server is reachable, then drives the
 *   browser against `http://127.0.0.1:<port>/`. After the
 *   cards are written the server is killed (SIGTERM,
 *   then SIGKILL after a 5s grace). The dev server runs
 *   in dev mode — Vite's HMR isn't relevant here, but dev
 *   mode is faster than `vite build` + `vite preview` and
 *   always reflects the latest source.
 *
 * Infrastructure — puppeteer
 *   Puppeteer manages its own Chromium download (see the
 *   devDependency in the root `package.json`). The browser
 *   runs headless via `--headless=new` and `--no-sandbox`
 *   so it works in containers without a display server.
 *   On first `yarn install` the Chromium binary is fetched
 *   to `~/.cache/puppeteer/` (one-time, ~250MB on disk).
 *   If `unzip` isn't on PATH (some minimal containers),
 *   `yauzl` is the documented fallback — install it as a
 *   devDependency alongside puppeteer.
 *
 * Vercel safety
 *   The puppeteer devDependency lives at the repo root,
 *   not in `landing/package.json`. Vercel deploys
 *   `landing/` only and never sees it — the
 *   production bundle never pulls puppeteer or Chromium.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

// ── arg parsing ──────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const getArg = (name) => {
  const found = args.find((a) => a.startsWith(`--${name}=`))
  return found ? found.slice(name.length + 3) : null
}
const hasFlag = (name) => args.includes(`--${name}`)

const slugFilter = getArg('slug')
const dryRun = hasFlag('dry-run')

// ── load the issue data ─────────────────────────────────────────────────
// Both modules load cleanly in raw Node — they have no
// Vite-specific `import.meta.env` reads.
const { fieldNotes } = await import(
  pathToFileURL(path.join(repoRoot, 'landing/src/data/fieldNotes.js')).href
)

const issues = slugFilter
  ? fieldNotes.filter((n) => n.slug === slugFilter)
  : fieldNotes

if (slugFilter && issues.length === 0) {
  console.error(`error: no issue with slug "${slugFilter}"`)
  process.exit(1)
}

// ── free-port helper ────────────────────────────────────────────────────
// Find a port that's not in use so the dev server can bind
// (Vite is configured with `strictPort: true` and will fail
// rather than slide to another port). Polls 0.0.0.0:0 to
// get a kernel-assigned free port; we then close it and
// hand the number to Vite.
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

// Wait for a URL to start responding. The dev server logs
// "ready in Nms" but parsing that text is fragile; an HTTP
// probe is more reliable and surfaces connection errors.
const waitForUrl = async (url, { timeoutMs = 30_000 } = {}) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok || res.status < 500) return
    } catch {
      // not yet — keep polling
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`dev server did not respond at ${url} within ${timeoutMs}ms`)
}

// ── Vite dev server lifecycle ───────────────────────────────────────────
// Spawn vite from the `landing/` subdir on a free port.
// The proxy in `landing/vite.config.js` reads `process.env.PORT`
// for the API target; we don't need the API (the cards don't
// hit any `/api/*` route), so a dummy value is fine. The
// `--mode dev` flag matches `yarn dev`'s behaviour.
//
// On exit (success or failure) we kill the server: SIGTERM
// first (Vite has its own SIGINT/SIGTERM handler that
// closes the port cleanly), and SIGKILL after 5s as a
// safety net for the rare case Vite hangs.
const startDevServer = async () => {
  const port = await getFreePort()
  // Vite lives under `landing/node_modules/` (it's a
  // dependency of the landing sub-project, not of the repo
  // root). The landing's own `package.json` has a `dev`
  // script — `vite --mode dev` — that resolves the binary
  // via the landing's node_modules. We invoke that script
  // through yarn so the bin resolution picks up the right
  // copy regardless of where Vite ends up installed.
  const child = spawn(
    'yarn',
    ['dev', '--port', String(port), '--host', '127.0.0.1'],
    {
      cwd: path.join(repoRoot, 'landing'),
      env: { ...process.env, PORT: '5000' /* dummy for the /api proxy */ },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  child.stdout.on('data', () => {})  // swallow Vite's noise
  child.stderr.on('data', () => {})
  await waitForUrl(`http://127.0.0.1:${port}/`)
  return { child, port }
}

const stopDevServer = (child) =>
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

// ── chrome-page: hide chrome, screenshot the article ────────────────────
// Stylesheet injected before every screenshot. Targets
// the page-level structural chrome that doesn't belong
// on a social card: the site Navbar (`<nav>` in
// `sections/Navbar.jsx`), the page-level PageHeader
// (`<header>` in `sections/PageHeader.jsx`), and the site
// Footer (`<footer>` in `sections/Footer.jsx`, plus the
// `<nav>` inside it for the legal links). Each is a real
// HTML5 semantic tag — far more reliable than
// `[class*="PageHeader"]`-style pattern matching, which
// doesn't work because @emotion/styled generates
// `css-XXX` classnames that don't include the source
// identifier.
//
// `display: none` collapses the elements so the article
// region flows up to the top of the viewport — the
// HeaderBox is now the first thing the social-card reader
// sees, not the site's navbar or page-level lead.
//
// The per-post HeaderBox renders a `<div>`, so the
// `<header>` selector doesn't catch it. Same for
// `<article>` (the Sheet). The FieldNotes index page also
// renders a `<nav>` for pagination, but the per-post page
// doesn't include that block, so the index nav selector
// is a no-op for the snapshots this script takes.
const HIDE_CHROME_CSS = `
  header, nav, footer { display: none !important; }
`

const snapshotPage = async (page, url, outFile, width, height) => {
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 })
  // Wait for the brand fonts (@font-face declared in
  // `landing/index.css`) to finish loading — otherwise the
  // screenshot captures a fallback font and the output is
  // inconsistent across runs where the font cache might
  // be cold.
  await page.evaluate(() => document.fonts.ready)
  // Inject the hide-chrome stylesheet AFTER the page has
  // mounted so the selectors match the rendered DOM.
  await page.addStyleTag({ content: HIDE_CHROME_CSS })
  // One more tick for layout to settle after `display:none`.
  await new Promise((resolve) => setTimeout(resolve, 100))
  await page.screenshot({
    path: outFile,
    type: 'png',
    omitBackground: false,
    clip: { x: 0, y: 0, width, height },
  })
}

// ── main flow ────────────────────────────────────────────────────────────
const run = async () => {
  if (dryRun) {
    for (const issue of issues) {
      console.log(`── landing/public/field-notes/${issue.slug}/og.png      (1200×630)`)
      console.log(`── landing/public/field-notes/${issue.slug}/twitter.png (1200×675)`)
    }
    return
  }

  // Lazy-import puppeteer so `--dry-run` doesn't require
  // the (heavy) dep tree. The import is also gated on the
  // env actually needing a browser; otherwise the
  // dependency is only paid when cards are written.
  const { default: puppeteer } = await import('puppeteer')

  console.log(`▸ starting Vite dev server`)
  const { child: devServer, port } = await startDevServer()
  console.log(`▸ Vite ready on http://127.0.0.1:${port}`)

  let browser
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()

    for (const issue of issues) {
      const outDir = path.join(repoRoot, 'landing/public/field-notes', issue.slug)
      fs.mkdirSync(outDir, { recursive: true })
      const url = `http://127.0.0.1:${port}/field-notes/${issue.slug}/`
      const ogOut = path.join(outDir, 'og.png')
      const twitterOut = path.join(outDir, 'twitter.png')

      console.log(`▸ ${issue.slug}: navigating to ${url}`)
      await snapshotPage(page, url, ogOut, 1200, 630)
      console.log(`✓ Wrote ${path.relative(repoRoot, ogOut)}`)
      await snapshotPage(page, url, twitterOut, 1200, 675)
      console.log(`✓ Wrote ${path.relative(repoRoot, twitterOut)}`)
    }
  } finally {
    if (browser) {
      try { await browser.close() } catch {}
    }
    await stopDevServer(devServer)
  }
}

await run()