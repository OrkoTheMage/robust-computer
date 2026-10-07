import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import { BRAND_DOMAIN, BRAND_NAME, FIELD_NOTES_LEAD } from './brand.js'
import { issue001 } from './issues/001.js'
import { parseMarkdownBlocks } from '../utils/parseMarkdownBlocks.js'

/**
 * landing/src/data/fieldNotes.js
 *
 * Single source of truth for the "Field Notes" post series. The
 * Hero ticket, the Field Notes band's "Latest issue" line, the
 * per-post page, and the static /public/rss.xml all read from
 * this array. Each post lives in its own file under `./issues/`
 * and is composed into the `fieldNotes` array below; see the
 * "Adding a new issue" block further down for the two-step
 * pattern. News links in the nav and footer stay on the index.
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
 *     body        — full post markdown. Rendered on the per-post
 *                   page (via FieldNoteBody's marked + DOMPurify
 *                   stack) and re-rendered here for the RSS — a
 *                   plain-text excerpt feeds the <description>
 *                   element and a sanitized HTML rendering feeds
 *                   <content:encoded>, so RSS readers that respect
 *                   the content module get the same structure the
 *                   in-page reader does
 *     author      — the byline. Rendered as a signed footer on the
 *                   per-post page only (omitted from the RSS feed).
 *                   Optional at the field level — when missing, the
 *                   per-post page simply doesn't render the footer
 *   }
 *
 * The `fieldNotes` array is composed from per-issue files
 * in `./issues/`. Each issue lives in its own `NNN.js`,
 * exports a named binding (e.g. `issue001`), and contains
 * the shape above. Adding FN-NNN is a two-step change:
 *   1. drop a new `NNN.js` next to `001.js`
 *   2. add the import + an entry in the `fieldNotes`
 *      array below
 * The selectors sort by `pubDate` desc, so array order is
 * for human readability, not for the runtime order.
 *
 * Selectors:
 *   getLatest()           — most recent post, sorted by pubDate desc
 *   getBySlug(slug)       — the post whose slug matches, or null
 *   getAllByDate()        — every post, newest first
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
 * `scripts/build-rss.mjs`) and commit all four artifacts
 * (rss.xml, feed.txt, latest.xml, latest.txt) so feed readers,
 * autodiscoverers, and plain-text consumers don't have to ship
 * a build step.
 *
 * Brand strings come from `data/brand.js`, which has no Vite
 * APIs, so the regen script can still load this module in raw Node.
 *
 * Markdown block parsing is delegated to the shared
 * `utils/parseMarkdownBlocks.js` helper — same parser the
 * React FieldNote page consumes — so the two renderers
 * always agree on block boundaries. Adding a blank line
 * inside a fenced code block is safe (the parser treats
 * fences as opaque and never splits on the inner blank).
 *
 * The HTML renderer reuses the `marked` + `DOMPurify` pair
 * the per-post page uses (FieldNoteBody), so the
 * <content:encoded> HTML and the in-page render come from
 * the same markdown pipeline. `isomorphic-dompurify` is
 * the Node-capable wrapper around `dompurify` + `jsdom` —
 * it falls through to the real browser DOM in Vite and
 * ships its own jsdom shim under raw Node, so the same
 * import works in both runtimes.
 */

export const FIELD_NOTES_PAGE_SIZE = 5

const CHANNEL_TITLE = `${BRAND_NAME} — Field Notes`
const CHANNEL_DESCRIPTION = FIELD_NOTES_LEAD
const CHANNEL_LANGUAGE = 'en-us'

// The post data lives in `./issues/NNN.js`. Each file
// exports a single named binding (e.g. `issue001`) holding
// the shape documented in the file-level docstring above.
// Order here is for human readability; selectors sort by
// `pubDate` desc, so the runtime feed order doesn't depend
// on this list.

export const fieldNotes = [
  issue001,
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

export const getAllByDate = () => sortByPubDateDesc(fieldNotes)

export const getChannelDescription = () => CHANNEL_DESCRIPTION

// ── RSS builder ───────────────────────────────────────────────────────────

const siteUrl = (path = '') => `https://${BRAND_DOMAIN}${path}`

const toRfc822 = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toUTCString()
}

