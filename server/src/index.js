/**
 * server/src/index.js
 *
 * Express + MongoDB API. Boots middleware, mounts routers, listens.
 * Same error handler across the whole app — never leaks internals.
 */

import express from 'express'
import mongoose from 'mongoose'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import config from './config.js'
import contactRoutes from './routes/contact.js'
import newsletterRoutes from './routes/newsletter.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

// ── security + parsing ──────────────────────────────────────────────────
app.set('trust proxy', 1)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
)
app.use(compression())
app.use(express.json({ limit: '64kb' }))
app.use(express.urlencoded({ extended: false, limit: '64kb' }))

// ── CORS: allowlist the configured landing URL ──────────────────────────
const allow = new Set([config.urls.landing, config.urls.api])
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allow.has(origin)) return cb(null, true)
      return cb(new Error(`CORS: origin not allowed: ${origin}`))
    },
    credentials: false,
  })
)

// ── health ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: config.nodeEnv, time: new Date().toISOString() })
})

// ── resources ───────────────────────────────────────────────────────────
app.use('/api', (_req, _res, next) => {
  // readyState 1 = connected. Anything else means the DB is unreachable.
  if (mongoose.connection.readyState !== 1) {
    return next(new Error('Database unavailable. Try again in a moment.'))
  }
  next()
})
app.use('/api/contact', contactRoutes)
app.use('/api/newsletter', newsletterRoutes)

// ── 404 ─────────────────────────────────────────────────────────────────
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }))

// ── error handler ───────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  // Known structured errors first.
  if (err && err.code === 11000) {
    return res.status(409).json({ error: 'Already exists.' })
  }
  if (err && err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  if (err && err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id.' })
  }
  if (err && /Database unavailable/.test(err.message)) {
    return res.status(503).json({ error: err.message })
  }

  console.error('[server] unhandled error:', err)
  return res.status(500).json({ error: 'Something went wrong.' })
})

// ── boot ────────────────────────────────────────────────────────────────
const start = () => {
  // Start listening FIRST so the API is reachable even while Mongo is
  // still connecting (or down entirely). Routes that need the DB will
  // return 503 from the /api readiness middleware until the connection
  // is up.
  app.listen(config.port, () => {
    console.log(`[server] listening on http://localhost:${config.port}`)
    console.log(`[server] env=${config.nodeEnv}  landing=${config.urls.landing}`)
  })

  // Connect to Mongo in the background. In dev, log and continue on
  // failure; in prod, fail loud.
  mongoose.set('strictQuery', true)
  mongoose
    .connect(config.mongodbUri, {
      serverSelectionTimeoutMS:
        config.nodeEnv === 'production' ? 30000 : 3000,
    })
    .then(() => {
      console.log(
        `[server] mongo connected: ${config.mongodbUri.replace(/\/\/.*@/, '//***@')}`
      )
    })
    .catch((err) => {
      if (config.nodeEnv === 'production') {
        console.error('[server] mongo connection failed:', err.message)
        process.exit(1)
      }
      console.error(
        '[server] mongo connection failed (dev mode — continuing without DB):',
        err.message
      )
      console.error(
        '[server] start it with: mongod  (or update MONGODB_URI in .env.dev)'
      )
    })
}

start()
