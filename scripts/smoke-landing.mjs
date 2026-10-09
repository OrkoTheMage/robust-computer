#!/usr/bin/env node

import { JSDOM } from 'jsdom'
import esbuild from 'esbuild'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/**
 * scripts/smoke-landing.mjs
 *
 * Headless smoke test for the landing SPA. For every route in
 * `landing/src/App.jsx` it verifies:
 *
 *   1. The page renders — the DOM (rendered through JSDOM, not
 *      a plain HTTP GET) contains a known page-specific string.
 *      The Vite dev server returns the same `index.html` shell
 *      for every route, so an HTTP-only check can't tell
 *      `/about` from `/`. The known strings are written
 *      post-Zer0Text (uppercase, O→0) so the assertion matches
 *      the actual text in the DOM.
 *   2. Every interactive element is wired up — every <button>
 *      has an onClick (read from the React fiber — it never
 *      becomes a DOM attribute), or is a submit button inside
 *      a <form> with an onSubmit. Every <a> has a non-empty
 *      href.
 *   3. No dead links — internal hrefs point at a known
 *      App.jsx route; external http(s) hrefs are probed with
 *      a short-timeout GET. mailto: / tel: / pure-hash links
 *      are skipped. External probes run in parallel with a
 *      small concurrency limit so one slow target doesn't
 *      block the whole batch.
 *
 * Output is grouped into three sections ("Page Loads",
 * "Clickable Buttons", "Dead Links") with a tri-state line
 * per check: `✅ passed`, `⚠️  flagged` (non-fatal — e.g. a
 * 4xx/5xx from an anti-bot-protected site that still
 * responded), or `❌ failed` (e.g. missing page content, an
 * orphan button, a network error on a dead link). The exit
 * code is 1 only when something `❌` fails; a `⚠️  flagged`
 * line keeps the run exit 0 but is surfaced in the summary.
 *
 * Run against a running `yarn dev` (Vite dev server on
 * http://localhost:3000 by default). Override the host with
 * --base-url=… or the LANDING_URL env var.
 *
 *   yarn smoke:landing
 *   yarn smoke:landing --base-url=https://staging.robust.computer
 *
 * Exit codes:
 *   0  — every check passed
 *   1  — at least one check failed (printed before exit)
 *
 * Why esbuild bundling + JSDOM over a real browser: the pages
 * don't need real layout, real CSS animations, or real input
 * events to be checked. JSDOM is pure-Node, no Chromium
 * binary, no system deps. esbuild handles JSX, asset
 * imports, and `import.meta.env` in a single fast build
 * (~1s), so no Vite dev server is required for the render
 * itself — only for the per-route HTTP GET and the external
 * link probe.
 *
 * Bundle layout: we drop a tiny re-export entry at
 * `landing/.smoke-entry.mjs` that pulls in App, the
 * LocaleProvider, and the React bits the script needs, then
 * bundle it with esbuild (external: jsdom). The bundle lands
 * at `landing/.smoke-bundle.mjs` so the `import 'jsdom'`
 * inside it resolves from `landing/node_modules/jsdom`
 * (a transitive dep of `isomorphic-dompurify`). Both temp
 * files are deleted in `finally` so `yarn smoke:landing`
 * doesn't leave a build artifact behind.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const landingDir = path.join(repoRoot, 'landing')

// ── arg parsing ──────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
if (argv.includes('--help') || argv.includes('-h')) {
  console.log(`
  Usage: yarn smoke:landing [--base-url=<url>]

  Headless smoke test for the landing SPA. Verifies that every
  route in landing/src/App.jsx renders its expected content,
  every interactive element is wired up (no orphan onClicks,
  no missing hrefs), and no link points at a dead destination.

  Assumes a running 'yarn dev' (Vite dev server on
  http://localhost:3000 by default). Override the host
  with --base-url=… or the LANDING_URL env var.

  Exit codes:
    0  all checks passed
    1  at least one check failed
`)
  process.exit(0)
}

const baseUrl = (() => {
  const flag = argv.find((a) => a.startsWith('--base-url='))
  if (flag) return flag.slice('--base-url='.length)
  return process.env.LANDING_URL || 'http://localhost:3000'
})()
const normalizedBase = baseUrl.replace(/\/+$/, '')

// ── routes ───────────────────────────────────────────────────────────────
// The full route list, in the same order they appear in App.jsx.
// `contains` is the page-specific text the rendered DOM must
// include (post-Zer0Text transformation: uppercase, O→0). The
// Field Notes post slug is the only one on disk today
// (issue-001) — a new slug needs a new route entry here. The
// 404 path is arbitrary; React Router's catch-all matches
// anything that isn't an earlier route.
const ROUTES = [
  { path: '/',                      contains: 'CUST0M S0FTWARE, BUILT T0 LAST.' },
  { path: '/about',                 contains: 'MEET THE TEAM' },
  { path: '/contact',               contains: 'START A PR0JECT' },
  { path: '/bug-report',            contains: 'REP0RT A BUG' },
  { path: '/field-notes',           contains: 'FIELD N0TES' },
  { path: '/field-notes/issue-001', contains: 'A NEW BEGINNING' },
  { path: '/unsubscribe',           contains: 'THIS LINK IS BR0KEN' },
  { path: '/privacy',               contains: 'PRIVACY P0LICY' },
  { path: '/terms',                 contains: 'TERMS 0F SERVICE' },
  { path: '/this-does-not-exist',   contains: 'PAGE N0T F0UND' },
]

// Valid internal paths the "no dead links" check matches
// against. Anything outside this set is reported as a dead
// link (with a clear "internal href X not in known routes"
// message so the source can be located). `/rss.xml` is the
// static feed file served from `landing/public/` — not a
// React route, but still a real, live destination.
const KNOWN_ROUTES = new Set([
  ...ROUTES.map((r) => r.path),
  '/rss.xml',
])

// ── JSDOM setup ──────────────────────────────────────────────────────────
// One JSDOM document we reuse across all route renders; we
// reset the body between routes. The window URL is the dev
// server URL so a relative <a href="/about"> in the rendered
// DOM resolves to http://<host>/about (the same URL a real
// browser would compute from the same HTML).
const dom = new JSDOM(
  '<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>',
  {
    url: normalizedBase + '/',
    pretendToBeVisual: true,
  },
)

// React captures these globals at import time. Set them BEFORE
// we load React through the bundle (the bundle is async — the
// capture happens when `import()` resolves the module, which
// is after this block runs). `Object.defineProperty` is used
// for properties that are already defined on globalThis with
// a getter only (Node 20+ ships a built-in `navigator`
// getter, and any future Node addition would behave the same
// way — a plain assignment throws).
for (const key of [
  'window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node',
  'getComputedStyle', 'localStorage', 'sessionStorage', 'Image',
  'location', 'history', 'requestAnimationFrame', 'cancelAnimationFrame',
]) {
  const value = dom.window[key]
  if (value === undefined) continue
  try {
    globalThis[key] = value
  } catch {
    Object.defineProperty(globalThis, key, {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    })
  }
}

// React 18's `act` checks this global before treating a call
// as a "real" test-environment act. Without it, the warning
// "The current testing environment is not configured to
// support act(...)" is logged and effects don't always flush
// synchronously — the unsubscribe page's loading → idle
// transition in particular depends on the effect settling
// before we read the DOM.
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// ── bundle the app via esbuild ───────────────────────────────────────────
// A tiny re-export entry lives inside `landing/` so relative
// imports (./src/App.jsx) and the external `jsdom` import
// both resolve from the landing project's node_modules. The
// entry file is removed in `finally`; same for the bundle.
const entryPath = path.join(landingDir, '.smoke-entry.mjs')
const bundlePath = path.join(landingDir, '.smoke-bundle.mjs')

fs.writeFileSync(
  entryPath,
  [
    'import * as ReactNS from "react"',
    'import { createRoot } from "react-dom/client"',
    'import { MemoryRouter } from "react-router-dom"',
    'import { act } from "react"',
    'import App from "./src/App.jsx"',
    'import { LocaleProvider } from "./src/context/LocaleContext.jsx"',
    'export const React = ReactNS',
    'export { createRoot, MemoryRouter, act, App, LocaleProvider }',
    '',
  ].join('\n'),
)

// Cap a single render so a misbehaving component (an infinite
// loop, a stuck promise) can't hang the whole script.
const RENDER_TIMEOUT_MS = 15000

let exitCode = 0
const failures = []
const startTime = Date.now()

try {
  // Build the bundle. esbuild is fast (~1s) so we don't cache
  // the output between runs — code changes between
  // `yarn smoke:landing` invocations should be picked up
  // without manual cleanup. The `define` block substitutes
  // `import.meta.env.*` reads at build time, mirroring what
  // Vite does at dev-server boot — without it, the strict
  // `config.js` `required()` calls would throw on the
  // undefined env vars.
  try {
    const bundleResult = await esbuild.build({
      entryPoints: [entryPath],
      bundle: true,
      format: 'esm',
      platform: 'node',
      target: 'node20',
      jsx: 'automatic',
      jsxImportSource: 'react',
      // CSS, fonts, and images are dead weight for the smoke
      // test (we only inspect DOM text and props). Telling
      // esbuild they're empty modules keeps the bundle from
      // trying to load them as text.
      loader: {
        '.css': 'empty',
        '.svg': 'empty',
        '.png': 'empty',
        '.jpg': 'empty',
        '.jpeg': 'empty',
        '.gif': 'empty',
        '.ico': 'empty',
        '.woff': 'empty',
        '.woff2': 'empty',
      },
      // jsdom can't be bundled cleanly (it pulls in
      // node:fs / node:http / etc. as runtime deps). Mark
      // it external so the `import 'jsdom'` in the bundle
      // resolves from `landing/node_modules/jsdom` at load
      // time.
      external: ['jsdom'],
      outfile: bundlePath,
      define: {
        'import.meta.env': JSON.stringify({
          VITE_API_URL: 'http://localhost:5000',
          VITE_LANDING_URL: normalizedBase,
          MODE: 'dev',
          DEV: true,
          PROD: false,
          SSR: true,
          BASE_URL: '/',
        }),
      },
      // Silence esbuild's own log output (we surface our
      // own check results). The `silent` level is its
      // quietest — even "info" events get suppressed.
      logLevel: 'silent',
    })

    if (bundleResult.errors.length > 0) {
      console.error(`❌ esbuild bundle errors: ${bundleResult.errors.map((e) => e.text).join('\n')}`)
      process.exit(1)
    }
  } catch (err) {
    console.error(`❌ esbuild bundle failed: ${err.message}`)
    process.exit(1)
  }

  // ── Load the bundle ─────────────────────────────────────────────────
  // The bundle sits inside `landing/`, so the `import 'jsdom'`
  // inside it resolves from `landing/node_modules/jsdom` (a
  // transitive dep of `isomorphic-dompurify`).
  let App, LocaleProvider, React, createRoot, MemoryRouter, act
  try {
    ;({ App, LocaleProvider, React, createRoot, MemoryRouter, act } =
      await import(pathToFileURL(bundlePath).href))
  } catch (err) {
    console.error(`❌ Failed to load bundle: ${err.message}`)
    process.exit(1)
  }

  // ── Console filter for render-time noise ────────────────────────────
  // When the bundle renders, three sources of noise show up
  // on stderr/stdout. None of them are problems the smoke
  // test should fail on:
  //
  //   • JSDOM's "Not implemented: Window's scrollTo() method"
  //     — JSDOM stubs scrollTo as a no-op, and the ScrollToTop
  //     component legitimately calls it on every route change.
  //     Real browsers implement it.
  //
  //   • React Router v6's future-flag warnings ("React Router
  //     will begin wrapping state updates in startTransition
  //     in v7", "Relative route resolution within Splat routes
  //     is changing in v7"). Informational, no action needed
  //     until the v7 upgrade.
  //
  //   • React's "Received true for a non-boolean attribute" /
  //     "Invalid attribute name" / "Unknown event handler"
  //     — these are REAL source bugs. Components like Chip
  //     leak the on / onInk props and TicketStamp leaks 
  //     because Emotion's styled doesn't honor the
  //     styled-components hBcprefix convention for transient
  //     props. We collect these as render warnings and surface
  //     them in the summary so the operator knows — they are
  //     source-code bugs to fix, but they are not smoke-test
  //     regressions, so we don't fail the run on them.
  //
  // We install a wrapping console.error / console.warn that
  // drops the harmless messages and counts the rest. The
  // original console methods are restored in finally so the
  // script's own output prints normally.
  const renderWarnings = []
  const noisyPatterns = [
    /Not implemented: Window.s scrollTo/,
    /React Router Future Flag Warning/,
    /Relative route resolution within Splat routes is changing/,
  ]
  const wrap = (original) => (msg, ...rest) => {
    const text = typeof msg === 'string' ? msg : String(msg)
    if (noisyPatterns.some((re) => re.test(text))) return
    if (/^Warning:/.test(text)) {
      // React passes substitution args as separate
      // parameters — e.g. `console.error('Received %s for
      // %s', 'true', '$link')` — so inline them into the
      // first line before we capture it.
      let rendered = text
      for (const arg of rest) {
        if (typeof arg === 'string' && rendered.includes('%s')) {
          rendered = rendered.replace('%s', arg)
        } else {
          break
        }
      }
      const firstLine = rendered.split('\n')[0]
      const stack = rest.find((a) => typeof a === 'string' && a.includes('at '))
      const firstFrame = stack ? stack.split('\n')[0] : ''
      renderWarnings.push(`${firstLine}${firstFrame ? `  (${firstFrame.trim()})` : ''}`)
      return
    }
    original.call(console, msg, ...rest)
  }
  const origError = console.error
  const origWarn = console.warn
  console.error = wrap(origError)
  console.warn = wrap(origWarn)

  // ── Pre-flight: dev server reachable ────────────────────────────────
  // Retry a few times — the dev server takes a couple of seconds
  // to bind its port after `yarn dev` starts, and the user
  // often runs `yarn dev && yarn smoke:landing` in the same
  // shell line.
  console.log(`🔌 Checking dev server at ${normalizedBase}...`)
  let preOk = false
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(normalizedBase + '/', { signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        console.log(`✓ Dev server responding (HTTP ${res.status})\n`)
        preOk = true
        break
      }
    } catch {
      // not up yet — fall through to retry
    }
    if (attempt < 5) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  if (!preOk) {
    console.error(`❌ Dev server not reachable at ${normalizedBase}`)
    console.error(`   Start it with: yarn dev`)
    console.error(`   Or pass --base-url=<url> to point at a different host.`)
    process.exit(1)
  }

  // ── Per-route checks ───────────────────────────────────────────────
  // Each route produces three result rows: one for "Page
  // Loads", one for "Clickable Buttons", and (in aggregate)
  // the external-link set that gets probed in section 3.
  // We collect the per-route results here and print them
  // in three grouped sections after the loop, so the
  // output reads top-to-bottom as Page → Buttons → Links.
  const routeResults = []
  const allExternalLinks = new Set()
  let totalButtons = 0
  let totalAnchors = 0

  for (const route of ROUTES) {
    const routeIssues = []

    // Per-route HTTP GET (the dev server returns the SPA shell
    // for every route, so this is a sanity check that the path
    // is being served at all — a 404 from the dev server would
    // indicate a real misconfiguration, not a route mismatch).
    try {
      const res = await fetch(`${normalizedBase}${route.path}`, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) {
        routeIssues.push(`HTTP ${res.status}`)
        failures.push(`${route.path}: HTTP ${res.status}`)
      }
    } catch (err) {
      routeIssues.push(`HTTP probe failed: ${err.message}`)
      failures.push(`${route.path}: HTTP probe failed — ${err.message}`)
    }

    // Reset the body for a clean render. We don't touch
    // <head> — the SEO component manages the same set of tags
    // every render and overwrites them in place.
    document.body.innerHTML = '<div id="root"></div>'
    const root = createRoot(document.getElementById('root'))

    // Render the App at this route. MemoryRouter makes the
    // route the current location without touching history;
    // LocaleProvider supplies the i18n dictionary the app
    // reads from. We wrap in `act` so the SEO effect (which
    // sets document.title) and the useUnsubscribe effect (on
    // /unsubscribe, which flips loading → idle) both flush
    // before we read the DOM.
    let renderError = null
    try {
      await Promise.race([
        act(async () => {
          root.render(
            React.createElement(
              MemoryRouter,
              { initialEntries: [route.path] },
              React.createElement(
                LocaleProvider,
                null,
                React.createElement(App),
              ),
            ),
          )
        }),
        new Promise((_r, rej) =>
          setTimeout(
            () => rej(new Error(`render timed out after ${RENDER_TIMEOUT_MS}ms`)),
            RENDER_TIMEOUT_MS,
          ),
        ),
      ])
    } catch (err) {
      renderError = err
    }

    if (renderError) {
      // Render blew up — the DOM is still the empty reset
      // state, so the content checks below wouldn't see
      // anything anyway. Unmount (best-effort) to flush
      // any cleanup effects, then bail to the next route.
      try {
        await act(() => { root.unmount() })
      } catch {
        // unmount errors aren't check failures here — we
        // already have a render failure to report.
      }
      routeIssues.push(`render failed: ${renderError.message}`)
      failures.push(`${route.path}: render failed — ${renderError.message}`)
      // Record a "failed" result for both sections so the
      // grouped output below surfaces the failure in
      // both the Page Loads and Clickable Buttons lists.
      routeResults.push({
        path: route.path,
        renderFailed: true,
        contentOk: false,
        buttonsOk: false,
        anchorCount: 0,
        buttonCount: 0,
      })
      exitCode = 1
      continue
    }

    // ── Check #1: page content ───────────────────────────────────────
    // Read the rendered body text. We uppercase both sides so
    // the assertion is locale-stable; the page text comes
    // back through Zer0Text (uppercase + O→0) on the way to
    // the DOM, so the expected strings are written in the
    // same form.
    const bodyText = (document.body.textContent || '').toUpperCase()
    const expected = route.contains.toUpperCase()
    const contentOk = bodyText.includes(expected)
    if (!contentOk) {
      routeIssues.push(`missing expected text "${route.contains}"`)
      failures.push(`${route.path}: missing expected text "${route.contains}"`)
    }

    // ── Check #2: buttons are wired ──────────────────────────────────
    const buttons = [...document.querySelectorAll('button')]
    let buttonsOk = true
    for (const button of buttons) {
      const result = isButtonWired(button)
      if (!result.wired) {
        buttonsOk = false
        const where = describeLocation(button)
        routeIssues.push(`orphan <button> at ${where}: ${result.reason}`)
        failures.push(`${route.path}: orphan <button> at ${where}: ${result.reason}`)
      }
    }

    // ── Check #3: anchors are wired + classify for probe ─────────────
    const anchors = [...document.querySelectorAll('a')]
    for (const anchor of anchors) {
      const result = isLinkWired(anchor)
      if (!result.wired) {
        const where = describeLocation(anchor)
        routeIssues.push(`orphan <a> at ${where}: ${result.reason}`)
        failures.push(`${route.path}: orphan <a> at ${where}: ${result.reason}`)
      } else if (result.external) {
        allExternalLinks.add(result.href)
      }
    }

    totalButtons += buttons.length
    totalAnchors += anchors.length

    routeResults.push({
      path: route.path,
      renderFailed: false,
      contentOk,
      buttonsOk,
      anchorCount: anchors.length,
      buttonCount: buttons.length,
    })
    if (!contentOk || !buttonsOk) exitCode = 1

    // Unmount + flush cleanup effects AFTER the checks.
    // Without this, a useEffect cleanup from the previous
    // route can fire during the next render and throw — for
    // example, the LocaleProvider's localStorage effect
    // cleans up by writing the current locale, which is a
    // no-op but still goes through the React scheduler.
    // Doing it here (after the DOM walk) means the walk
    // sees the populated DOM, not the post-unmount empty
    // state.
    try {
      await act(() => { root.unmount() })
    } catch {
      // unmount errors aren't check failures — the next
      // iteration's render starts with a fresh root anyway.
    }
  }

  // ── Three-section output ────────────────────────────────────────────
  // Print the per-route results in three grouped sections:
  // Page Loads, Clickable Buttons, Dead Links. The render
  // loop above already collected `routeResults` and
  // `allExternalLinks`; we just walk them in order here.
  const totalPages = routeResults.length
  const totalLinkProbes = allExternalLinks.size

  // Tally flagged vs failed per section for the summary.
  // The exit code is already set by the render loop; this
  // block just renders the status lines.
  let pagesFlagged = 0
  let pagesFailed = 0
  let buttonsFailed = 0

  // ── Section 1: Page Loads ───────────────────────────────────────
  console.log('══════════════════════════════════════════════════════')
  console.log('Checking Page Loads....')
  console.log('══════════════════════════════════════════════════════')
  for (const r of routeResults) {
    if (r.renderFailed || !r.contentOk) {
      console.log(`❌ ${r.path}`)
      pagesFailed++
    } else {
      console.log(`✅ ${r.path}`)
    }
  }

  // ── Section 2: Clickable Buttons ────────────────────────────────────
  // A route with no buttons is ✅ (the absence of buttons
  // isn't a failure — the page just doesn't render any).
  // A route with buttons that has an orphan is ❌.
  console.log('')
  console.log('══════════════════════════════════════════════════════')
  console.log('Checking Clickable Buttons....')
  console.log('══════════════════════════════════════════════════════')
  for (const r of routeResults) {
    if (r.renderFailed) {
      // The render blew up before we could walk the buttons
      // — the page section above already flagged this route.
      // Skip the button line so we don't double-report.
      continue
    }
    if (!r.buttonsOk) {
      console.log(`❌ ${r.path}`)
      buttonsFailed++
    } else {
      console.log(`✅ ${r.path}`)
    }
  }

  // ── Section 3: Dead Links ─────────────────────────────────────────
  // Probe every unique external href once (the same link on
  // multiple pages counts once). Parallel with a small
  // concurrency limit so one slow target doesn't block the
  // whole batch. We use a tri-state outcome:
  //   ✅  HTTP 2xx/3xx — link is alive and serving content
  //   ⚠️  HTTP 4xx/5xx — server responded but the resource
  //        isn't there; the link is "iffy" (could be a
  //        permission/auth issue, an anti-bot block, or a
  //        genuinely gone page) — worth a human look
  //   ❌  network error (timeout, DNS, connection refused) —
  //        the link has no server behind it
  // Exit code is 1 only on ❌. ⚠️ is surfaced in the summary
  // and the per-line status but doesn't fail the run.
  let linksFlagged = 0
  let linksFailed = 0
  const probed = allExternalLinks.size > 0
    ? await probeAllExternal(allExternalLinks, 6)
    : []
  console.log('')
  console.log('══════════════════════════════════════════════════════')
  console.log('Checking for Dead Links...')
  console.log('══════════════════════════════════════════════════════')
  for (const result of probed) {
    const { href, status, error } = result
    if (error) {
      // Network-level error: link is unreachable.
      console.log(`❌ ${href}  — ${error}`)
      linksFailed++
      failures.push(`external link unreachable: ${href} (${error})`)
      exitCode = 1
    } else if (status >= 200 && status < 400) {
      console.log(`✅ ${href}  — HTTP ${status}`)
    } else {
      // 4xx / 5xx / 999 — server responded but not with
      // success. Flag, don't fail.
      console.log(`⚠️  ${href}  — HTTP ${status}`)
      linksFlagged++
    }
  }

  // ── Summary ───────────────────────────────────────────────────
  // Tri-state: ✅ if everything passed, ⚠️ if some links
  // returned non-2xx/3xx (no ❌, no failures), ❌ if any
  // check failed. The exit code is already set by the
  // render loop / probe loop above.
  const flagged = pagesFlagged + buttonsFailed + linksFlagged
  const failed = pagesFailed + buttonsFailed + linksFailed
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log('')
  console.log('══════════════════════════════════════════════════════')
  console.log(`Summary:  ${totalPages} route(s),  ${totalButtons} button(s), ${totalAnchors} anchor(s)`)
  if (failed === 0 && flagged === 0) {
    console.log('✅ All checks passed.')
  } else if (failed === 0) {
    console.log(`⚠️  ${flagged} checks flagged`)
  } else {
    console.log(`❌ ${failed} checks failed`)
  }
  console.log(`Done in ${elapsed}s`)

  // Surface the React render warnings (real source bugs
  // like prop leaks) that we collected above. They don't
  // fail the run — they're a heads-up that the landing
  // has source-code issues to fix.
  if (renderWarnings.length > 0) {
    const seen = new Set()
    const unique = renderWarnings.filter((w) => {
      if (seen.has(w)) return false
      seen.add(w)
      return true
    })
    console.log('')
    console.log(`⚠️  ${unique.length} render warning(s) (source bugs, not smoke failures):`)
    for (const w of unique.slice(0, 5)) console.log(`     - ${w}`)
    if (unique.length > 5) console.log(`     ... and ${unique.length - 5} more`)
  }

  if (failures.length > 0) {
    console.log('')
    for (const f of failures) console.log(`  - ${f}`)
  }
} finally {
  // Best-effort cleanup of the temp entry + bundle. The
  // entries are written to the landing dir so the
  // `import 'jsdom'` inside the bundle can resolve from
  // `landing/node_modules/jsdom`; both should disappear
  // when the script exits, leaving the landing project
  // untouched.
  for (const p of [entryPath, bundlePath]) {
    try { fs.unlinkSync(p) } catch { /* missing is fine */ }
  }
  // Restore the original console methods so anything the
  // caller does after the script exits (e.g. the yarn
  // wrapper) prints normally. The render-warnings array
  // lives outside the try/finally so the summary can
  // reference it; we don't need to clear it.
  try {
    console.error = origError
    console.warn = origWarn
  } catch { /* `origError` / `origWarn` may be undefined if the bundle failed to load */ }
}

