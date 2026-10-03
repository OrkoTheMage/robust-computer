/**
 * server/src/routes/contact.js
 *
 * POST /api/contact — project enquiry from the landing site's contact
 * page. Validates with express-validator, persists to Mongo, fires an
 * email notification. Returns a generic 200 on success.
 */

import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import Enquiry from '../models/Enquiry.js'
import { sendEnquiryNotification } from '../utils/email.js'
import { enquiryLimiter } from '../middleware/rateLimit.js'

const router = Router()

const PROJECT_TYPES = ['landing', 'webapp', 'saas', 'unsure']
const BUDGETS = ['under_5k', '5k_15k', '15k_50k', '50k_plus']

router.post(
  '/',
  enquiryLimiter,
  [
    body('name').isString().trim().isLength({ min: 1, max: 200 }),
    body('email').isEmail().normalizeEmail(),
    body('company').optional().isString().trim().isLength({ max: 200 }),
    body('projectType').isIn(PROJECT_TYPES),
    body('budget').isIn(BUDGETS),
    body('message').isString().trim().isLength({ min: 1, max: 5000 }),
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
      const enquiry = await Enquiry.create({
        name: req.body.name,
        email: req.body.email,
        company: req.body.company || '',
        projectType: req.body.projectType,
        budget: req.body.budget,
        message: req.body.message,
        ip: req.ip,
        userAgent: req.get('user-agent') || '',
      })

      // Best-effort email — never let it fail the request.
      sendEnquiryNotification(enquiry)

      return res.status(201).json({ ok: true, id: enquiry._id })
    } catch (err) {
      return next(err)
    }
  }
)

export default router
