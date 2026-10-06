/**
 * landing/src/data/fieldNotes.js
 *
 * Single source of truth for the "Field Notes" post series. The
 * Hero ticket, the Field Notes band's "Latest issue" line, the
 * per-post page, and the static /public/rss.xml all read from
 * this array. Adding FN-002 is now an array push; the
 * Navbar/Footer "News" links, the latest-issue banner, and the
 * feed all pick it up automatically.
 *
 * Each note has the shape:
 *   {
 *     slug        — URL segment, used in /field-notes/<slug> and as
 *                   the RSS <guid>
 *     title       — short post name, rendered as the page <h1>
 *                   (without the "Issue NNN - " prefix)
 *     issuePrefix — "Issue NNN" — rendered above the title on the
 *                   post page and reattached to the title in the RSS
 *                   <title> for feed-reader readability
 *     pubDate     — ISO 8601 date string ("2026-10-04"). Just the
 *                   day this post was published — no time or
 *                   timezone. Sortable as a string, parseable by
 *                   `new Date()`. Rendered as "Oct 4, 2026" by
 *                   `formatPubDate`, and converted to RFC 822
 *                   (with implicit midnight UTC) for the RSS
 *                   <pubDate> by `buildRss`
 *     description — one-sentence excerpt. Used by the Hero ticket
 *                   and the Field Notes band's "Latest issue" line
 *     body        — full post content. Paragraphs separated by
 *                   blank lines. Rendered on the per-post page and
 *                   used as the RSS <description> so feed readers
 *                   get the full text
 *     author      — the byline. Rendered as a signed footer on the
 *                   per-post page only (omitted from the RSS feed).
 *                   Optional at the field level — when missing, the
 *                   per-post page simply doesn't render the footer
 *   }
 *
 * Selectors:
 *   getLatest()           — most recent post, sorted by pubDate desc
 *   getBySlug(slug)       — the post whose slug matches, or null
 *   getLatestNewsPath()   — "/field-notes/<latest-slug>", or
 *                           "/field-notes" if the array is empty
 *   getChannelDescription — the RSS <channel><description> text,
 *                           used as the lead in the per-post page
 *                           header and on the Field Notes band
 *
 * `buildRss()` renders the array as the public rss.xml string.
 * `buildFeedTxt()` renders the same array as the public
 * feed.txt string — a plain-text sibling of the RSS feed for
 * terminal-friendly consumption (curl, less, wget, finger-style
 * readers, environments where XML parsing is impractical).
 * Run the regen script after editing the array (see
 * `scripts/build-rss.mjs`) and commit both /public/rss.xml
 * and /public/feed.txt so feed readers, autodiscoverers, and
 * plain-text consumers don't have to ship a build step.
 *
 * `BRAND_DOMAIN` mirrors `landing/src/config.js#BRAND_DOMAIN`.
 * The data file is intentionally self-contained — it does not
 * import from `config.js` — so the regen script can load the
 * module in raw Node (where `import.meta.env` is undefined).
 * Update both files if the brand domain changes.
 *
 * Markdown block parsing is delegated to the shared
 * `utils/parseMarkdownBlocks.js` helper — same parser the
 * React FieldNote page consumes — so the two renderers
 * always agree on block boundaries. Adding a blank line
 * inside a fenced code block is safe (the parser treats
 * fences as opaque and never splits on the inner blank).
 */

const BRAND_DOMAIN = 'robust.computer'
const BRAND_NAME = 'Robust Computer'

// Import the shared markdown-block parser. This file already
// imports zero other modules — it's intentionally self-
// contained so `scripts/build-rss.mjs` can load it in raw
// Node without Vite. Importing a sibling util keeps that
// contract (the util is plain ES module JS, no Vite/React
// dependencies). The parser lives in utils/ because both
// consumers (this file + the React FieldNote page) need it,
// and per PROJECT-CONVENTIONS.md §4 utils/ is the home for
// pure helpers.
import { parseMarkdownBlocks } from '../utils/parseMarkdownBlocks.js'

// Channel-level metadata for the RSS feed. The lead copy matches
// what the Field Notes section band on the home page renders
// (also driven by `data/copy.js`); keeping it here means the
// feed and the page both pull from the same source, and there
// is no risk of a feed/page drift if the section copy is
// updated in only one of the two places.
//
// Chunk 12 will resolve the cross-page "Field Notes /
// Newsletter / News" naming taxonomy. For now the lead stays in
// sync with `data/copy.js#fieldNotes.lead` by hand.
const CHANNEL_TITLE = `${BRAND_NAME} — Field Notes`
const CHANNEL_DESCRIPTION =
  'Short issues — updates frequently — on building software that lasts. Practical, no spam, unsubscribe any time.'
const CHANNEL_LANGUAGE = 'en-us'

