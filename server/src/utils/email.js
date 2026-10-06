/**
 * server/src/utils/email.js
 *
 * Single nodemailer transport + per-template send helpers. The
 * transport is shared across sends (Mailpit / SMTP both work — the
 * difference is host + credentials). Each send*() function pulls a
 * rendered { subject, html, text } from the templates/ directory
 * and dispatches it. SMTP failures never propagate to the API
 * response — the underlying record is already persisted in Mongo
 * for the contact path, and a missed welcome email is recoverable
 * (the user can re-subscribe).
 */

import nodemailer from 'nodemailer'
import config from '../config.js'
import { subscriberConfirmation as renderSubscriber } from './email/subscriberConfirmation.js'
import { enquiryNotification as renderEnquiry } from './email/enquiryNotification.js'
import { bugReportNotification as renderBugReport } from './email/bugReportNotification.js'

const transport = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  // Fail fast on connection issues — nodemailer default is 120s,
  // which is long enough to make a 502 look like a hang.
  connectionTimeout: 5_000,
  // Same for individual socket operations after connect.
  socketTimeout: 10_000,
  auth: config.smtp.user
    ? { user: config.smtp.user, pass: config.smtp.pass }
    : undefined,
})

// One-line transport summary at module load so the runtime log
// proves the right env vars are wired in (host, port, secure,
// whether auth is set, and the from address). If a deploy
// doesn't print this, the module wasn't loaded. If the values
// don't match the deployer's intent, the env vars didn't take
// effect.
console.log(
  `[email] transport ready: host=${config.smtp.host} ` +
    `port=${config.smtp.port} secure=${config.smtp.secure} ` +
    `auth=${config.smtp.user ? 'set' : 'none'} from=${config.smtp.from}`
)

// Sender name in the From header — small touch, but matters for
// inbox recognition. Nodemailer accepts "Name <addr@host>".
const fromAddress = `"${config.brand.name}" <${config.smtp.from}>`

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
  console.log(`[email] sending enquiry notification to ${config.smtp.from} (subject: ${subject})`)

  try {
    const info = await transport.sendMail({
      from: fromAddress,
      to: config.smtp.from,
      replyTo: enquiry.email,
      subject,
      html,
      text,
    })
    console.log(`[email] enquiry notification sent: messageId=${info.messageId}`)
  } catch (err) {
    // Log but don't throw — the API response shouldn't depend on SMTP.
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
  console.log(`[email] sending subscriber confirmation to ${email} (subject: ${subject})`)

  try {
    const info = await transport.sendMail({
      from: fromAddress,
      to: email,
      subject,
      html,
      text,
    })
    console.log(`[email] subscriber confirmation sent: messageId=${info.messageId}`)
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
 * the enquiry flow's best-effort contract — SMTP failures never
 * block the API response.
 */
export const sendBugReportNotification = async (report) => {
  const { subject, html, text } = renderBugReport(report)

  try {
    await transport.sendMail({
      from: fromAddress,
      to: config.smtp.from,
      replyTo: report.email || undefined,
      subject,
      html,
      text,
    })
  } catch (err) {
    console.error('[email] bug report notification failed:', err.message)
  }
}
