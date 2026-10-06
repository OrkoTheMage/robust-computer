import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * server/scripts/sync-version.mjs
 *
 * Reads the monorepo-root `package.json#version` and writes
 * `server/src/version.js` so the running server can import it without
 * touching the deploy root. Run as the `postinstall` hook in
 * server/package.json — i.e. during `yarn install`, when the full
 * repo is on disk. The file ships with the deploy and `layout.js`
 * imports it at runtime; no further work at server startup.
 */

const here = dirname(fileURLToPath(import.meta.url))
const root = JSON.parse(readFileSync(join(here, '../../package.json'), 'utf8'))
writeFileSync(
  join(here, '../src/version.js'),
  `export const VERSION = ${JSON.stringify(root.version)}\n`
)