process.exit(exitCode)

// ── helpers ──────────────────────────────────────────────────────────────

/**
 * isButtonWired
 *
 * A button is "wired" if either:
 *   - its React fiber has an onClick prop, OR
 *   - it's a submit button (type="submit") inside a <form>
 *     whose React fiber has an onSubmit prop.
 *
 * The onClick is read from the React fiber — attaching a
 * listener doesn't put it on the DOM as an attribute. The
 * fiber key on a DOM node is `__reactFiber$<hash>` where
 * the hash is generated once per React instance.
 */
function isButtonWired(button) {
  const props = getFiberProps(button)
  if (!props) {
    return { wired: false, reason: 'no React fiber attached' }
  }
  if (typeof props.onClick === 'function') {
    return { wired: true, via: 'onClick' }
  }
  if (props.type === 'submit') {
    const form = button.closest('form')
    if (form) {
      const formProps = getFiberProps(form)
      if (formProps && typeof formProps.onSubmit === 'function') {
        return { wired: true, via: 'form onSubmit' }
      }
    }
    return { wired: false, reason: 'type="submit" but parent <form> has no onSubmit' }
  }
  return { wired: false, reason: 'no onClick handler' }
}

/**
 * isLinkWired
 *
 * A link is "wired" if its href attribute is non-empty. We
 * classify it as internal (same-origin as the dev server) or
 * external so the cross-route external probe can skip
 * internal paths and the "no dead links" check can verify
 * the path against KNOWN_ROUTES.
 *
 * Mailto:, tel:, and pure-hash (#) links are reported as
 * wired with no further check — they're not http(s) targets
 * and there's nothing meaningful to probe.
 */
