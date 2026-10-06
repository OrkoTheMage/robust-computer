import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import config from '../../config.js'
import { VERSION } from '../../version.js'

/**
 * server/src/utils/email/layout.js
 *
 * Shared HTML + text wrapper for every outbound email.
 *
 * Structure (visual):
 *
 *   ┌─ page padding (white) ───────────────────────────────────┐
 *   │  ┌─ header (white, banner-2 full-bleed) ─────────────────┐│
 *   │  │  banner-2 (600px wide)                                ││
 *   │  ├─ sheet (3px border, 8px hard shadow) ─────────────────┤│
 *   │  │  ┌─ body (ticket bg) ──────────────────────────────┐  ││
 *   │  │  │  heading              ┌─ ticket log (white) ─┐  │  ││
 *   │  │  │  subhead              │ Email Log | Release  │  │  ││
 *   │  │  │                       │ ----------------------│  │  ││
 *   │  │  │  body content         │ $ tail --mail -n 1    │  │  ││
 *   │  │  │                       │ > …                   │  │  ││
 *   │  │  │                       └──────────[5px L]──────┘  │  ││
 *   │  │  └──────────────────────────────────────────────────┘  ││
 *   │  │  ─── divider (3px) ────────────────────────────────────││
 *   │  │  ┌─ paper footer (paper bg) ─────────────────────────┐││
 *   │  │  │  ROBUST COMPUTER                                 │││
 *   │  │  │  hello@…                                         │││
 *   │  │  │  unsubscribe …                                   │││
 *   │  │  └───────────────────────────────────────────────────┘││
 *   │  │                                            [shadow L]││
 *   │  └──────────────────────────────────────────────────────┘│
 *   └──────────────────────────────────────────────────────────┘
 *
 * Constraints respected:
 *   - every style is inlined (no <style> blocks, no classes)
 *   - layout uses <table role="presentation"> (no flex / grid)
 *   - all fonts fall back to system stacks (no @font-face)
 *   - brand mark + content are HTTP-loaded; some clients will hide
 *     them until the reader clicks "Display images". The wordmark
 *     underneath the banner and the heading carry the message
 *     either way.
 *
 * Sheet shadow: 2-cell table — the main cell carries the card, and
 * a 2nd column + 2nd row behind it form an 8px black "L" (no
 * `box-shadow` in email clients).
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Generated from the root `package.json` by `scripts/sync-version.mjs`
// at server startup (see `--import` in the `start`/`dev` scripts). Bump
// the root version and restart.

// Read both IBM Plex Mono weights we ship (400 + 700) at module
// load so we can inline them as data: URLs. Inlining (rather
// than pointing at a URL) means the font travels with the email
// and renders even when the recipient reads it offline or in a
// client that blocks third-party resources. Each file is ~15KB;
// base64'd each is ~20KB. Clients that can't decode the @font-face
// (notably Outlook desktop) fall through to the slashed-zero
// system monos in the FONT.mono stack below.
const plexMono400B64 = readFileSync(
  path.join(__dirname, './fonts/ibm-plex-mono-400.woff2')
).toString('base64')
const plexMono700B64 = readFileSync(
  path.join(__dirname, './fonts/ibm-plex-mono-700.woff2')
).toString('base64')

// ── Brand tokens (mirrored from landing/src/index.css) ──────────────────────
const COLOR = {
  paper: '#e2dbc8',
  ticket: '#f1ecdd',
  ink: '#000000',
  white: '#ffffff',
  inputBg: '#fff8',
}

// Font stacks mirror landing/src/index.css. The brand faces
// (Barlow, IBM Plex Mono, Newsreader) are inlined as data: URLs
// in the <style> block (see wrapHtml), so clients that honour
// @font-face render the brand mark; clients that don't (Outlook
// desktop, Gmail web) fall through to the slashed-zero system
// monos — Menlo, Monaco, Consolas — before reaching Courier
// (which has an oval zero). Listing the brand name first is the
// signal for clients that *do* load the embedded font.
const FONT = {
  display: "'Barlow', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'IBM Plex Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', Courier, monospace",
  body: "'Newsreader', Georgia, 'Times New Roman', serif",
}

// ── HTML escaping (defense in depth — user input flows into
//    innerHTML via template literals) ──────────────────────────────────────
export const escape = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// Apply the brand's 0-for-O rule (mirrors landing/src/utils/zer0.js):
// uppercase the input, then replace every O with 0. Used in the
// wordmark so the brand mark reads the same as on the page even
// when email clients ignore `text-transform`.
const zer0 = (str) => String(str).toUpperCase().replace(/O/g, '0')

// zer0Html: like `escape(zer0(str))` but each 0 is wrapped in a
// <span> that's forced into IBM Plex Mono with the slashed-zero
// OpenType feature turned on. Mirrors the on-page Zer0Text
// component, which also wraps each 0 in a Plex-Mono span so the
// 0s always carry the brand's slashed-zero glyph.
//
// The span inherits font-weight from its parent — we don't pin
// it. The 0 renders at the same weight as the surrounding mono
// text, which already reads as a distinct glyph (Plex Mono vs
// the surrounding Newsreader body, or Plex Mono at a different
// size in the heading subhead).
//
// `font-feature-settings: 'zero' 1` is the OpenType toggle for
// IBM Plex Mono's slashed zero — honoured when the font loads
// via the inline @font-face; ignored otherwise (Plex Mono's
// default zero is already slashed in the 700 file we ship).
//
// NOTE: the heading (h1) is intentionally NOT run through
// zer0Html — it sits in Barlow, and the brand 0-rule is a
// mono thing (the 0 is rendered in Plex Mono to carry the
// slashed glyph). The heading just renders the original string
// uppercased via CSS.
const zer0Html = (str) => {
  const text = zer0(str)
  return text
    .split(/(0)/)
    .map((part) =>
      part === '0'
        ? `<span style="font-family:${FONT.mono}; font-feature-settings:'zero' 1;">0</span>`
        : escape(part)
    )
    .join('')
}

const WORDMARK = zer0(config.brand.name)

// Format a Date for the ticket log: short, fixed-width, in the
// brand's timezone (CST/CDT). The on-page RSS date helper renders
// "Oct 3, 2026" for the Hero ticket; we use a slightly more verbose
// form here so both date and time are visible in the email log.
// Time is 12-hour with a lowercase am/pm suffix ("02:30pm") so the
// format reads naturally instead of forcing 24-hour on the reader.
//
// Uses Intl.DateTimeFormat with the brand timezone so every email
// surface shows the same wall-clock moment, regardless of where
// the server happens to be running. `formatToParts` gives us each
// component (month/day/year/hour/minute/timezoneName) in the right
// TZ; we then re-format the 24h hour into the "00:00am/pm" 12h
// form the brand uses.
const formatLogDate = (date = new Date(), timeZone = config.brand.timezone) => {
  const pad = (n) => String(n).padStart(2, '0')
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  })
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]))
  const hours24 = parseInt(parts.hour, 10)
  const hours12 = hours24 % 12
  const ampm = hours24 < 12 ? 'am' : 'pm'
  return `${parts.month} ${parts.day}, ${parts.year} ${pad(hours12)}:${parts.minute}${ampm} ${parts.timeZoneName}`
}

// ── Header (banner-2 + wordmark) ──────────────────────────────────────────
// The banner is a proper header (above the sheet, not inside it).
// Sits on the same white background as the rest of the page so
// the brand mark reads as the first thing the eye lands on; the
// 3px border below is the only visual divider into the sheet.
//
// The alt text carries the brand name for clients that block
// images — no visible wordmark, so the banner is the whole brand
// statement up top.
const headerHtml = () => {
  const bannerSrc = `${config.landingUrl}/banner2-cut.svg`
  return `
    <tr>
      <td align="center" style="padding:40px 24px 32px; border-bottom:3px solid ${COLOR.ink};">
        <img
          src="${escape(bannerSrc)}"
          alt="${escape(config.brand.name)}"
          width="520"
          style="display:block; width:520px; max-width:100%; height:auto; margin:0 auto; border:0; outline:none; text-decoration:none;"
        />
      </td>
    </tr>
  `
}

// ── Ticket log (mono block, top right of the sheet) ───────────────────────
// Mirrors the on-page Hero ticket: mono font, dashed separator,
// a "log tag" with two halves (left label / right stamp), and a
// body that reads like a terminal echo block.
//
// Renders white-on-white with a 3px black border and a small
// hard offset shadow (5px L via a 2-cell table — the same trick
// the sheet uses, since email clients don't honour box-shadow).
// The white-on-white inside the ticket-bg sheet makes the ticket
// read as a card sitting on the sheet, not as part of the sheet.
//
// `log` shape: { type, from } — date + release are stamped by
// the layout so every email is stamped consistently.
//
// The trailing "Sent" stamp is the email's analogue of the Hero
// ticket's "Shipped" stamp: same black-fill, paper-text, mono
// uppercase treatment, but scaled down (12px, 3×10 padding) to
// suit the smaller ticket. At the Hero's 15px it visually
// dominated the log body; at 12px it reads as a stamp on the
// ticket rather than the ticket's main content. Sits below the
// log body in a nested table so it stays content-width rather
// than stretching the ticket.
const ticketLogHtml = (log) => {
  if (!log) return ''
  const { type, from } = log
  const date = formatLogDate()
  const body = `$ tail --mail -n 1\n> ${date}\n> ${type}\n> From ${from}`
  return `
    <table role="presentation" width="260" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:260px;">
      <tr>
        <td style="background:${COLOR.white}; border:3px solid ${COLOR.ink};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; font-family:${FONT.mono}; font-size:11px; line-height:1.5; color:${COLOR.ink};">
            <tr>
              <td style="padding:8px 12px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="font-weight:700; text-transform:uppercase; letter-spacing:0.06em; font-size:11px; padding:0;">${zer0Html('Email Log')}</td>
                    <td align="right" style="font-weight:700; text-transform:uppercase; letter-spacing:0.06em; font-size:11px; padding:0; white-space:nowrap;">Release ${escape(VERSION)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 12px;"><div style="border-top:3px dashed ${COLOR.ink}; font-size:1px; line-height:1px; height:0;">&nbsp;</div></td>
            </tr>
            <tr>
              <td style="padding:9px 12px 12px; font-weight:700; font-size:13px; line-height:1.5; white-space:pre-wrap; word-break:break-word;">${escape(body)}</td>
            </tr>
            <tr>
              <td style="padding:3px 12px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="background:${COLOR.ink}; color:${COLOR.paper}; font-family:${FONT.mono}; font-weight:700; font-size:12px; letter-spacing:0.05em; padding:3px 10px; text-transform:uppercase;">${zer0Html('Sent')}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
        <td width="5" style="background:${COLOR.ink}; font-size:1px; line-height:1px;">&nbsp;</td>
      </tr>
      <tr>
        <td colspan="2" height="5" style="background:${COLOR.ink}; font-size:1px; line-height:1px;">&nbsp;</td>
      </tr>
    </table>
  `
}

// ── Heading + subhead (top of sheet, with optional ticket log) ────────────
// 2-column row when the log is present: heading + subhead on the
// left, ticket log on the right (vertically aligned to the top so
// it sits at the top right of the sheet).
//
// The brand's 0-for-O rule is applied to the heading (display,
// uppercase) and the subhead (mono, uppercase) so "Project
// enquiry" reads as "PR0JECT ENQUIRY" and "Welcome aboard" reads
// as "WELC0ME AB0ARD" — matching how the on-page Hero ticket and
// section headers render.
const headingHtml = ({ heading, subhead, log }) => {
  if (!heading && !subhead && !log) return ''
  const hasText = heading || subhead
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      <tr valign="top">
        ${
          hasText
            ? `<td style="${log ? 'padding-right:16px;' : ''}">
                ${
                  heading
                    ? `<h1 style="margin:0; font-family:${FONT.display}; font-weight:800; font-size:38px; line-height:1; text-transform:uppercase; letter-spacing:-0.005em; color:${COLOR.ink};">${escape(heading)}</h1>`
                    : ''
                }
                ${
                  subhead
                    ? `<p style="margin:8px 0 0; font-family:${FONT.mono}; font-weight:600; font-size:14px; letter-spacing:0.04em; text-transform:uppercase; color:${COLOR.ink};">${zer0Html(subhead)}</p>`
                    : ''
                }
              </td>`
            : '<td></td>'
        }
        ${log ? `<td align="right" valign="top" style="width:260px;">${ticketLogHtml(log)}</td>` : ''}
      </tr>
    </table>
    ${hasText ? `<div style="height:22px; line-height:22px; font-size:1px;">&nbsp;</div>` : ''}
  `
}

// ── Paper footer (brand line + optional extras) ───────────────────────────
// Attached to the bottom of the sheet, separated from the body
// by a 3px line. Same paper color as the header strip so the
// email reads as a "framed" letter — paper at top and bottom,
// ticket in the middle.
const paperFooterHtml = ({ extras = [] } = {}) => {
  const extrasHtml = extras.length
    ? `<div style="margin-top:8px;">${extras.join(' &middot; ')}</div>`
    : ''
  return `
    <tr>
      <td style="border-top:3px solid ${COLOR.ink}; font-size:1px; line-height:1px; height:0;">&nbsp;</td>
    </tr>
    <tr>
      <td style="background:${COLOR.paper}; padding:16px 28px 18px; font-family:${FONT.mono}; font-size:12px; line-height:1.5; color:${COLOR.ink}; letter-spacing:0.04em;">
        <div style="font-weight:700; text-transform:uppercase;">${zer0Html(config.brand.name)}</div>
        <div style="margin-top:4px;">${escape(config.brand.email)}</div>
        ${extrasHtml}
      </td>
    </tr>
  `
}

/**
 * wrapHtml
 *
 * Full HTML document for an email. Composes:
 *   - white body background (fits a regular inbox)
 *   - paper header strip with banner-2 + wordmark
 *   - sheet (3px border, 8px hard shadow) with:
 *       body (heading + subhead + ticket log + content)
 *       divider
 *       paper footer (brand line + optional extras)
 *
 * `preview` is the inbox-preview snippet (hidden, but read by
 * clients that show one). `heading` + `subhead` + `log` form the
 * top of the sheet. `body` is freeform HTML composed by the
 * caller. `footerExtras` are extra mono links rendered in the
 * paper footer (e.g. the unsubscribe link for the newsletter).
 */