// XML predefined entities. The text-node escapes (`&`, `<`, `>`)
// are the only ones strictly required for element content; the
// attribute-value escapes (`"`, `'`) are included so the same
// helper is safe to use on attribute values too. Order matters:
// `&` must be first or it would double-escape the entities we
// just emitted.
const xmlEscape = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

// Render a markdown body to plain text. Walks the same
// `parseMarkdownBlocks` parser the React page and the full
// feed.txt renderer use, so block boundaries agree. Code
// blocks are dropped from the excerpt — the fence rules
// and code content are pure-rendering noise for a feed
// reader that only shows text — and each remaining block
// is rendered through `marked.parseInline` + `DOMPurify`
// (the same stack that produces <content:encoded>) so
// inline markdown is collapsed to readable prose:
// `**bold**` → `bold`, `*'News'*` → `'News'`,
// `[text](url)` → `text`. Tags are stripped and HTML
// entities are decoded so the result is plain text ready
// for the XML-escape pass in `buildItem`.
//
// Truncated at `maxLen` chars on the previous word
// boundary; an ellipsis is appended when the source was
// longer. The default of 280 chars matches the de-facto
// RSS description length (Twitter, Mailchimp, RSS 2.0
// spec advisory), so a feed reader that only renders
// <description> shows a meaningful preview instead of the
// full post.
const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
  '&rsquo;': '\u2019',
  '&lsquo;': '\u2018',
  '&rdquo;': '\u201D',
  '&ldquo;': '\u201C',
  '&#39;': "'",
}