function isLinkWired(anchor) {
  const href = anchor.getAttribute('href')
  if (href === null || href === '') {
    return { wired: false, reason: 'missing or empty href' }
  }
  // A pure `#` href is the standard "scroll to top" / no-op
  // placeholder pattern. The Developer section uses it as
  // the fallback for developers without a portfolio URL.
  // Not a real navigation target, but not a dead link
  // either — browsers handle it as a no-op scroll.
  if (href === '#') {
    return { wired: true, href: href, external: false }
  }
  // React Router <Link to="/about"> renders to <a href="/about">;
  // JSDOM resolves the href against the document's base URL
  // (the dev server), so anchor.href is the full origin+path.
  let parsed
  try {
    parsed = new URL(anchor.href)
  } catch {
    return { wired: false, reason: `invalid href "${href}"` }
  }
  const base = new URL(normalizedBase + '/')
  const isExternal = parsed.origin !== base.origin

  if (isExternal) {
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      // mailto: / tel: / etc. — wired but not probeable.
      return { wired: true, href: parsed.href, external: false }
    }
    return { wired: true, href: parsed.href, external: true }
  }

  // Internal: the path (without query / hash) must be one of
  // the App.jsx routes we tested above.
  if (!KNOWN_ROUTES.has(parsed.pathname)) {
    return { wired: false, reason: `internal href "${parsed.pathname}" not in known routes` }
  }
  return { wired: true, href: parsed.href, external: false }
}