export const wrapHtml = ({
  preview = '',
  heading,
  subhead,
  body,
  log,
  footerExtras = [],
  unsubscribeUrl,
} = {}) => {
  const previewHtml = preview
    ? `<div style="display:none; font-size:1px; color:${COLOR.white}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${escape(preview)}</div>`
    : ''

  // @font-face is inlined as a data: URL so the brand font ships
  // with the email (no external resource fetch). Both IBM Plex
  // Mono weights we ship are inlined — 400 for the enquiry
  // values / form fields (plain text), 700 for the 0 spans, the
  // ticket log tag, the subhead, and the wordmark. Clients that
  // don't honour <style> in the head (notably Outlook desktop)
  // skip the @font-face and fall through to the slashed-zero
  // system monos in FONT.mono (Menlo, Monaco, Consolas).
  const styleBlock = `
    <style>
      @font-face {
        font-family: 'IBM Plex Mono';
        font-style: normal;
        font-weight: 400;
        src: url(data:font/woff2;base64,${plexMono400B64}) format('woff2');
      }
      @font-face {
        font-family: 'IBM Plex Mono';
        font-style: normal;
        font-weight: 700;
        src: url(data:font/woff2;base64,${plexMono700B64}) format('woff2');
      }
    </style>
  `

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  ${styleBlock}
  <title>${escape(config.brand.name)}</title>
</head>
<body style="margin:0; padding:0; background:${COLOR.white}; -webkit-font-smoothing:antialiased;">
  ${previewHtml}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.white};">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; border-collapse:collapse;">
          ${headerHtml()}
          <tr>
            <td style="background:${COLOR.ticket}; border:3px solid ${COLOR.ink};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:30px 32px 28px; color:${COLOR.ink}; font-family:${FONT.body}; font-size:17px; line-height:1.55;">
                    ${headingHtml({ heading, subhead, log })}
                    ${body}
                  </td>
                </tr>
                ${paperFooterHtml({ extras: footerExtras })}
              </table>
            </td>
            <td width="8" style="background:${COLOR.ink}; font-size:1px; line-height:1px;">&nbsp;</td>
          </tr>
          <tr>
            <td colspan="2" height="8" style="background:${COLOR.ink}; font-size:1px; line-height:1px;">&nbsp;</td>
          </tr>
        </table>
        <div style="font-family:${FONT.mono}; font-size:11px; color:${COLOR.ink}; opacity:0.55; padding:14px 8px 32px; letter-spacing:0.04em;">
          This is an automated email &middot; Sent by ${escape(config.brand.name)}${
            unsubscribeUrl
              ? `<br><a href="${escape(unsubscribeUrl)}" style="display:block; margin-top:6px; color:${escape(COLOR.ink)};">To unsubscribe: Click Here</a>`
              : ''
          }
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * wrapText
 *
 * Plain-text alternative for clients that don't render HTML.
 * Mirrors the structure: brand banner, heading, ticket log,
 * body, footer.
 */
