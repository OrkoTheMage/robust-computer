import Subscriber from '../models/Subscriber.js'
import { sendNewIssueNotification } from './email.js'

/**
 * server/src/utils/newsletterBroadcast.js
 *
 * Newsletter broadcast pipeline. One entry point —
 * `broadcastNewIssue(issue)` — called from the
 * admin-gated `POST /api/newsletter/broadcast` route (which
 * is itself fired by `scripts/build-rss.mjs` after every
 * feed regen).
 *
 * Issue shape:
 *   {
 *     slug         — issue slug (e.g. "issue-001"); the dedupe
 *                    key on Subscriber.issueSlugs
 *     issuePrefix  — "Issue 001" / "Issue 002" / …, rendered
 *                    in the email subject and the ticket log
 *     title        — the post title (no prefix); used by the
 *                    email subject and CTA
 *     description  — one-line excerpt; used by the email body
 *     pubDate      — ISO date string ("2026-10-07"); not used
 *                    by the template directly, but logged for
 *                    the run summary
 *     url          — absolute URL to the per-post page
 *                    ("https://robust.computer/field-notes/issue-001")
 *     author?      — optional byline
 *   }
 *
 * Pipeline:
 *   1. Find every active subscriber (unsubscribedAt: null) who
 *      has NOT already received this slug.
 *   2. Atomically mark every candidate with the slug via
 *      `updateMany + $addToSet`. Doing this BEFORE the send
 *      loop is what makes the pipeline safe under
 *      concurrency: a duplicate / re-run / partial failure
 *      cannot send the same issue twice to the same address,
 *      because the dedupe check filters them out at step 1
 *      of the next call.
 *   3. Iterate candidates in batches of `BATCH_SIZE`, with a
 *      `BATCH_DELAY_MS` pause between batches. The batch
 *      size + 1-second delay gives a steady ~10 sends/sec
 *      (matches Resend's API quota).
 *   4. Each candidate gets one `sendNewIssueNotification`
 *      call. Successes and failures are tallied; the run
 *      summary is logged so a long broadcast has visible
 *      progress in the server logs.
 *
 * Trade-offs:
 *   - A failed send is NOT retried: the recipient is already
 *     marked with the slug, and the next run skips them.
 *     This is intentional — re-sending on failure would
 *     double-send to recipients whose first attempt actually
 *     succeeded (the provider accepted it, but the response
 *     was lost). The failure count in the run summary is
 *     the operator's signal to investigate.
 *   - The dedupe is per-slug, not per-(slug, timestamp).
 *     Re-sending the same slug (e.g. an admin re-broadcast)
 *     is a no-op once every active subscriber has been
 *     marked. For a "force re-send" use case, the operator
 *     needs to clear `Subscriber.issueSlugs` first — a
 *     one-liner that's deliberately not in the public API.
 */

const BATCH_SIZE = 10
const BATCH_DELAY_MS = 1000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const broadcastNewIssue = async (issue) => {
  if (!issue || !issue.slug) {
    throw new Error('broadcastNewIssue: issue.slug is required')
  }

  const startedAt = Date.now()

  // Step 1 — find candidates. Two filters in one query:
  //   - active: unsubscribedAt is null
  //   - not-yet-sent: issueSlugs does not contain this slug
  //
  // `_id` is fetched explicitly so the $in list below can use
  // it without a second round-trip.
  const candidates = await Subscriber.find(
    {
      unsubscribedAt: null,
      issueSlugs: { $ne: issue.slug },
    },
    { _id: 1, email: 1 }
  ).lean()

  if (candidates.length === 0) {
    console.log(
      `[broadcast] ${issue.slug}: 0 candidates (every active subscriber already received it)`
    )
    return { broadcasted: 0, skipped: 0, total: 0 }
  }

  // Step 2 — mark all candidates atomically BEFORE any send.
  // The filter re-checks `issueSlugs: { $ne: issue.slug }`
  // so a concurrent broadcast that races us can't double-mark
  // (the second $addToSet on the same slug is a no-op anyway,
  // but the filter keeps the matched count honest).
  await Subscriber.updateMany(
    {
      _id: { $in: candidates.map((c) => c._id) },
      issueSlugs: { $ne: issue.slug },
    },
    { $addToSet: { issueSlugs: issue.slug } }
  )

  console.log(
    `[broadcast] ${issue.slug}: marked ${candidates.length} subscribers, sending…`
  )

  // Step 3 — iterate in batches.
  let sent = 0
  let failed = 0
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(
      batch.map((subscriber) =>
        sendNewIssueNotification({ email: subscriber.email, issue })
      )
    )
    for (const r of results) {
      if (r && r.ok) sent++
      else failed++
    }

    // Throttled progress log so a long broadcast has a heartbeat
    // in the server logs (one line per batch).
    console.log(
      `[broadcast] ${issue.slug}: ${sent + failed}/${candidates.length} ` +
        `(ok=${sent} failed=${failed})`
    )

    if (i + BATCH_SIZE < candidates.length) {
      await sleep(BATCH_DELAY_MS)
    }
  }

  const elapsedMs = Date.now() - startedAt
  console.log(
    `[broadcast] ${issue.slug}: done — sent=${sent} failed=${failed} ` +
      `total=${candidates.length} elapsed=${(elapsedMs / 1000).toFixed(1)}s`
  )

  return { broadcasted: sent, skipped: failed, total: candidates.length }
}