// ── Source array ──────────────────────────────────────────────────────────
// Add new posts here. No other file in the project should hardcode
// field-note slugs — the Navbar/Footer "News" link, the Hero
// ticket, and the Field Notes band's latest-issue line all read
// from this array.

export const fieldNotes = [
  {
    slug: 'issue-001',
    title: 'New Beginnings',
    issuePrefix: 'Issue 001',
    pubDate: '2026-10-06',
    author: 'Aeryn',
    description:
      'Welcome to the first issue of Field Notes',
    body: `
Welcome to the first issue of Field Notes

> I thought this was a **cool idea** — So I built it and now here we are. This will be our newsletter to you, our *'News'*. Short, **practical** updates from our build log. New post land when there is something worth talking about: **shipped projects**, **lessons learned**, **tech discovered**, or **tools we built** — like this one. 

We will keep each issue tight. If it cannot fit in a few minutes of reading, it does not belong here. *No bull*****, no marketing copy disguised as engineering wisdom — just the work, the mistakes, and the small victories.

Check out our \u0060RSS\u0060 feed for the first issue:

\u0060\u0060\u0060bash
// This will fetch the raw RSS feed, as XML - for your RSS reader
curl -sL "https://www.robust.computer/rss.xml"

// This will fetch the raw RSS feed as plain text - for your terminal
curl -sL "https://www.robust.computer/feed.txt"
\u0060\u0060\u0060
`,
  },
]

// ── Selectors ─────────────────────────────────────────────────────────────

// Sibling arrays shouldn't share state with the source array, so
// any selector that returns a sorted view clones first.
const sortByPubDateDesc = (notes) =>
  [...notes].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

export const getLatest = () => {
  const sorted = sortByPubDateDesc(fieldNotes)
  return sorted[0] || null
}

export const getBySlug = (slug) =>
  fieldNotes.find((n) => n.slug === slug) || null

export const getLatestNewsPath = () => {
  const latest = getLatest()
  return latest ? `/field-notes/${latest.slug}` : '/field-notes'
}

export const getChannelDescription = () => CHANNEL_DESCRIPTION

// ── RSS builder ───────────────────────────────────────────────────────────

const siteUrl = (path = '') => `https://${BRAND_DOMAIN}${path}`

const toRfc822 = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toUTCString()
}

const buildItem = (note) => {
  const link = siteUrl(`/field-notes/${note.slug}`)
  return `    <item>
      <title>${note.issuePrefix} - ${note.title}</title>
      <link>${link}</link>
      <description>${note.body}</description>
      <pubDate>${toRfc822(note.pubDate)}</pubDate>
      <guid isPermaLink="false">field-notes/${note.slug}</guid>
    </item>`
}

