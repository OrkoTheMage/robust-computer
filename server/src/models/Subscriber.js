import mongoose from 'mongoose'

/**
 * server/src/models/Subscriber.js
 *
 * Newsletter subscriber. Unique on (email) so the same person can't
 * subscribe twice; resubscribing after an unsubscribe is fine because
 * we re-`save()` and clear the unsubscribed flag.
 *
 * `issueSlugs` is the per-subscriber dedupe key for the broadcast
 * pipeline. The build script (and the admin-gated `/broadcast`
 * endpoint) call `broadcastNewIssue`, which marks every active
 * subscriber as having received the slug atomically before sending —
 * so a re-run, a concurrent call, or a partially-completed batch
 * never produces a duplicate send to the same address. See
 * `utils/newsletterBroadcast.js` for the full pipeline.
 */

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    unsubscribedAt: { type: Date, default: null },
    issueSlugs: { type: [String], default: [] },
  },
  { timestamps: true }
)

SubscriberSchema.index({ email: 1 }, { unique: true })
SubscriberSchema.index({ issueSlugs: 1 })

export default mongoose.model('Subscriber', SubscriberSchema)