export const wrapText = ({ heading, subhead, log, body, footerLines = [] } = {}) => {
  const lines = []
  lines.push(`── ${WORDMARK} ──`)
  lines.push('')
  if (heading) {
    lines.push(heading.toUpperCase())
  }
  if (subhead) {
    lines.push(subhead)
  }
  if (log) {
    lines.push('')
    lines.push(`${zer0('Email Log')} · Release ${VERSION}`)
    lines.push('--------------------------------------------------')
    lines.push('$ tail --mail -n 1')
    lines.push(`> ${formatLogDate()}`)
    lines.push(`> ${log.type}`)
    lines.push(`> From ${log.from}`)
    // Text-mode analogue of the HTML "Sent" faux-button below
    // the log body. Renders as a bracketed tag in the same
    // mono-spaced voice as the rest of the ticket.
    lines.push('')
    lines.push(`[${zer0('Sent')}]`)
  }
  lines.push('')
  lines.push(body)
  if (footerLines.length) {
    lines.push('')
    lines.push('──')
    lines.push(...footerLines)
  }
  return lines.join('\n')
}

// Exposed for templates that want to share the constants and the
// zer0 helpers (templates apply zer0Html to their own uppercase
// labels so the 0s render in Plex Mono, matching the page).
export const emailTokens = { COLOR, FONT, escape, zer0, zer0Html }
