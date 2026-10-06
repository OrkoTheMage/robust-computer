/**
 * server/src/routes/bugReport.js
 *
 * POST /api/bug-report — bug report from the landing site's
 * /bugreport page. Validates with express-validator, persists
 * to Mongo, fires an email notification. Returns a generic
 * 200 on success.
 *
 * The three repro fields are required; the reporter's name +
 * email and the browser/device line are optional (the form is
 * anonymous-friendly).
 */

import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import BugReport from '../models/BugReport.js'
import { sendBugReportNotification } from '../utils/email.js'
import { bugReportLimiter } from '../middleware/rateLimit.js'

const router = Router()

router.post(
  '/',
  bugReportLimiter,
  [
    body('name').optional().isString().trim().isLength({ max: 200 }),
    body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
    body('whatWereYouDoing').isString().trim().isLength({ min: 1, max: 5000 }),
    body('whatExpected').isString().trim().isLength({ min: 1, max: 5000 }),
    body('whatHappened').isString().trim().isLength({ min: 1, max: 5000 }),
    body('browserDevice').optional().isString().trim().isLength({ max: 500 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Please check the highlighted fields.',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      })
    }

    try {
      const report = await BugReport.create({
        name: req.body.name || '',
        email: req.body.email || '',
        whatWereYouDoing: req.body.whatWereYouDoing,
        whatExpected: req.body.whatExpected,
        whatHappened: req.body.whatHappened,
        browserDevice: req.body.browserDevice || '',
        ip: req.ip,
        userAgent: req.get('user-agent') || '',
      })

      // Best-effort email — never let it fail the request.
      sendBugReportNotification(report)

      return res.status(201).json({ ok: true, id: report._id })
    } catch (err) {
      return next(err)
    }
  }
)

export default router
