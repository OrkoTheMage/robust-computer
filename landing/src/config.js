/**
 * landing/src/config.js
 *
 * Frozen env reader. Throws on missing required values, never falls
 * back to `undefined` for things the app needs at boot.
 */

const APP_NAME = 'landing'

const required = (key) => {
  const value = import.meta.env[key]
  if (value === undefined || value === '') {
    throw new Error(
      `[${APP_NAME}] Missing required env var: ${key}\n` +
        `   Set it in .env.dev, .env.prod, or your Vercel project env vars.\n` +
        `   See README > Environment Variables for the full contract.`
    )
  }
  return value
}

const optional = (key, fallback) => import.meta.env[key] ?? fallback

const BRAND_NAME = 'Robust Computer'
const BRAND_DOMAIN = 'robustcomputer.example'

const config = Object.freeze({
  apiUrl: required('VITE_API_URL'),
  landingUrl: optional('VITE_LANDING_URL', 'http://localhost:3000'),
  brand: Object.freeze({
    name: BRAND_NAME,
    domain: BRAND_DOMAIN,
    contactEmail: `hello@${BRAND_DOMAIN}`,
  }),
})

export default config
