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
  auth: config.smtp.user
    ? { user: config.smtp.user, pass: config.smtp.pass }
    : undefined,
})

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

  try {
    await transport.sendMail({
      from: fromAddress,
      to: config.smtp.from,
      replyTo: enquiry.email,
      subject,
      html,
      text,
    })
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

  try {
    await transport.sendMail({
      from: fromAddress,
      to: email,
      subject,
      html,
      text,
    })
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
