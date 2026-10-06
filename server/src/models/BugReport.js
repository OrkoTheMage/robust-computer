/**
 * server/src/models/BugReport.js
 *
 * Bug report submitted through the /bug-report page on the landing site.
 * Stored in Mongo for the team to triage, plus an email is sent to
 * the configured SMTP_FROM address so nothing is lost.
 *
 * Anonymous-friendly: name + email are optional (a reporter might
 * not want to identify themselves). The three repro fields are
 * required and the actual bug content.
 */

import mongoose from 'mongoose'

// collection: 'bug-reports' — explicit override of Mongoose's default
// pluralization (BugReport → bugreports). Pinned to match the new
// /bug-report public URL on the landing site (Commit Chunk 7 in
// updates.txt) so the route, the form, and the storage name all
// agree. The previous default-pluralized `bugreports` collection
// was dropped manually in dev + prod; new writes go to `bug-reports`.
const BugReportSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 200, default: '' },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 320,
      default: '',
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    whatWereYouDoing: { type: String, required: true, trim: true, maxlength: 5000 },
    whatExpected: { type: String, required: true, trim: true, maxlength: 5000 },
    whatHappened: { type: String, required: true, trim: true, maxlength: 5000 },
    browserDevice: { type: String, trim: true, maxlength: 500, default: '' },

    // bookkeeping
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true, collection: 'bug-reports' }
)

BugReportSchema.index({ createdAt: -1 })

export default mongoose.model('BugReport', BugReportSchema)
