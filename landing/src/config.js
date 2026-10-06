import { BRAND_NAME, BRAND_DOMAIN, BRAND_EMAIL, BRAND_TIMEZONE } from './data/brand.js'

/**
 * landing/src/config.js
 *
 * Central env reader for the Landing. Vite exposes `VITE_*` vars on
 * `import.meta.env`. Required vars throw at build/import time so a
 * broken env fails the build instead of producing a broken bundle.
 *
 * Convention: env vars are required (no code defaults hiding behind them).
 * Dev defaults live in `.env.dev`; prod values live in Vercel env vars.
 *
 * Layout mirrors `server/src/config.js`: same section headers (header
 * docstring → required() helper → code constants → required env vars →
 * config object → export).
 */

const APP_NAME = 'Landing'

const required = (key) => {
  const value = import.meta.env[key]
  if (value === undefined) {
    throw new Error(
      `[${APP_NAME}] Missing required env var: ${key}\n` +
        `   Set it in .env.dev, .env.prod, or your Vercel project env vars.\n` +
        `   See README > Environment Variables for the full contract.`
    )
  }
  return value
}

// ═══════════════════════════════════════════════════════════════════════════
// Code constants
// ═══════════════════════════════════════════════════════════════════════════

// ── Brand identity ───────────────────────────────────────────────────────────
// Mirrored in server/src/config.js. Used as the landing's JSON-LD schema's
// `name` and in contact-info copy. When migrating to a custom domain,
// change BRAND_DOMAIN here AND flip the VITE_*_URL env vars.


// ═══════════════════════════════════════════════════════════════════════════
// Required env vars (deployer must set these — no fallback to constants)
// ═══════════════════════════════════════════════════════════════════════════

const config = Object.freeze({
  apiUrl: required('VITE_API_URL'),
  landingUrl: required('VITE_LANDING_URL'),

  brand: Object.freeze({
    name: BRAND_NAME,
    domain: BRAND_DOMAIN,
    email: BRAND_EMAIL,
    timezone: BRAND_TIMEZONE,
  }),
})

export default config
