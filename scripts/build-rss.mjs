#!/usr/bin/env node
'use strict'

/**
 * Regenerate the Field Notes feed files from the array in
 * `landing/src/data/fieldNotes.js`. Writes:
 *
 *   landing/public/rss.xml   — the XML feed (RSS 2.0)
 *   landing/public/feed.txt  — the plain-text sibling
 *
 * Both files are committed artifacts; feed readers, search
 * crawlers, and plain-text consumers don't have to ship a
 * build step. Run this script after adding/editing a post
 * and commit the result.
 *
 * Usage:
 *   node scripts/build-rss.mjs                # write both feed files
 *   node scripts/build-rss.mjs --dry-run      # print everything to stdout
 *   node scripts/build-rss.mjs --xml-only     # only write rss.xml
 *   node scripts/build-rss.mjs --txt-only     # only write feed.txt
 *   node scripts/build-rss.mjs --out <path>   # custom rss.xml output
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

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

// ── arg parsing ──────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const xmlOnly = args.includes('--xml-only')
const txtOnly = args.includes('--txt-only')
const outIdx = args.indexOf('--out')
const customOut = outIdx !== -1 ? args[outIdx + 1] : null

// `--xml-only` and `--txt-only` are mutually exclusive; if
// neither is set we write both.
const writeXml = !txtOnly
const writeTxt = !xmlOnly

// ── dynamic import of the data module ────────────────────────────────────
const dataModulePath = path.join(
  repoRoot,
  'landing/src/data/fieldNotes.js',
)
const { buildRss, buildFeedTxt } = await import(
  pathToFileURL(dataModulePath).href
)

// ── build both payloads up front (so --dry-run prints both) ─────────────
const xml = writeXml ? buildRss() : ''
const txt = writeTxt ? buildFeedTxt() : ''

if (dryRun) {
  if (xml) process.stdout.write(xml)
  if (xml && txt) process.stdout.write('\n')
  if (txt) process.stdout.write(txt)
  process.exit(0)
}

// ── write ────────────────────────────────────────────────────────────────
if (writeXml) {
  const outPath =
    customOut || path.resolve(repoRoot, 'landing/public/rss.xml')
  fs.writeFileSync(outPath, xml, 'utf8')
  console.log(`✓ Wrote ${path.relative(repoRoot, outPath)}`)
}
if (writeTxt) {
  const outPath =
    customOut || path.resolve(repoRoot, 'landing/public/feed.txt')
  fs.writeFileSync(outPath, txt, 'utf8')
  console.log(`✓ Wrote ${path.relative(repoRoot, outPath)}`)
}
