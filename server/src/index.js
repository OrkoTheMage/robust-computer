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
import bugReportRoutes from './routes/bugReport.js'

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
const allow = new Set([config.landingUrl, config.apiUrl])
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
  res.json({ ok: true, env: config.env, time: new Date().toISOString() })
})

// Root-level /health for Railway's default health check, which hits
// `/` unless overridden in the service's Healthcheck settings. Returns
// 200 with no body so the proxy marks the container healthy; the
// /api/health endpoint above is the one that exposes env/time info.
app.get('/health', (_req, res) => res.status(200).end())

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
app.use('/api/bug-report', bugReportRoutes)

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

  console.error('unhandled error:', err)
  return res.status(500).json({ error: 'Something went wrong.' })
})

// ── boot ────────────────────────────────────────────────────────────────
let server

const start = () => {
  console.log(
    `📦 Environment: ${config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`
  )

  // Start the HTTP listener FIRST, then connect to Mongo in the
  // background. Why this order:
  //   - Railway (and any other proxy-based host) fires health checks
  //     within seconds of container start. If we wait for Mongo before
  //     listening, the health check times out, the service is marked
  //     unhealthy, and every request 502s until the next deploy.
  //   - `/api/health` is registered before the /api middleware that
  //     checks DB readiness, so it returns 200 even if Mongo is down.
  //   - The /api middleware returns 503 for any request that needs the
  //     DB, so a Mongo outage degrades gracefully instead of
  //     502-ing the whole service.
  // We log the Mongo failure but do NOT exit in production — keeping
  // the container alive means a Mongo recovery (or a redeploy with a
  // fixed connection string) doesn't require a separate restart.
  server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${config.port}`)
  })

  mongoose.set('strictQuery', true)
  mongoose
    .connect(config.mongoUri, {
      serverSelectionTimeoutMS: config.isProduction ? 30000 : 3000,
    })
    .then(() => {
      const dbName =
        config.mongoUri.match(/\/([^/?]+)(?:\?|$)/)?.[1] ?? 'unknown'
      console.log(`✅ Connected to MongoDB: ${dbName}`)
    })
    .catch((err) => {
      console.error(`❌ MongoDB connection failed: ${err.message}`)
      if (!config.isProduction) {
        console.error(
          'start it with: mongod  (or update MONGODB_URI in .env.dev)'
        )
      }
    })
}

// ── shutdown ────────────────────────────────────────────────────────────
// Capture SIGINT (Ctrl+C, `node --watch` restart) and SIGTERM (Railway /
// Fly / Render shutdown). Print the same shape as boot, in order:
// signal → server closed → mongo disconnected.
let isShuttingDown = false

const shutdown = async (signal) => {
  if (isShuttingDown) return
  isShuttingDown = true

  // Force exit if shutdown hangs (stuck in-flight request or Mongo
  // disconnect stalls). 10s is generous; most clean shutdowns finish
  // in milliseconds.
  const forceExit = setTimeout(() => process.exit(1), 10_000)
  forceExit.unref()

  console.log(`🛑 Received ${signal}, shutting down server...`)

  // Stop accepting new connections, wait for in-flight requests.
  if (server) {
    await new Promise((resolve) => server.close(resolve))
    console.log('✅ Shutdown complete')
  }

  // Close the MongoDB connection.
  try {
    await mongoose.disconnect()
    console.log('⚠️  MongoDB disconnected')
  } catch (err) {
    console.error(`❌ MongoDB disconnect failed: ${err.message}`)
  }

  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

start()