export const buildRss = (notes = fieldNotes) => {
  const sorted = sortByPubDateDesc(notes)
  const latest = sorted[0]
  const lastBuildDate = latest
    ? toRfc822(latest.pubDate)
    : toRfc822(new Date().toISOString())
  const items = notes.map(buildItem).join('\n\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">

  <channel>
    <title>${CHANNEL_TITLE}</title>
    <link>${siteUrl('/')}</link>
    <description>${CHANNEL_DESCRIPTION}</description>
    <language>${CHANNEL_LANGUAGE}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl('/rss.xml')}" rel="self" type="application/rss+xml" />

${items}
  </channel>

</rss>
`
}

// ── Plain-text feed builder ───────────────────────────────────────────────
//
// Sibling of `buildRss()` for tools that can't or don't want
// to parse XML (terminal readers, `curl | less`, mirrors that
// strip markup, etc.). The layout is intentionally close to
// what `cat -n` produces — rules and indented blocks — so it
// reads cleanly at any terminal width and degrades gracefully
// when piped through anything that flattens whitespace.
//
// Content is intentionally NOT markdown-rendered to plain
// text. Inline asterisks, backticks, and links are kept
// verbatim so the feed is byte-faithful to the source body
// (which matters for things like `*No bull*****`, where the
// asterisks are deliberate obfuscation, not emphasis). The
// only structural transformations are:
//   - blank lines stay blank lines (paragraph breaks)
//   - `> ...` lines are indented by two columns
//   - ```lang ... ``` fenced blocks get a labeled rule on
//     top and a closing rule on bottom
//   - long paragraph lines are word-wrapped to `WRAP_WIDTH`
//     columns (so a `less` reader at 80 cols doesn't get
//     mid-word wraps from the terminal)
//
// `WRAP_WIDTH` is the body-wrap target. Headers and rules use
// `RULE_WIDTH` so the visual frame matches. 72 cols reads
// cleanly in 80-col terminals with room for a gutter; bumping
// it would help on wide monitors but cost readability on
// phones and `git diff` review.

const RULE_WIDTH = 72
const WRAP_WIDTH = 72

const repeat = (char, n) => (n > 0 ? char.repeat(n) : '')

// Soft word-wrap. Joins whitespace, then walks the words and
// emits one line per `WRAP_WIDTH` columns. The optional
// `indent` is prepended to every emitted line (used for
// blockquotes, where the wrapped lines also need the indent).
const wrapText = (text, width = WRAP_WIDTH, indent = '') => {
  const words = text.replace(/\s+/g, ' ').trim().split(' ')
  if (words.length === 0 || (words.length === 1 && words[0] === '')) return ''
  const lines = []
  let current = ''
  for (const word of words) {
    if (!current) {
      current = word
    } else if ((indent + current + ' ' + word).length > width) {
      lines.push(indent + current)
      current = word
    } else {
      current = current + ' ' + word
    }
  }
  if (current) lines.push(indent + current)
  return lines.join('\n')
}

// Block-level transform of a post body into a plain-text
// rendering. Delegates block-boundary detection to the
// shared `parseMarkdownBlocks` parser (same one the React
// page uses), then renders each block based on its type:
//
//   - paragraph — word-wrapped to WRAP_WIDTH, followed by a
//     blank line
//   - quote     — word-wrapped to WRAP_WIDTH with a `  > `
//     indent on every wrapped line, followed by a blank line
//   - code      — wrapped in a labeled rule (── lang ──)
//     above and a closing rule below, with each line of
//     code indented two columns. Content inside the fence
//     is rendered verbatim — including blank lines that
//     should not have broken the fence.
//
// Inline markdown (`**bold**`, `*italic*`, `[link](url)`,
// `code`) is passed through verbatim. See the file-level
// comment for the rationale.
const renderBodyAsPlainText = (raw) => {
  const blocks = parseMarkdownBlocks(raw)
  const out = []

  for (const block of blocks) {
    if (block.type === 'code') {
      const lang = (block.lang || 'plain').trim() || 'plain'
      const label = `── ${lang} `
      const pad = repeat('─', Math.max(0, RULE_WIDTH - label.length))
      out.push(label + pad)
      for (const line of block.content.split('\n')) {
        out.push(`  ${line}`)
      }
      out.push(repeat('─', RULE_WIDTH))
      out.push('')
      continue
    }
    if (block.type === 'quote') {
      out.push(wrapText(block.content, WRAP_WIDTH, '  > '))
      out.push('')
      continue
    }
    // paragraph
    out.push(wrapText(block.content))
    out.push('')
  }

  // Trim trailing blank lines and collapse 3+ blanks to 2.
  return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '') + '\n'
}

// Format a YYYY-MM-DD date as "Mon DD, YYYY" in local time
// (so the date matches the typed day, mirroring
// `useLatestRss#formatPubDate`). Shared between the
// per-post header and the channel "Build" line.
const formatHumanDate = (raw) => {
  if (!raw) return ''
  const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) {
    const [, y, mo, d] = m
    return new Date(+y, +mo - 1, +d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const buildFeedTxt = (notes = fieldNotes) => {
  const sorted = sortByPubDateDesc(notes)
  const latest = sorted[0]
  const buildDate = latest ? latest.pubDate : new Date().toISOString()
  const rule = repeat('═', RULE_WIDTH)
  const sep = repeat('─', RULE_WIDTH)

  const header = [
    rule,
    `  ${CHANNEL_TITLE}`,
    rule,
    '',
    CHANNEL_DESCRIPTION,
    '',
    `  Web:    ${siteUrl('/')}`,
    `  RSS:    ${siteUrl('/rss.xml')}`,
    `  TXT:    ${siteUrl('/feed.txt')}`,
    `  Posts:  ${sorted.length}`,
    `  Build:  ${formatHumanDate(buildDate)}`,
    '',
    rule,
    '',
  ].join('\n')

  const blocks = notes.map((note) => {
    // The meta block ends with two blanks so the post's body
    // opens on its own paragraph after a visual breath —
    // the rule above the body should not look glued to the
    // first paragraph.
    const meta = [
      sep,
      `  ${note.issuePrefix} - ${note.title}`,
      `  Published  ${formatHumanDate(note.pubDate)}` +
        (note.author ? `    by ${note.author}` : ''),
      `  URL        ${siteUrl(`/field-notes/${note.slug}`)}`,
      sep,
      '',
      '',
    ].join('\n')

    return meta + renderBodyAsPlainText(note.body) + '\n'
  })

  const footer = [
    '',
    sep,
    `  End of feed.   ${sorted.length} post${sorted.length === 1 ? '' : 's'}.`,
    sep,
    '',
  ].join('\n')

  return header + '\n' + blocks.join('\n') + footer
}
