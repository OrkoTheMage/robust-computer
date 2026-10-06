import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * server/scripts/sync-version.mjs
 *
 * Reads the monorepo-root `package.json#version` and writes
 * `server/src/version.js` so the running server can import it without
 * touching the deploy root. Run as a side-effect import via Node's
 * `--import` flag (see `start` and `dev` in server/package.json).
 */

const here = dirname(fileURLToPath(import.meta.url))
const root = JSON.parse(readFileSync(join(here, '../../package.json'), 'utf8'))
writeFileSync(
  join(here, '../src/version.js'),
  `export const VERSION = ${JSON.stringify(root.version)}\n`
)