/**
 * getFiberProps
 *
 * Read the React fiber attached to a DOM node and return the
 * current props. React 18 stores the fiber on the DOM node as
 * a property keyed `__reactFiber$<random>`. For a settled
 * render, `memoizedProps` is the right slot to read; fall
 * back to `pendingProps` if the render is still in flight.
 */
function getFiberProps(domNode) {
  const key = Object.keys(domNode).find((k) => k.startsWith('__reactFiber$'))
  if (!key) return null
  const fiber = domNode[key]
  return fiber?.memoizedProps || fiber?.pendingProps || null
}

/**
 * describeLocation
 *
 * Short human-readable location of an element — its tag plus
 * a preview of its text content. Used in failure messages so
 * the user can find the orphan in the source.
 */
function describeLocation(el) {
  const tag = el.tagName.toLowerCase()
  const text = (el.textContent || '').trim().slice(0, 50)
  return text ? `<${tag}>"${text}"` : `<${tag}>`
}

/**
 * probeAllExternal
 *
 * Run a short-timeout GET against every URL in `hrefs`, with
 * at most `concurrency` in-flight at any moment. The smoke
 * test wants every link probed, not just the first failure,
 * so we collect all results and report rather than
 * short-circuiting.
 *
 * Each result is one of three shapes the caller maps to a
 * tri-state status line:
 *
 *   { href, status }            — server responded (any HTTP
 *                                 status; the caller decides
 *                                 2xx/3xx vs 4xx/5xx/999)
 *   { href, error: '<reason>' } — network-level failure
 *                                 (timeout, DNS, connection
 *                                 refused). The link has no
 *                                 server behind it; this is
 *                                 the only true "dead" signal
 *
 * Why the tri-state split between "server responded with a
 * non-2xx/3xx" and "no response": social-media and
 * anti-bot-protected sites routinely return 999 / 403 / 503
 * to plain GETs from a headless Node process, and that has
 * nothing to do with the link being broken. The section-3
 * reporter treats non-2xx/3xx HTTP as `⚠️ flagged`
 * (operator can investigate) and only network errors as
 * `❌ failed` (exit 1). That keeps the test useful for
 * catching real outages (DNS gone, port closed) without
 * false-positiving on every LinkedIn / X / Instagram link
 * the moment a single bot-detection heuristic trips.
 */
async function probeAllExternal(hrefs, concurrency) {
  const list = [...hrefs]
  const results = new Array(list.length)
  let idx = 0
  const worker = async () => {
    while (idx < list.length) {
      const i = idx++
      const href = list[i]
      try {
        const res = await fetch(href, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000),
        })
        results[i] = { href, status: res.status }
      } catch (err) {
        results[i] = { href, error: err.message }
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, list.length) }, worker),
  )
  return results
}
