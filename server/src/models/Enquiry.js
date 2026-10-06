import mongoose from 'mongoose'

/**
 * server/src/models/Enquiry.js
 *
 * Project enquiry submitted through the contact form on the landing site.
 * Stored in Mongo for the team to read + reply, plus an email is sent
 * to the configured SMTP_FROM address so nothing is lost.
 */

const EnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    company: { type: String, trim: true, maxlength: 200, default: '' },
    projectType: {
      type: String,
      enum: ['landing', 'webapp', 'saas', 'unsure'],
      required: true,
    },
    budget: {
      type: String,
      enum: ['under_5k', '5k_15k', '15k_50k', '50k_plus'],
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 5000 },

    // bookkeeping
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
)

EnquirySchema.index({ createdAt: -1 })

export default mongoose.model('Enquiry', EnquirySchema)
