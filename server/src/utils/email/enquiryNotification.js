import { wrapHtml, wrapText, emailTokens } from './layout.js'

/**
 * server/src/utils/email/enquiryNotification.js
 *
 * "New enquiry from {name}" — sent to the team (From = team inbox,
 * Reply-To = the enquirer's address so the team can reply in their
 * mail client with one click). The enquirer's data is laid out as
 * a "ticket" with labelled rows, mirroring the on-page form.
 *
 * Returns { subject, html, text }. No SMTP here.
 */

const { COLOR, FONT, escape, zer0Html } = emailTokens

// ── Enum → human label maps ────────────────────────────────────────────────
// These live here (not in the route) because the route validates
// against the raw enums; the email is the only place we need
// presentable copy.
const PROJECT_TYPE_LABEL = {
  landing: 'Landing page',
  webapp: 'Web app',
  saas: 'SaaS',
  unsure: 'Not sure yet',
}

const BUDGET_LABEL = {
  under_5k: 'Under $5k',
  '5k_15k': '$5k – $15k',
  '15k_50k': '$15k – $50k',
  '50k_plus': '$50k+',
}

const label = (map, value) => map[value] || escape(value)

// ── Single enquiry field (label + form-styled input box) ─────────────────
// Renders one labelled field. The value sits in a div styled like the
// site's `Input` (3px black border, #fff8 bg, 17px Plex Mono) with
// 4px padding on all sides — just enough to keep the text off the
// 3px border, the box still hugs its content line-for-line.
//
// `white-space:pre-wrap` + `overflow-wrap:break-word` keep the
// user's line breaks and wrap long URLs / unbroken strings.
const enquiryField = ({ label: fieldLabel, value }) => {
  return `
    <div style="margin:0 0 16px;">
      <div style="font-family:${FONT.mono}; font-weight:700; font-size:13px; letter-spacing:0.05em; text-transform:uppercase; color:${COLOR.ink}; margin:0 0 6px;">
        ${zer0Html(fieldLabel)}
      </div>
      <div style="border:3px solid ${COLOR.ink}; background:${COLOR.inputBg}; padding:6px; font-family:${FONT.mono}; font-weight:400; font-size:17px; line-height:1.5; color:${COLOR.ink}; white-space:pre-line; overflow:hidden;">${value}</div>
    </div>
  `
}

const buildHtml = (enquiry) => {
  const projectType = label(PROJECT_TYPE_LABEL, enquiry.projectType)
  const budget = label(BUDGET_LABEL, enquiry.budget)
  const company = enquiry.company && enquiry.company.trim()
    ? escape(enquiry.company)
    : '<span style="opacity:0.5;">&mdash;</span>'

  // The message preserves its own line breaks via white-space:pre-wrap.
  const message = escape(enquiry.message).replace(/\r\n/g, '\n')

  const emailLink = `<a href="mailto:${escape(enquiry.email)}" style="color:${COLOR.ink}; text-decoration:underline; text-underline-offset:3px; text-decoration-thickness:2px; word-break:break-all;">${escape(enquiry.email)}</a>`

  // Mirrors the on-page contact form's layout (Contact.jsx):
  // a 2-up grid with full-width rows where the form has them.
  // Name | Email sit side-by-side (the form's first row, two
  // inputs at 50/50), Company takes the full next row, then
  // Project type | Budget sit side-by-side, then Message spans
  // the full width with a dotted divider above it. Each field
  // is one row, so heights align naturally — no misaligned
  // column stacks like the 3-column version had.
  const body = `
    <p style="margin:0 0 22px; font-family:${FONT.body}; font-size:18px; line-height:1.55; color:${COLOR.ink};">
      Hit reply to respond directly to <strong>${escape(enquiry.name)}</strong>. Saved to the enquiry queue.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr valign="top">
        <td width="50%" style="padding-right:6px;">
          ${enquiryField({ label: 'Name', value: escape(enquiry.name) })}
        </td>
        <td width="50%" style="padding-left:6px;">
          ${enquiryField({ label: 'Email', value: emailLink })}
        </td>
      </tr>
      <tr>
        <td colspan="2">
          ${enquiryField({ label: 'Company', value: company })}
        </td>
      </tr>
      <tr valign="top">
        <td width="50%" style="padding-right:6px;">
          ${enquiryField({ label: 'Project type', value: escape(projectType) })}
        </td>
        <td width="50%" style="padding-left:6px;">
          ${enquiryField({ label: 'Budget', value: escape(budget) })}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top:18px; border-top:3px dotted ${COLOR.ink};">
          ${enquiryField({ label: 'Message', value: message })}
        </td>
      </tr>
    </table>
  `

  // The ticket log "From" line is the enquirer (the person the
  // team is hearing from), not the brand's From header. The type
  // is the project-enquiry kind so this email is identifiable in
  // a log of outbound mail. Just the name — no email address (the
  // email is already in the Email field above).
  const log = {
    type: 'Project enquiry',
    from: enquiry.name,
  }

  return wrapHtml({
    preview: `New enquiry from ${enquiry.name} — ${projectType}, ${budget}.`,
    heading: 'Project enquiry',
    subhead: 'Via the website',
    body,
    log,
  })
}

const buildText = (enquiry) => {
  const projectType = label(PROJECT_TYPE_LABEL, enquiry.projectType)
  const budget = label(BUDGET_LABEL, enquiry.budget)
  const body = [
    `Hit reply to respond to ${enquiry.name}.`,
    '',
    `Name:     ${enquiry.name}`,
    `Email:    ${enquiry.email}`,
    `Company:  ${enquiry.company || '—'}`,
    `Type:     ${projectType}`,
    `Budget:   ${budget}`,
    '',
    'Message:',
    enquiry.message,
  ].join('\n')

  const log = {
    type: 'Project enquiry',
    from: enquiry.name,
  }

  const footerLines = [
    'Reply to this email to respond to the enquirer.',
  ]
  return wrapText({ heading: 'Project enquiry', log, body, footerLines })
}

export const enquiryNotification = (enquiry) => ({
  subject: `[${'Robust Computer'}] New enquiry from ${enquiry.name}`,
  html: buildHtml(enquiry),
  text: buildText(enquiry),
})
