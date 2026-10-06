import mongoose from 'mongoose'

/**
 * server/src/models/Subscriber.js
 *
 * Newsletter subscriber. Unique on (email) so the same person can't
 * subscribe twice; resubscribing after an unsubscribe is fine because
 * we re-`save()` and clear the unsubscribed flag.
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
  },
  { timestamps: true }
)

SubscriberSchema.index({ email: 1 }, { unique: true })

export default mongoose.model('Subscriber', SubscriberSchema)
