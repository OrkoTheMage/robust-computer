/**
 * server/src/middleware/rateLimit.js
 *
 * Per-route rate limiters for the public form endpoints. Same in-memory
 * store is fine at this scale — for a multi-instance deploy, swap in
 * `rate-limit-redis` here.
 */

import rateLimit from 'express-rate-limit'

export const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many enquiries from this address. Please try again later.' },
})

export const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many subscribe attempts. Please try again later.' },
})
