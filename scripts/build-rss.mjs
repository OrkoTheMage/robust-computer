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
 * Usage:
 *   node scripts/build-rss.mjs                # write all four files
 *   node scripts/build-rss.mjs --xml-only     # only the XML files
 *   node scripts/build-rss.mjs --txt-only     # only the TXT files
 *   node scripts/build-rss.mjs --full-only    # skip the latest.* files
 *   node scripts/build-rss.mjs --latest-only  # skip the full files
 *   node scripts/build-rss.mjs --dry-run      # print everything to stdout
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

// `--xml-only` and `--txt-only` are mutually exclusive; if
// neither is set we write both formats.
const writeXml = !txtOnly
const writeTxt = !xmlOnly

// `--full-only` and `--latest-only` are mutually exclusive; if
// neither is set we write both variants.
const writeFull = !latestOnly
const writeLatest = !fullOnly

// ── dynamic import of the data module ────────────────────────────────────
const dataModulePath = path.join(
  repoRoot,
  'landing/src/data/fieldNotes.js',
)
const { buildRss, buildFeedTxt, getLatest } = await import(
  pathToFileURL(dataModulePath).href
)

// Latest post as a one-element array. `getLatest()` returns
// null if the data is empty; fall back to an empty array so
// the builders still emit a well-formed (but item-less) feed
// rather than throwing.
const latestNotes = getLatest() ? [getLatest()] : []

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
for (const [rel, content] of files) {
  const outPath = path.resolve(repoRoot, rel)
  fs.writeFileSync(outPath, content, 'utf8')
  console.log(`✓ Wrote ${path.relative(repoRoot, outPath)}`)
}
