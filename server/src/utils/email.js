/**
 * server/src/utils/email.js
 *
 * Single nodemailer transport + per-template send helpers. Reuse one
 * transport across sends (Mailpit / SMTP both work — the difference is
 * just host + credentials).
 */

import nodemailer from 'nodemailer'
import config from '../config.js'

const transport = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: config.smtp.user
    ? { user: config.smtp.user, pass: config.smtp.pass }
    : undefined,
})

/**
 * sendEnquiryNotification
 *
 * Notifies the team that a new project enquiry has landed. Falls back
 * to a no-op if SMTP is unavailable — the enquiry is already persisted
 * in Mongo, so we never want email failure to drop the request.
 */
export const sendEnquiryNotification = async (enquiry) => {
  const subject = `[Robust Computer] New enquiry from ${enquiry.name}`
  const text = [
    `Name:     ${enquiry.name}`,
    `Email:    ${enquiry.email}`,
    `Company:  ${enquiry.company || '—'}`,
    `Type:     ${enquiry.projectType}`,
    `Budget:   ${enquiry.budget}`,
    '',
    'Message:',
    enquiry.message,
  ].join('\n')

  try {
    await transport.sendMail({
      from: config.smtp.from,
      to: config.smtp.from,
      replyTo: enquiry.email,
      subject,
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
 * Greets the new subscriber. Best-effort: never blocks the API response.
 */
export const sendSubscriberConfirmation = async (email) => {
  const subject = 'Welcome to Field Notes'
  const text = [
    "Thanks for subscribing to Field Notes.",
    '',
    'One short email a month on building software that lasts. Practical, no spam.',
    `Unsubscribe any time: ${config.urls.landing}/unsubscribe?email=${encodeURIComponent(email)}`,
  ].join('\n')

  try {
    await transport.sendMail({
      from: config.smtp.from,
      to: email,
      subject,
      text,
    })
  } catch (err) {
    console.error('[email] subscriber confirmation failed:', err.message)
  }
}
