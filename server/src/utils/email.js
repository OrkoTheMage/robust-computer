import nodemailer from 'nodemailer'
import config from '../config.js'
import {
  subscriberConfirmation as renderSubscriber,
} from './email/subscriberConfirmation.js'
import { enquiryNotification as renderEnquiry } from './email/enquiryNotification.js'
import { bugReportNotification as renderBugReport } from './email/bugReportNotification.js'
import { newIssueNotification as renderNewIssue } from './email/newIssueNotification.js'
import {
  unsubscribeUrl as sharedUnsubscribeUrl,
  unsubscribeMailtoAddress,
} from './email/layout.js'

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
 * Per-message envelope is built in one place — `buildMessage` —
 * so the From / Reply-To / Return-Path defaults and the
 * List-Unsubscribe / List-Unsubscribe-Post headers (RFC 8058)
 * are applied consistently across every email type AND every
 * transport. Mailpit can't catch a DKIM misconfig (it never
 * authenticates the inbound messages), so production smoke
 * tests must run against a real Gmail inbox; see
 * `docs/email-auth.md` for the verification steps.
 *
 * One helper per template; each pulls rendered
 * { subject, html, text } from `utils/email/` and hands the
 * `Message` plus the per-type `context` (used to derive the
 * unsubscribe URL) to `dispatch`. `dispatch` normalises onto
 * `{ messageId, id }` so the success log line works for both
 * branches.
 *
 * Failures are caught and logged but never propagate to the route
 * handler — the underlying record is already persisted in Mongo
 * for the contact and bug-report paths, and a missed welcome
 * email is recoverable (the user can re-subscribe).
 */

// ── From / Reply-To / Return-Path defaults ────────────────────────────────
// Every email type uses the same branded `From` display string.
// `replyTo` defaults to BRAND_EMAIL so anyone hitting "Reply" reaches
// the team inbox. Team-facing emails (enquiry, bug-report) override
// with the enquirer's/reporter's address so the team can reply with
// one click in their mail client — that override is the only
// exception to the default. Return-Path is the SMTP MAIL FROM and
// is what bounces bounce back to; both providers are set to
// BRAND_EMAIL here.
const fromAddress = `"${config.brand.name}" <${config.email.from}>`
const defaultReplyTo = config.brand.email

// ── Unsubscribe URL derivation ────────────────────────────────────────────
// Per-type switch so the HTTP(S) entry of the List-Unsubscribe header
// matches the body link the template renders. Subscribers and
// new-issue readers hit a per-recipient HTTPS URL; team-facing
// emails (enquiry, bug-report) have no per-recipient unsubscribe
// and emit only the mailto entry per RFC 8058. The URL builder
// itself lives in `email/layout.js` so the header URL and the body
// link can't drift.
const unsubscribeUrlFor = (type, email) => {
  if (type === 'subscriber' || type === 'issue') {
    return sharedUnsubscribeUrl(email)
  }
  return null
}

const unsubscribeMailto = unsubscribeMailtoAddress

/**
 * buildListUnsubscribeHeaders
 *
 * Builds the `{ 'List-Unsubscribe': …, 'List-Unsubscribe-Post': … }`
 * pair RFC 8058 requires. The mailto entry always points at
 * `BRAND_EMAIL` so unsubscribe via mail works even when no HTTP(S)
 * variant is meaningful (team-facing emails). The HTTP(S) entry is
 * included only when a per-recipient unsubscribe URL exists.
 */
