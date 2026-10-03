/**
 * server/src/routes/newsletter.js
 *
 * POST /api/newsletter — subscribe an email to Field Notes.
 * Idempotent: re-subscribing an already-subscribed address returns
 * the same 200, with no duplicate document.
 */

import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import Subscriber from '../models/Subscriber.js'
import { sendSubscriberConfirmation } from '../utils/email.js'
import { newsletterLimiter } from '../middleware/rateLimit.js'

const router = Router()

router.post(
  '/',
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

export default router
