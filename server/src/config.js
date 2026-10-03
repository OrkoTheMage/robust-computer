/**
 * server/src/config.js
 *
 * Frozen env reader. Loads the repo-root .env.<NODE_ENV> file once at
 * boot, throws on missing required values, freezes the result.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

const NODE_ENV = process.env.NODE_ENV || 'development'
const envFileName = NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
const envFilePath = path.join(repoRoot, envFileName)

dotenv.config({ path: envFilePath })

const required = (key) => {
  const value = process.env[key]
  if (value === undefined || value === '') {
    throw new Error(
      `[server] Missing required env var: ${key}\n` +
        `       Set it in ${envFileName} at the repo root.\n` +
        `       See README > Environment Variables for the full contract.`
    )
  }
  return value
}

const optional = (key, fallback) => process.env[key] ?? fallback

const config = Object.freeze({
  nodeEnv: NODE_ENV,
  port: Number(optional('PORT', 5000)),

  mongodbUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),

  smtp: Object.freeze({
    host: required('SMTP_HOST'),
    port: Number(optional('SMTP_PORT', 1025)),
    secure: optional('SMTP_SECURE', 'false') === 'true',
    user: optional('SMTP_USER', ''),
    pass: optional('SMTP_PASS', ''),
    from: required('SMTP_FROM'),
  }),

  urls: Object.freeze({
    landing: required('LANDING_URL'),
    api: required('API_URL'),
  }),
})

export default config
