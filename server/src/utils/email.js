/**
 * server/src/utils/email.js
 *
 * Sends transactional email. Two transports, picked at module load
 * by `config.isProduction`:
 *
 *   production  → Resend HTTPS API (Railway blocks SMTP egress to
 *                 Resend; 443 is the only reliably open port)
 *   any other   → nodemailer over SMTP (mailpit on localhost:1025
 *                 in dev, real SMTP server in staging)
 *
 * One helper per template; each pulls rendered
 * { subject, html, text } from the templates/ directory and hands
 * it to `sendViaProvider`. The provider returns a normalised
 * `{ messageId, id }` shape so the success log line works for both
 * branches.
 *
 * Failures are caught and logged but never propagate to the route
 * handler — the underlying record is already persisted in Mongo
 * for the contact and bug-report paths, and a missed welcome
 * email is recoverable (the user can re-subscribe).
 */

import nodemailer from 'nodemailer'
import config from '../config.js'
import { subscriberConfirmation as renderSubscriber } from './email/subscriberConfirmation.js'
import { enquiryNotification as renderEnquiry } from './email/enquiryNotification.js'
import { bugReportNotification as renderBugReport } from './email/bugReportNotification.js'

// "Robust Computer <hello@robust.computer>" — the brand name in
// front of the address is what shows in the recipient's inbox.
const fromAddress = `"${config.brand.name}" <${config.email.from}>`

let sendViaProvider

if (config.isProduction) {
  // ── Resend (HTTPS) ──────────────────────────────────────────────
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
   * Resend response body on success (has `id`), normalised to
   * `{ messageId }` by the dispatcher below.
   */
  sendViaProvider = async ({ to, subject, html, text, replyTo }) => {
    const res = await fetch('https://api.resend.com/emails', {
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
} else {
  // ── SMTP (nodemailer) ───────────────────────────────────────────
  // Same shape of "transport ready" log as the Resend branch so a
  // runtime log can be read by either branch and the relevant
  // vars are visible. If `auth=none`, SMTP_USER was empty in the
  // env (mailpit in dev doesn't authenticate).
  const transport = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.secure,
    // Fail fast on connection issues — nodemailer default is 120s,
    // which is long enough to make a 502 look like a hang.
    connectionTimeout: 5_000,
    socketTimeout: 10_000,
    auth: config.email.smtp.user
      ? { user: config.email.smtp.user, pass: config.email.smtp.pass }
      : undefined,
  })

  console.log(
    `[email] transport ready: provider=smtp ` +
      `host=${config.email.smtp.host} ` +
      `port=${config.email.smtp.port} ` +
      `secure=${config.email.smtp.secure} ` +
      `auth=${config.email.smtp.user ? 'set' : 'none'} ` +
      `from=${config.email.from}`
  )

  /**
   * sendViaNodemailer
   *
   * Low-level SMTP send via the pre-built transport. Throws on
   * send failure (connection refused, SMTP error response, etc.)
   * so the caller can decide whether to swallow. Returns the
   * nodemailer info object (has `messageId`).
   */
  sendViaProvider = async ({ to, subject, html, text, replyTo }) => {
    const info = await transport.sendMail({
      from: fromAddress,
      // nodemailer wants a comma-separated string, not an array
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    })
    return info
  }
}

// Normalise the provider's success result so the log line below
// works for both branches. Resend returns `{ id }`, nodemailer
// returns `{ messageId }`; the log uses whichever is present.
const providerId = (info) => info?.id || info?.messageId || 'unknown'

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
    const info = await sendViaProvider({
      to: config.email.from,
      subject,
      html,
      text,
      replyTo: enquiry.email,
    })
    console.log(`[email] enquiry notification sent: id=${providerId(info)}`)
  } catch (err) {
    console.error('[email] enquiry notification failed:', err.message)
  }
}

/**
 * sendSubscriberConfirmation
 *
 * Greets the new newsletter subscriber. Best-effort: never blocks
 * the API response.
 */
export const sendSubscriberConfirmation = async (email) => {
  const { subject, html, text } = renderSubscriber(email)
  console.log(
    `[email] sending subscriber confirmation to ${email} (subject: ${subject})`
  )

  try {
    const info = await sendViaProvider({ to: email, subject, html, text })
    console.log(`[email] subscriber confirmation sent: id=${providerId(info)}`)
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
    const info = await sendViaProvider({
      to: config.email.from,
      subject,
      html,
      text,
      replyTo: report.email || undefined,
    })
    console.log(`[email] bug report notification sent: id=${providerId(info)}`)
  } catch (err) {
    console.error('[email] bug report notification failed:', err.message)
  }
}
