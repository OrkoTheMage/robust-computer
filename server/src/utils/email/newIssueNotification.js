import config from '../../config.js'
import { wrapHtml, wrapText, emailTokens } from './layout.js'

/**
 * server/src/utils/email/newIssueNotification.js
 *
 * "New in Field Notes · Issue NNN: <title>" — fired by
 * `utils/newsletterBroadcast.js` to every active subscriber
 * when a new issue ships. Subject line carries the issue
 * prefix + title so the inbox preview reads as the issue
 * itself (not just "Field Notes update"). Sender is the
 * brand inbox; one-off reply address on the issue post is
 * meaningless here (the email is outbound, not a reply
 * thread).
 *
 * Returns { subject, html, text }. No SMTP here — the
 * dispatcher in `email.js` picks the transport and hands
 * the rendered payload to `sendViaProvider`.
 *
 * Body shape:
 *   - one-line lede: "A new issue of Field Notes is out."
 *   - the issue title (h2) + one-sentence description
 *   - a single "Read online →" CTA that links to the
 *     per-post URL on the landing
 *   - the standard paper-footer brand line + unsubscribe
 *     link (re-used on every newsletter email)
 *
 * The body uses the same `wrapHtml` / `wrapText` chrome as
 * `subscriberConfirmation.js`: heading + subhead are set on
 * the chrome via `wrapHtml`; the body below the rule is
 * freeform. The ticket log's `type` is the issue's prefix
 * (`Issue 001`, `Issue 002`, …) so a list of outbound mail
 * sorts by issue.
 */

const { COLOR, FONT, escape, zer0Html } = emailTokens

const unsubscribeUrl = (email) =>
  `${config.landingUrl}/unsubscribe?email=${encodeURIComponent(email)}`

const buildHtml = ({ email, issue }) => {
  const unsub = unsubscribeUrl(email)
  const read = issue.url

  const body = `
    <p style="margin:0 0 22px; font-family:${FONT.body}; font-size:18px; line-height:1.55; color:${COLOR.ink};">
      A new issue of <strong>Field Notes</strong> is out.
    </p>
    <h2 style="margin:0 0 10px; font-family:${FONT.display}; font-weight:800; font-size:28px; line-height:1.1; text-transform:uppercase; letter-spacing:-0.005em; color:${COLOR.ink};">
      ${escape(issue.title)}
    </h2>
    <p style="margin:0 0 26px; font-family:${FONT.body}; font-size:18px; line-height:1.55; color:${COLOR.ink};">
      ${escape(issue.description)}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; margin:8px 0 4px;">
      <tr>
        <td style="background:${COLOR.ink}; border:3px solid ${COLOR.ink}; box-shadow:5px 5px 0 ${COLOR.gold};">
          <a href="${escape(read)}" style="display:inline-block; padding:14px 22px; font-family:${FONT.mono}; font-weight:700; font-size:16px; letter-spacing:0.05em; text-transform:uppercase; text-decoration:none; color:${COLOR.paper};">${zer0Html('Read online →')}</a>
        </td>
        <td width="5" style="background:${COLOR.gold}; font-size:1px; line-height:1px;">&nbsp;</td>
      </tr>
      <tr>
        <td colspan="2" height="5" style="background:${COLOR.gold}; font-size:1px; line-height:1px;">&nbsp;</td>
      </tr>
    </table>
  `

  const log = {
    type: `Field Notes · ${issue.issuePrefix}`,
    from: config.brand.name,
  }

  return wrapHtml({
    preview: `${issue.issuePrefix}: ${issue.title}`,
    heading: 'Field Notes',
    subhead: `New issue · ${issue.issuePrefix}`,
    body,
    log,
    unsubscribeUrl: unsub,
  })
}

const buildText = ({ email, issue }) => {
  const unsub = unsubscribeUrl(email)
  const body = [
    'A new issue of Field Notes is out.',
    '',
    issue.title,
    '',
    issue.description,
    '',
    `Read online: ${issue.url}`,
  ].join('\n')

  const log = {
    type: `Field Notes · ${issue.issuePrefix}`,
    from: config.brand.name,
  }

  const footerLines = [
    `Unsubscribe: ${unsub}`,
  ]

  return wrapText({
    heading: 'Field Notes',
    subhead: `New issue · ${issue.issuePrefix}`,
    log,
    body,
    footerLines,
  })
}

export const newIssueNotification = ({ email, issue }) => ({
  subject: `[${config.brand.name}] ${issue.issuePrefix}: ${issue.title}`,
  html: buildHtml({ email, issue }),
  text: buildText({ email, issue }),
})