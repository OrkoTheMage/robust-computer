/**
 * server/src/config.js
 *
 * Central env reader for the server. Reads `.env.dev` or `.env.prod` at
 * the repo root (selected by `NODE_ENV`), validates required vars, and
 * exports a frozen `config` object. Every other server file should read
 * from here instead of touching `process.env` directly.
 *
 * Convention: if a value is an env var, the deployer MUST set it (no code
 * default — defaults belong in code, exposed values belong in env vars).
 * See the "Required env vars" comment block at the bottom for the full
 * contract.
 *
 * Layout mirrors `landing/src/config.js`: same section headers (header
 * docstring → required() helper → code constants → required env vars →
 * config object → export). Server-only fields live in this file only.
 */

import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read NODE_ENV BEFORE deciding which file to load. Defaults to dev so a
// bare `node src/index.js` can't accidentally talk to production.
const NODE_ENV = process.env.NODE_ENV || 'development'

// Env files live at the repo root, not in this directory. Resolve the path
// relative to this file so it works regardless of cwd.
const envFileName = NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
const envFilePath = path.join(__dirname, `../../${envFileName}`)

dotenv.config({ path: envFilePath })

// Used by `required()` to prefix error messages so deployers can tell at a
// glance which project's config failed to load.
const APP_NAME = 'Server'

/** Required var. Throws at boot if not set.
 *  `''` is allowed because some env vars use empty as a valid value
 *  (`SMTP_USER=''` disables auth, used by Mailpit in dev). */
const required = (key) => {
  const value = process.env[key]
  if (value === undefined) {
    throw new Error(
      `[${APP_NAME}] Missing required env var: ${key}\n` +
        `   Looked in: process.env.${key} and ${envFilePath}\n` +
        `   Set it in .env.dev, .env.prod, or your Railway service env vars.\n` +
        `   See README > Environment Variables for the full contract.`
    )
  }
  return value
}

// ═══════════════════════════════════════════════════════════════════════════
// Code constants
// ═══════════════════════════════════════════════════════════════════════════

// ── Brand identity ───────────────────────────────────────────────────────────
// Mirrored in landing/src/config.js. Used in email body copy and as the
// contact-form recipient. When migrating to a custom domain, change
// BRAND_DOMAIN here AND flip the *URL env vars.
const BRAND_NAME = 'Robust Computer'
const BRAND_DOMAIN = 'robust.computer'
const BRAND_EMAIL = `hello@${BRAND_DOMAIN}`
const BRAND_TIMEZONE = 'America/Chicago'

// ── Server-only constants (NOT mirrored) ────────────────────────────────────

// Server lifecycle.
const PORT = 5000

// JWT.
const JWT_EXPIRES_IN = '24h'

// Email transport. Two branches selected by NODE_ENV:
//
//   NODE_ENV=production  → Resend HTTPS API (Railway blocks SMTP egress to
//                          Resend on 465/587 — only 443 is reliably open)
//   NODE_ENV=development → SMTP via nodemailer (mailpit on localhost:1025
//   (or any other)        in local dev, real SMTP server in staging)
//
// `MAIL_FROM` is derived from BRAND_DOMAIN so a domain migration
// updates the envelope sender on both branches.
const MAIL_FROM = `hello@${BRAND_DOMAIN}`
const IS_PRODUCTION = NODE_ENV === 'production'

// nodemailer's `secure` field is a boolean, but env values are
// always strings. Parse the deployer's value here so the rest of
// the file treats `config.email.smtp.secure` as a real boolean.
const parseBool = (val, key) => {
  if (val === 'true') return true
  if (val === 'false') return false
  throw new Error(`[${APP_NAME}] Invalid boolean for env var ${key}: ${val} (expected "true" or "false")`)
}

// ═══════════════════════════════════════════════════════════════════════════
// Required env vars (deployer must set these — no fallback to constants)
// ═══════════════════════════════════════════════════════════════════════════

const config = Object.freeze({
  // ── Mirrored (also in landing/src/config.js) ──────────────────────────────

  // Public URL of this API. Used by the Vite apps to talk to the server.
  apiUrl: required('API_URL'),

  // Used by the server to build absolute URLs in outbound email that point
  // at the landing (contact-form notice, newsletter re-subscribe destination).
  landingUrl: required('LANDING_URL'),

  brand: Object.freeze({
    name: BRAND_NAME,
    domain: BRAND_DOMAIN,
    email: BRAND_EMAIL,
    timezone: BRAND_TIMEZONE,
  }),

  // ── Server-only ───────────────────────────────────────────────────────────

  env: NODE_ENV,
  isProduction: NODE_ENV === 'production',

  // Railway injects this in prod; scripts/dev.js sets it for local dev.
  // Falls back to the PORT constant only for bare `node src/index.js`.
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : PORT,

  mongoUri: required('MONGODB_URI'),

  jwt: Object.freeze({
    secret: required('JWT_SECRET'),
    expiresIn: JWT_EXPIRES_IN,
  }),

  email: IS_PRODUCTION
    ? Object.freeze({
        from: MAIL_FROM,
        resendApiKey: required('RESEND_API_KEY'),
      })
    : Object.freeze({
        from: MAIL_FROM,
        smtp: Object.freeze({
          host: required('SMTP_HOST'),
          port: parseInt(required('SMTP_PORT'), 10),
          secure: parseBool(required('SMTP_SECURE'), 'SMTP_SECURE'),
          // '' is allowed: mailpit accepts unauthenticated SMTP, so
          // setting SMTP_USER='' and SMTP_PASS='' in .env.dev means
          // "no auth header" rather than throwing at boot.
          user: required('SMTP_USER'),
          pass: required('SMTP_PASS'),
        }),
      }),
})

export default config
