import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import Subscriber from '../models/Subscriber.js'
import { sendSubscriberConfirmation } from '../utils/email.js'
import { newsletterLimiter } from '../middleware/rateLimit.js'

/**
 * server/src/routes/newsletter.js
 *
 * Two endpoints, both mounted under `/api` from src/index.js:
 *
 *   POST /api/newsletter   — subscribe an email to the newsletter.
 *                            Idempotent: re-subscribing an already-
 *                            subscribed address returns 200 with
 *                            `alreadySubscribed: true`, no duplicate
 *                            document.
 *
 *   POST /api/unsubscribe  — set `unsubscribedAt` on the matching
 *                            subscriber. Idempotent: unsubscribing
 *                            an already-unsubscribed address returns
 *                            200 with `alreadyUnsubscribed: true`;
 *                            unknown addresses return 200 the same
 *                            way so a stale link in an old email
 *                            never produces a user-visible error.
 */

const router = Router()

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

export default router