const decodeHtmlEntities = (str) =>
  String(str).replace(/&(?:#x?[0-9a-f]+|[a-z]+);/gi, (m) => {
    if (HTML_ENTITIES[m]) return HTML_ENTITIES[m]
    const decimal = m.match(/^&#(\d+);$/)
    if (decimal) return String.fromCharCode(+decimal[1])
    const hex = m.match(/^&#x([0-9a-f]+);$/i)
    if (hex) return String.fromCharCode(parseInt(hex[1], 16))
    return m
  })

// Convert a chunk of inline-markdown text (heading text,
// list item text, paragraph text) to a flat plain-text
// string suitable for the RSS <description> excerpt. Same
// marked → DOMPurify → tag-strip → entity-decode pipeline
// the paragraph branch used, just hoisted so heading and
// list items can reuse it.
const inlineMarkdownToText = (content) => {
  const html = DOMPurify.sanitize(marked.parseInline(content))
  const text = decodeHtmlEntities(html.replace(/<[^>]+>/g, ''))
  return text.replace(/\s+/g, ' ').trim()
}

const bodyToPlainText = (raw, maxLen = 280) => {
  const blocks = parseMarkdownBlocks(raw)
  const parts = []
  for (const block of blocks) {
    if (block.type === 'code') continue
    // An image is content, not prose — the URL is noise in
    // a plain-text preview, the alt text is the value. A
    // reader that only renders <description> still surfaces
    // the caption via the `(image: …)` marker.
    if (block.type === 'image') {
      if (block.alt) parts.push(`(image: ${block.alt})`)
      continue
    }
    if (block.type === 'heading') {
      const text = inlineMarkdownToText(block.content)
      if (text) parts.push(text)
      continue
    }
    if (block.type === 'list') {
      // List items are joined with a semicolon so the
      // excerpt reads as "a; b; c" instead of "a b c" —
      // small, but enough to signal "these are peers"
      // instead of "this is one long sentence".
      const itemTexts = block.items
        .map(inlineMarkdownToText)
        .filter(Boolean)
      if (itemTexts.length > 0) parts.push(itemTexts.join('; '))
      continue
    }
    const text = inlineMarkdownToText(block.content)
    if (text) parts.push(text)
  }
  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLen) return text
  const cut = text.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  const head = lastSpace > 0 ? cut.slice(0, lastSpace) : cut
  return `${head.replace(/[,;:.–—-]\s*$/, '')}…`
}

// Render a markdown body to sanitized HTML for the RSS
// <content:encoded> element. Uses the same `marked` +
// `DOMPurify` pair the in-page FieldNoteBody uses — so
// feed readers that respect content:encoded see the same
// <p>/<blockquote>/<pre><code> structure the in-page
// reader does. DOMPurify strips anything dangerous
// (<script>, on* event handlers, javascript: URLs), so the
// body can't inject code into feed readers that render
// HTML inline.
const renderBodyToHtml = (raw) => {
  const html = marked.parse(raw)
  return DOMPurify.sanitize(html)
}

const buildItem = (note) => {
  const link = siteUrl(`/field-notes/${note.slug}`)
  const encoded = renderBodyToHtml(note.body)
  const description = xmlEscape(bodyToPlainText(note.body))
  return `    <item>
      <title>${xmlEscape(`${note.issuePrefix} - ${note.title}`)}</title>
      <link>${link}</link>
      <description>${description}</description>
      <content:encoded><![CDATA[${encoded}]]></content:encoded>
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
  const items = sorted.map(buildItem).join('\n\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">

  <channel>
    <title>${xmlEscape(CHANNEL_TITLE)}</title>
    <link>${siteUrl('/')}</link>
    <description>${xmlEscape(CHANNEL_DESCRIPTION)}</description>
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
//
// Standalone images (`![alt](url)` on their own line) are
// replaced with a single `[image: alt]` line, wrapped in a
// labeled rule pair so it reads as a discrete artifact the
// same way the code blocks do. The alt text is the
// single source of truth for the caption — it shows up as
// the on-page <figcaption>, the <description> excerpt's
// `(image: alt)`, and this placeholder, so every surface
// surfaces the same wording.
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
    if (block.type === 'image') {
      // A literal `![alt](url)` line in the terminal would
      // be unreadable — the URL is noise and the markdown
      // syntax is meaningless to a non-rendering reader.
      // Replace it with a single `[image: alt]` line that
      // names the asset the same way the on-page <figcaption>
      // and the <description> excerpt do, so all three
      // surfaces agree on the caption text. Brackets signal
      // "this is a placeholder, not prose"; flush-left so it
      // sits inline with the surrounding paragraphs instead
      // of looking like a list item or a code block.
      const label = block.alt ? `image: ${block.alt}` : 'image'
      out.push(`[${label}]`)
      out.push('')
      continue
    }
    if (block.type === 'heading') {
      // Headings read as section dividers in the terminal
      // — same visual break the slug page's h2 bottom
      // border provides. Level is signalled by the rule
      // weight: h1 gets a double rule (═), h2 and below
      // get a single rule (─). Uppercased so the "section
      // label" reading lands without needing CSS
      // text-transform. Inline markdown inside the heading
      // is kept verbatim (no markdown stripping, matching
      // the file-level policy for feed.txt).
      const rule = block.level === 1 ? '═' : '─'
      out.push(repeat(rule, RULE_WIDTH))
      out.push(`  ${block.content.toUpperCase()}`)
      out.push(repeat(rule, RULE_WIDTH))
      out.push('')
      continue
    }
    if (block.type === 'list') {
      // `▪` for unordered, `1.`, `2.`, … for ordered. Two-
      // space indent matches the meta block at the top of
      // each post and the code-block line indent, so the
      // "this is a structural element" reading is consistent
      // across the feed. Items are word-wrapped to
      // `WRAP_WIDTH - 2` so the indent + marker fit in the
      // wrap budget.
      const itemWidth = WRAP_WIDTH - 2
      for (let j = 0; j < block.items.length; j++) {
        const marker = block.ordered ? `${j + 1}.` : '▪'
        const item = block.items[j]
        const wrapped = wrapText(item, itemWidth)
        const lines = wrapped.split('\n')
        out.push(`  ${marker} ${lines[0]}`)
        for (let k = 1; k < lines.length; k++) {
          out.push(`    ${lines[k]}`)
        }
      }
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
// `utils/formatPubDate.js`). Shared between the
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

  const blocks = sorted.map((note) => {
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
