import config from '../../config.js'
import { wrapHtml, wrapText, emailTokens } from './layout.js'

/**
 * server/src/utils/email/bugReportNotification.js
 *
 * "Bug report" — sent to the team when someone files a bug through
 * /bug-report on the landing site. Mirrors the on-page form
 * (what were you doing / what expected / what happened / browser
 * + device) as a labelled ticket. The reporter's name and email
 * are optional (anonymous-friendly) — if either is provided the
 * From header includes the email so the team can Reply-To them
 * directly; otherwise the ticket lands as a pure "from the wild".
 *
 * Returns { subject, html, text }. No SMTP here.
 */

const { COLOR, FONT, escape, zer0Html } = emailTokens

// ── Single bug-report field (label + form-styled input box) ─────────────
// Same shape as `enquiryField` in enquiryNotification.js — keeps the
// visual language of every email body consistent: label on top in
// mono caps, value in a 3px-bordered mono box.
//
// `value` is expected to be already-escaped HTML. The caller
// either passes a pre-escaped string (e.g. `escape(report.name)`)
// or a pre-built HTML snippet (e.g. the clickable mailto link).
// We do NOT re-escape here — doing so would render the <a> tag
// as literal text in the email client.
const bugField = ({ label: fieldLabel, value }) => `
  <div style="margin:0 0 16px;">
    <div style="font-family:${FONT.mono}; font-weight:700; font-size:13px; letter-spacing:0.05em; text-transform:uppercase; color:${COLOR.ink}; margin:0 0 6px;">
      ${zer0Html(fieldLabel)}
    </div>
    <div style="border:3px solid ${COLOR.ink}; background:${COLOR.inputBg}; padding:6px; font-family:${FONT.mono}; font-weight:400; font-size:17px; line-height:1.5; color:${COLOR.ink}; white-space:pre-line; overflow:hidden;">${value}</div>
  </div>
`

const buildHtml = (report) => {
  // `bugField` expects already-escaped HTML. For optional fields
  // (reporter, email, browser/device) we build a clickable mailto
  // link when the value is present, or a muted em-dash span when
  // it isn't. For required repro fields we just escape the input.
  const EMPTY = '<span style="opacity:0.5;">&mdash;</span>'
  const reporter = report.name && report.name.trim()
    ? escape(report.name)
    : EMPTY
  const reporterEmail = report.email && report.email.trim()
    ? `<a href="mailto:${escape(report.email)}" style="color:${COLOR.ink}; text-decoration:underline; text-underline-offset:3px; text-decoration-thickness:2px; word-break:break-all;">${escape(report.email)}</a>`
    : EMPTY
  const browserDevice = report.browserDevice && report.browserDevice.trim()
    ? escape(report.browserDevice)
    : EMPTY

  // The three required repro fields preserve their line breaks via
  // white-space:pre-line.
  const repro = (s) => escape(s).replace(/\r\n/g, '\n')

  const body = `
    <p style="margin:0 0 22px; font-family:${FONT.body}; font-size:18px; line-height:1.55; color:${COLOR.ink};">
      A bug report was filed through the website. Saved to the bug-report queue.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr valign="top">
        <td width="50%" style="padding-right:6px;">
          ${bugField({ label: 'Reporter', value: reporter })}
        </td>
        <td width="50%" style="padding-left:6px;">
          ${bugField({ label: 'Reply-to', value: reporterEmail })}
        </td>
      </tr>
      <tr>
        <td colspan="2">
          ${bugField({ label: 'What were you doing?', value: repro(report.whatWereYouDoing) })}
        </td>
      </tr>
      <tr>
        <td colspan="2">
          ${bugField({ label: 'What did you expect?', value: repro(report.whatExpected) })}
        </td>
      </tr>
      <tr>
        <td colspan="2">
          ${bugField({ label: 'What actually happened?', value: repro(report.whatHappened) })}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top:18px; border-top:3px dotted ${COLOR.ink};">
          ${bugField({ label: 'Browser + device', value: browserDevice })}
        </td>
      </tr>
    </table>
  `

  const log = {
    type: 'Bug report',
    from: report.name && report.name.trim() ? report.name : 'Anonymous',
  }

  return wrapHtml({
    preview: `Bug report — what happened: ${report.whatHappened.slice(0, 100)}`,
    heading: 'Bug report',
    subhead: 'Via the website',
    body,
    log,
  })
}

const buildText = (report) => {
  const body = [
    `A bug report was filed through the website.`,
    '',
    `Reporter:  ${report.name || '—'}`,
    `Reply-to:  ${report.email || '—'}`,
    '',
    `What were you doing?`,
    report.whatWereYouDoing,
    '',
    `What did you expect?`,
    report.whatExpected,
    '',
    `What actually happened?`,
    report.whatHappened,
    '',
    `Browser + device:`,
    report.browserDevice || '—',
  ].join('\n')

  const log = {
    type: 'Bug report',
    from: report.name && report.name.trim() ? report.name : 'Anonymous',
  }

  const footerLines = [
    'Reply to this email to respond to the reporter (if they left an address).',
  ]
  return wrapText({ heading: 'Bug report', log, body, footerLines })
}

export const bugReportNotification = (report) => ({
  subject: `[${config.brand.name}] Bug report${report.name ? ` from ${report.name}` : ''}`,
  html: buildHtml(report),
  text: buildText(report),
})
