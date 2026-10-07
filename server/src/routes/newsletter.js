import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { timingSafeEqual } from 'node:crypto'
import config from '../config.js'
import Subscriber from '../models/Subscriber.js'
import { sendSubscriberConfirmation } from '../utils/email.js'
import { broadcastNewIssue } from '../utils/newsletterBroadcast.js'
import { newsletterLimiter, broadcastLimiter } from '../middleware/rateLimit.js'

/**
 * server/src/routes/newsletter.js
 *
 * Three endpoints, all mounted under `/api` from src/index.js:
 *
 *   POST /api/newsletter            — subscribe an email to the
 *                                     newsletter. Idempotent:
 *                                     re-subscribing an
 *                                     already-subscribed address
 *                                     returns 200 with
 *                                     `alreadySubscribed: true`, no
 *                                     duplicate document.
 *
 *   POST /api/unsubscribe           — set `unsubscribedAt` on the
 *                                     matching subscriber.
 *                                     Idempotent: unsubscribing an
 *                                     already-unsubscribed address
 *                                     returns 200 with
 *                                     `alreadyUnsubscribed: true`;
 *                                     unknown addresses return 200
 *                                     the same way so a stale link
 *                                     in an old email never
 *                                     produces a user-visible error.
 *
 *   POST /api/newsletter/broadcast  — admin-gated. Fires
 *                                     `broadcastNewIssue` against
 *                                     every active subscriber who
 *                                     hasn't received the slug yet.
 *                                     Used by `scripts/build-rss.mjs`
 *                                     after a feed regen, and by an
 *                                     admin re-broadcast via curl.
 *                                     Auth is the shared
 *                                     `NEWSLETTER_ADMIN_SECRET`
 *                                     header (`x-admin-secret`).
 *                                     Returns 202 immediately;
 *                                     the broadcast runs in the
 *                                     background and logs its own
 *                                     progress.
 */

const router = Router()

/**
 * safeEqual
 *
 * Constant-time string comparison via Node's
 * `crypto.timingSafeEqual`. Avoids a timing-side-channel that
 * would let an attacker guess the secret one byte at a time.
 *
 * Both sides are length-checked first because timingSafeEqual
 * throws on length mismatch — the fallback branch is unreachable
 * in practice (an attacker can't choose to hit a same-length
 * comparison by failing the length check), but it's there so a
 * deployer who sets a different-length secret doesn't crash the
 * server.
 */

/**
 * requireAdminSecret
 *
 * Gates an admin-only route by the shared
 * `NEWSLETTER_ADMIN_SECRET` env var. Used by
 * `/newsletter/broadcast` so anyone with the public URL
 * can't fire a broadcast — the secret is the only auth.
 */

const safeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

const requireAdminSecret = (req, res, next) => {
  const provided = req.get('x-admin-secret') || ''
  if (!safeEqual(provided, config.newsletter.adminSecret)) {
    return res.status(403).json({ error: 'Forbidden.' })
  }
  next()
}

router.post(
  '/newsletter',
  newsletterLimiter,
  [body('email').isEmail().normalizeEmail()],
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Please enter a valid email address.',
        details: errors.array(),
      })
    }

    const email = req.body.email

    try {
      const existing = await Subscriber.findOne({ email })
      if (existing && !existing.unsubscribedAt) {
        return res.status(200).json({ ok: true, alreadySubscribed: true })
      }
      if (existing && existing.unsubscribedAt) {
        existing.unsubscribedAt = null
        await existing.save()
      } else {
        await Subscriber.create({ email })
      }

      sendSubscriberConfirmation(email)
      return res.status(201).json({ ok: true })
    } catch (err) {
      if (err && err.code === 11000) {
        // Race condition on unique index — treat as success.
        return res.status(200).json({ ok: true, alreadySubscribed: true })
      }
      return next(err)
    }
  }
)

// Re-uses `newsletterLimiter` (5/hr per IP) — the unsubscribe
// action is idempotent, but a runaway script hammering the
// endpoint still costs a DB write per call, and 5/hr is more
// than enough for any real human who clicked the email link.
router.post(
  '/unsubscribe',
  newsletterLimiter,
  [body('email').isEmail().normalizeEmail()],
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Please enter a valid email address.',
        details: errors.array(),
      })
    }

    const email = req.body.email

    try {
      const existing = await Subscriber.findOne({ email })
      if (!existing || existing.unsubscribedAt) {
        // Unknown address or already unsubscribed — both are
        // success states for the caller. Returning a distinct
        // flag lets the UI render the same confirmation card
        // without revealing whether the address was ever on
        // the list.
        return res.status(200).json({ ok: true, alreadyUnsubscribed: true })
      }

      existing.unsubscribedAt = new Date()
      await existing.save()
      return res.status(200).json({ ok: true })
    } catch (err) {
      return next(err)
    }
  }
)

// Admin-gated. The build script and any manual re-broadcast
// fire this. Returns 202 immediately; the broadcast itself
// runs in the background and logs its own progress.
//
// `broadcastLimiter` (separate from `newsletterLimiter`)
// rate-limits by IP at a much higher cap because the
// legitimate caller is the build script, not a human. The
// admin-secret gate is the real auth — the limiter is just
// belt-and-suspenders against a script run gone wild.
router.post(
  '/newsletter/broadcast',
  broadcastLimiter,
  requireAdminSecret,
  [
    body('slug').isString().trim().isLength({ min: 1, max: 200 }),
    body('issuePrefix').isString().trim().isLength({ min: 1, max: 50 }),
    body('title').isString().trim().isLength({ min: 1, max: 300 }),
    body('description').isString().trim().isLength({ min: 1, max: 500 }),
    body('pubDate').isString().trim().isLength({ min: 1, max: 50 }),
    body('url').isString().trim().isURL(),
    body('author').optional().isString().trim().isLength({ max: 200 }),
  ],
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Please check the broadcast payload.',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      })
    }

    // Fire-and-forget. The build script doesn't need to wait
    // for the full send, and the admin curl that re-broadcasts
    // a single issue shouldn't hang the HTTP request. The
    // promise is intentionally not awaited; the .catch below
    // is the only safety net against an unhandled rejection
    // (a thrown error from `broadcastNewIssue` before the
    // send loop starts).
    broadcastNewIssue(req.body).catch((err) => {
      console.error(`[broadcast] ${req.body.slug}: crashed:`, err)
    })

    return res.status(202).json({ ok: true, queued: true, slug: req.body.slug })
  }
)

export default router