const buildListUnsubscribeHeaders = (httpUrl) => {
  const mailtoPart = `<mailto:${unsubscribeMailto}>`
  const headers = {
    'List-Unsubscribe': httpUrl ? `${mailtoPart}, <${httpUrl}>` : mailtoPart,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
  return headers
}

/**
 * buildMessage
 *
 * Assembles the per-message payload both branches consume. Inputs:
 *   `to`                — recipient address(es)
 *   `subject` `html` `text` — rendered content
 *   `replyTo`           — override; defaults to BRAND_EMAIL
 *   `unsubscribeUrl`    — per-recipient HTTPS unsubscribe (newsletter
 *                         types only). When null, only the mailto
 *                         form of List-Unsubscribe is emitted.
 *
 * Returns an object with `headers`, `replyTo`, and a `nodemailer`
 * envelope shape (only used by the SMTP branch).
 */
const buildMessage = ({ to, subject, html, text, replyTo, unsubscribeUrl }) => {
  const finalReplyTo = replyTo || defaultReplyTo
  const headers = buildListUnsubscribeHeaders(unsubscribeUrl)
  const toArray = Array.isArray(to) ? to : [to]
  return {
    headers,
    replyTo: finalReplyTo,
    // SMTP envelope: MAIL FROM (<…> Return-Path). Must be BRAND_EMAIL
    // for DMARC alignment (mirrors the From: domain). The display
    // From: header on the message is still the human-readable
    // `fromAddress` above (e.g. "Robust Computer <hello@…>").
    smtpEnvelope: {
      from: config.email.from,
      to: toArray,
    },
  }
}

let sendViaProvider

if (config.isProduction) {
  // ── Resend (HTTPS) ──────────────────────────────────────────────
  // One-line transport summary at module load so the runtime log
  // proves the right env vars are wired in. If a deploy doesn't
  // print this, the module wasn't loaded. If `key=missing`, the
  // RESEND_API_KEY env var didn't take effect. `dkim=` reports
  // which signing domain the deployer mirrored into the Resend
  // dashboard so a deploy missing the DKIM pair shows at a glance.
  console.log(
    `[email] transport ready: provider=resend ` +
      `key=${config.email.resendApiKey ? 'set' : 'missing'} ` +
      `dkim=${config.email.dkim ? config.email.dkim.domainName : 'missing'} ` +
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
  sendViaProvider = async ({ to, subject, html, text, headers, replyTo }) => {
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
        reply_to: replyTo,
        // Resend forwards each header pair on the emitted email as
        // a top-level header line; List-Unsubscribe and
        // List-Unsubscribe-Post surface verbatim to recipients.
        headers,
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
  // env (mailpit in dev doesn't authenticate). `dkim=on` /
  // `dkim=off` confirms whether the transport is signing (when
  // DKIM_PRIVATE_KEY is set) or sending raw (mailpit-only path).
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
    // DKIM signing — nodeMailer's built-in. Optional in dev because
    // mailpit never authenticates the inbound message, so a missing
    // private key can't affect local smoke tests. When set, the
    // three keys must agree (domainName == From: domain, selector
    // resolves under that domain) or Gmail will surface a
    // "signature not verified" warning instead of the lock.
    ...(config.email.dkim ? { dkim: config.email.dkim } : {}),
  })

  console.log(
    `[email] transport ready: provider=smtp ` +
      `host=${config.email.smtp.host} ` +
      `port=${config.email.smtp.port} ` +
      `secure=${config.email.smtp.secure} ` +
      `auth=${config.email.smtp.user ? 'set' : 'none'} ` +
      `dkim=${config.email.dkim ? 'on' : 'off'} ` +
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
  sendViaProvider = async ({
    to,
    subject,
    html,
    text,
    headers,
    replyTo,
    smtpEnvelope,
  }) => {
    const info = await transport.sendMail({
      from: fromAddress,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text,
      replyTo,
      headers,
      // `envelope` controls the SMTP MAIL FROM and RCPT TO, which
      // becomes the `Return-Path:` header on the rendered email.
      // Always set to BRAND_EMAIL here (see buildMessage) so
      // DMARC SPF alignment is automatic.
      envelope: smtpEnvelope,
    })
    return info
  }
}

// Normalise the provider's success result so the log line below
// works for both branches. Resend returns `{ id }`, nodemailer
// returns `{ messageId }`; the log uses whichever is present.
const providerId = (info) => info?.id || info?.messageId || 'unknown'

/**
 * dispatch
 *
 * Shared per-message body of `sendEnquiryNotification`,
 * `sendSubscriberConfirmation`, `sendBugReportNotification`,
 * `sendNewIssueNotification`. Calls `buildMessage`, dispatches via
 * the active transport, and logs the outcome. Failures are caught
 * and logged so a missed send never blocks the API response.
 */
const dispatch = async ({
  label,
  subject,
  to,
  html,
  text,
  context,
  replyTo,
}) => {
  const unsubscribeUrl = unsubscribeUrlFor(context.type, context.email)
  const message = buildMessage({
    to,
    subject,
    html,
    text,
    replyTo,
    unsubscribeUrl,
  })

  console.log(
    `[email] sending ${label} to ${Array.isArray(to) ? to.join(', ') : to} (subject: ${subject})`
  )

  try {
    const info = await sendViaProvider({
      to,
      subject,
      html,
      text,
      headers: message.headers,
      replyTo: message.replyTo,
      smtpEnvelope: message.smtpEnvelope,
    })
    console.log(`[email] ${label} sent: id=${providerId(info)}`)
  } catch (err) {
    console.error(`[email] ${label} failed:`, err.message)
  }
}

/**
 * sendEnquiryNotification
 *
 * Notifies the team that a new project enquiry has landed. Sent
 * to the brand inbox, with Reply-To overridden to the enquirer's
 * address so the team can respond with one click in their mail
 * client (and From / Return-Path still equal BRAND_EMAIL — only
 * the Reply-To header changes here). Best-effort: never blocks
 * the API response.
 */
export const sendEnquiryNotification = async (enquiry) => {
  const { subject, html, text } = renderEnquiry(enquiry)
  await dispatch({
    label: 'enquiry notification',
    subject,
    to: config.email.from,
    html,
    text,
    replyTo: enquiry.email,
    context: { type: 'enquiry' },
  })
}

/**
 * sendSubscriberConfirmation
 *
 * Greets the new newsletter subscriber. Reply-To defaults to
 * BRAND_EMAIL (no per-call override). Best-effort: never blocks
 * the API response.
 */
export const sendSubscriberConfirmation = async (email) => {
  const { subject, html, text } = renderSubscriber(email)
  await dispatch({
    label: 'subscriber confirmation',
    subject,
    to: email,
    html,
    text,
    context: { type: 'subscriber', email },
  })
}

/**
 * sendBugReportNotification
 *
 * Notifies the team that a bug report has been filed. Sent to the
 * brand inbox; Reply-To overridden to the reporter's address when
 * one was provided so the team can reply directly (anonymous
 * reports land with the default Reply-To = BRAND_EMAIL).
 *
 * Mirrors `sendEnquiryNotification`'s best-effort contract —
 * failures never block the API response.
 */
export const sendBugReportNotification = async (report) => {
  const { subject, html, text } = renderBugReport(report)
  await dispatch({
    label: 'bug report notification',
    subject,
    to: config.email.from,
    html,
    text,
    replyTo: report.email || undefined,
    context: { type: 'bug' },
  })
}

/**
 * sendNewIssueNotification
 *
 * Fires the "Field Notes · Issue NNN: <title>" email to a
 * single subscriber. Called from
 * `utils/newsletterBroadcast.js`, which batches calls and
 * rate-limits at 10/s to stay inside Resend's API quota.
 *
 * Returns `{ ok, id }` (success) or `{ ok: false, error }`
 * (failure) — the caller (broadcast loop) tracks these so a
 * run summary can report successes vs. failures. The dedupe
 * guarantee comes from `Subscriber.issueSlugs` (set BEFORE
 * the send loop, not per-recipient), so a thrown error here
 * means that recipient was already marked and won't be
 * re-tried on the next broadcast.
 */
export const sendNewIssueNotification = async ({ email, issue }) => {
  const { subject, html, text } = renderNewIssue({ email, issue })
  const unsubscribeUrl = unsubscribeUrlFor('issue', email)
  const message = buildMessage({
    to: email,
    subject,
    html,
    text,
    unsubscribeUrl,
  })

  try {
    const info = await sendViaProvider({
      to: email,
      subject,
      html,
      text,
      headers: message.headers,
      replyTo: message.replyTo,
      smtpEnvelope: message.smtpEnvelope,
    })
    return { ok: true, id: providerId(info) }
  } catch (err) {
    console.error(
      `[email] new-issue notification failed for ${email}: ${err.message}`
    )
    return { ok: false, error: err.message }
  }
}
