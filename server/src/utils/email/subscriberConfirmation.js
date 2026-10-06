/**
 * server/src/utils/email/subscriberConfirmation.js
 *
 * "Welcome to Field Notes" — fires after a successful newsletter
 * subscription. Confirms the signup, sets expectations (short
 * issues, frequent updates), and surfaces the unsubscribe link in
 * both the body and the brand footer.
 *
 * Returns { subject, html, text } — the caller (email.js) attaches
 * the recipient and sends. No SMTP here.
 */

import config from '../../config.js'
import { wrapHtml, wrapText, emailTokens } from './layout.js'

const { COLOR, FONT, escape } = emailTokens

const unsubscribeUrl = (email) =>
  `${config.landingUrl}/unsubscribe?email=${encodeURIComponent(email)}`

const buildHtml = (email) => {
  const unsub = unsubscribeUrl(email)
  const body = `
    <p style="margin:0 0 18px; font-family:${FONT.body}; font-size:18px; line-height:1.55; color:${COLOR.ink};">
      Thanks for subscribing to <strong>Field Notes</strong>.
    </p>
    <p style="margin:0 0 18px; font-family:${FONT.body}; font-size:18px; line-height:1.55; color:${COLOR.ink};">
      Short issues &mdash; updates frequently &mdash; on building software that lasts. Practical, no spam, unsubscribe any time.
    </p>
    <p style="margin:0; font-family:${FONT.body}; font-size:18px; line-height:1.55; color:${COLOR.ink};">
      The first one lands in your inbox at the start of next month. In the meantime, have a look around <a href="${escape(config.landingUrl)}" style="color:${COLOR.ink}; text-decoration:underline; text-underline-offset:3px; text-decoration-thickness:2px;">${escape(config.landingUrl.replace(/^https?:\/\//, ''))}</a>.
    </p>
  `

  // The ticket log "From" line is just the brand name (the email
  // address is already in the paper footer below). The type
  // identifies the email kind in a log of outbound mail.
  const log = {
    type: 'Field Notes · Welcome',
    from: config.brand.name,
  }

  return wrapHtml({
    preview: 'Thanks for subscribing to Field Notes.',
    heading: 'Field Notes',
    subhead: 'Welcome aboard',
    body,
    log,
    unsubscribeUrl: unsub,
  })
}

const buildText = (email) => {
  const unsub = unsubscribeUrl(email)
  const body = [
    'Thanks for subscribing to Field Notes.',
    '',
    'Short issues — updates frequently — on building software that',
    'lasts. Practical, no spam, unsubscribe any time.',
    '',
    `The first one lands in your inbox at the start of next month.`,
    `In the meantime, have a look around ${config.landingUrl}.`,
  ].join('\n')

  const log = {
    type: 'Field Notes · Welcome',
    from: config.brand.name,
  }

  const footerLines = [
    `Unsubscribe: ${unsub}`,
  ]

  return wrapText({
    heading: 'Field Notes',
    subhead: 'Welcome aboard',
    log,
    body,
    footerLines,
  })
}

export const subscriberConfirmation = (email) => ({
  subject: 'Welcome to Field Notes',
  html: buildHtml(email),
  text: buildText(email),
})
