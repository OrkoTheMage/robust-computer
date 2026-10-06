/**
 * server/src/utils/email.js
 *
 * Sends transactional email via the Resend HTTPS API
 * (POST https://api.resend.com/emails). One helper per template;
 * each pulls rendered { subject, html, text } from the templates/
 * directory and dispatches it.
 *
 * Why HTTPS, not SMTP: SMTP egress to smtp.resend.com was being
 * blocked (or its DNS was failing) in the Railway production
 * network. Port 443 is virtually never blocked on PaaS platforms,
 * so the REST API is the reliable path. Switching providers later
 * means swapping sendViaResend() — the three send*() helpers and
 * their callers don't change.
 *
 * Failures are caught and logged but never propagate to the route
 * handler — the underlying record is already persisted in Mongo
 * for the contact and bug-report paths, and a missed welcome
 * email is recoverable (the user can re-subscribe).
 */

import config from '../config.js'
import { subscriberConfirmation as renderSubscriber } from './email/subscriberConfirmation.js'
import { enquiryNotification as renderEnquiry } from './email/enquiryNotification.js'
import { bugReportNotification as renderBugReport } from './email/bugReportNotification.js'

const RESEND_URL = 'https://api.resend.com/emails'

// "Robust Computer <hello@robust.computer>" — the brand name in
// front of the address is what shows in the recipient's inbox.
// Stripped from address for cleaner logs.
const fromAddress = `"${config.brand.name}" <${config.email.from}>`

// One-line transport summary at module load so the runtime log
// proves the right env vars are wired in. If a deploy doesn't
// print this, the module wasn't loaded. If `key=missing`, the
// RESEND_API_KEY env var didn't take effect.
console.log(
  `[email] transport ready: provider=resend ` +
    `key=${config.email.resendApiKey ? 'set' : 'missing'} ` +
    `from=${config.email.from}`
)

/**
 * sendViaResend
 *
 * Low-level POST to the Resend API. Throws on non-2xx so the
 * caller can decide whether to swallow the error. Returns the
 * Resend response body on success, which includes the message id
 * for log correlation.
 */
const sendViaResend = async ({ to, subject, html, text, replyTo }) => {
  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.email.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })

  if (!res.ok) {
    // Resend returns a JSON body with { statusCode, message, name }
    // on errors. Surface that as the thrown message so the runtime
    // log shows both the HTTP status and the provider's reason.
    let detail
    try {
      detail = await res.text()
    } catch {
      detail = '(no response body)'
    }
    throw new Error(`Resend ${res.status}: ${detail}`)
  }

  return res.json()
}

/**
 * sendEnquiryNotification
 *
 * Notifies the team that a new project enquiry has landed. Sent
 * to the brand inbox, with Reply-To set to the enquirer's address
 * so the team can respond with one click in their mail client.
 * Best-effort: never blocks the API response.
 */
export const sendEnquiryNotification = async (enquiry) => {
  const { subject, html, text } = renderEnquiry(enquiry)
  console.log(
    `[email] sending enquiry notification to ${config.email.from} (subject: ${subject})`
  )

  try {
    const info = await sendViaResend({
      to: config.email.from,
      subject,
      html,
      text,
      replyTo: enquiry.email,
    })
    console.log(`[email] enquiry notification sent: id=${info.id}`)
  } catch (err) {
    console.error('[email] enquiry notification failed:', err.message)
  }
}

/**
 * sendSubscriberConfirmation
 *
 * Greets the new Field Notes subscriber. Best-effort: never blocks
 * the API response.
 */
export const sendSubscriberConfirmation = async (email) => {
  const { subject, html, text } = renderSubscriber(email)
  console.log(
    `[email] sending subscriber confirmation to ${email} (subject: ${subject})`
  )

  try {
    const info = await sendViaResend({ to: email, subject, html, text })
    console.log(`[email] subscriber confirmation sent: id=${info.id}`)
  } catch (err) {
    console.error('[email] subscriber confirmation failed:', err.message)
  }
}

/**
 * sendBugReportNotification
 *
 * Notifies the team that a bug report has been filed. Sent to the
 * brand inbox, with Reply-To set to the reporter's address if they
 * provided one (anonymous reports land with no Reply-To). Mirrors
 * the enquiry flow's best-effort contract — failures never block
 * the API response.
 */
export const sendBugReportNotification = async (report) => {
  const { subject, html, text } = renderBugReport(report)
  console.log(
    `[email] sending bug report notification to ${config.email.from} (subject: ${subject})`
  )

  try {
    const info = await sendViaResend({
      to: config.email.from,
      subject,
      html,
      text,
      replyTo: report.email || undefined,
    })
    console.log(`[email] bug report notification sent: id=${info.id}`)
  } catch (err) {
    console.error('[email] bug report notification failed:', err.message)
  }
}
