import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import { BRAND_DOMAIN, BRAND_NAME, FIELD_NOTES_LEAD } from './brand.js'
import { issue001 } from './issues/001.js'
import { parseMarkdownBlocks } from '../utils/parseMarkdownBlocks.js'

/**
 * landing/src/data/feed.js
 *
 * Single source of truth for the Field Notes post series.
 * The Hero ticket, the home-page band's "Latest issue" line,
 * the per-post page, the static RSS / feed.txt / sitemap feeds,
 * the OG/Twitter card regen, and the prerender step all read
 * from the `feed` array below. Each post lives in its own
 * file under `./issues/issueNNN.js` and is composed into the
 * array below.
 *

 * Each post has the shape:
 *   {
 *     slug          — URL segment, used in /field-notes/<slug> and
 *                     as the RSS <guid>
 *     title         — short post name, rendered as the page <h1>
 *                     (without the "Issue NNN - " prefix)
 *     issuePrefix   — "Issue NNN" — rendered above the title on the
 *                     post page and reattached to the title in the
 *                     RSS <title> for feed-reader readability
 *     pubDate       — ISO 8601 date string ("2026-10-04"). Just the
 *                     day this post was published — no time or
 *                     timezone. Sortable as a string, parseable by
 *                     `new Date()`. Rendered as "Oct 4, 2026" by
 *                     `formatPubDate`, converted to RFC 822 for the
 *                     RSS <pubDate> by `buildRss`, and emitted as
 *                     W3C-format `<lastmod>` for the sitemap
 *                     `<url>` by `buildSitemap`
 *     description   — one-sentence excerpt. Used by the Hero ticket
 *                     and the Field Notes band's "Latest issue" line
 *     body          — full post markdown. Rendered on the per-post
 *                     page (via PostBody's marked + DOMPurify stack)
 *                     and re-rendered here for the RSS — a
 *                     plain-text excerpt feeds the <description>
 *                     element and a sanitized HTML rendering feeds
 *                     <content:encoded>, so RSS readers that respect
 *                     the content module get the same structure the
 *                     in-page reader does
 *     author        — the byline. Rendered as a signed footer on the
 *                     per-post page only (omitted from the RSS feed).
 *                     Optional at the field level — when missing, the
 *                     per-post page simply doesn't render the footer
 *     ogImage       — per post; absolute or site-rooted URL
 *     twitterImage  — per post; absolute or site-rooted URL
 *   }
 *
 * The `feed` array is composed from per-issue files in
 * `./issues/issueNNN.js`. Each file exports a single named
 * binding (`issue001`, `issue002`, …) — the binding name
 * matches the filename, which is the natural read for a
 * magazine-style numbered publication. Adding IssueNNN is a
 * two-step change:
 *   1. drop a new `issueNNN.js` next to `issue001.js`,
 *      exporting `issueNNN`
 *   2. add the import + an entry in the `feed` array below
 * The selectors sort by `pubDate` desc, so array order is
 * for human readability, not for the runtime order.
 *
 * Selectors (return shape: `{ ...post, to: '/field-notes/<slug>' }`
 * — same shape as the raw post, plus a pre-built `to` path for
 * `<Link to={...}>`):
 *
 *   getLatestPost()           — most recent post, sorted by pubDate desc
 *   getPostBySlug(slug)       — the post whose slug matches, or null
 *   getAllPosts()             — every post, newest first (sorted)
 *
 * The raw `feed` array is also exported for the build-rss
 * script and the prerender step (which iterate the whole set
 * and don't need the `to` annotation).
 *
 * `buildRss()` renders the array as the public rss.xml string.
 * `buildFeedTxt()` renders the same array as the public
 * feed.txt string — a plain-text sibling of the RSS feed for
 * terminal-friendly consumption (curl, less, wget, finger-style
 * readers, environments where XML parsing is impractical).
 * The plain-text body strips inline markdown (bold / italic /
 * links / inline code) via the same `marked.parseInline` +
 * DOMPurify pipeline the RSS <description> excerpt uses, so a
 * paragraph reads the same in both surfaces. The standard
 * CommonMark backslash escapes (`\*`, `\[`, `` \` ``, …)
 * survive the stripper — a post that wants raw markdown kept
 * (e.g. an asterisk-driven obfuscation) escapes each delimiter
 * with a backslash; see FIELD-NOTES-SYNTAX.md for the escape
 * contract and `updates.txt` H-5 for the post-rewrite
 * question. Run the regen script after editing the array (see
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
 * React Post page consumes — so the two renderers
 * always agree on block boundaries.
 *
 * The HTML renderer reuses the `marked` + `DOMPurify` pair
 * the per-post page uses (PostBody), so the <content:encoded>
 * HTML and the in-page render come from the same markdown
 * pipeline.
 */

// Pagination size for the News archive page.
export const FIELD_NOTES_PAGE_SIZE = 5

const CHANNEL_TITLE = `${BRAND_NAME} — Field Notes`
const CHANNEL_DESCRIPTION = FIELD_NOTES_LEAD
const CHANNEL_LANGUAGE = 'en-us'

// The post data lives in `./issues/issueNNN.js`. Each file
// exports a single named binding (`issue001`, `issue002`, …)
// matching its filename. Order here is for human
// readability; selectors sort by `pubDate` desc, so the
// runtime feed order doesn't depend on this list.
export const feed = [
  issue001,
]

// ── Selectors ─────────────────────────────────────────────────────────────

// Sibling arrays shouldn't share state with the source array, so
// any selector that returns a sorted view clones first.
const sortByPubDateDesc = (notes) =>
  [...notes].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

// Build the "/field-notes/<slug>" path every view consumer needs.
const toFor = (slug) => `/field-notes/${slug}`

// Most recent post, sorted by `pubDate` desc. Returns the raw
// post object (with `body` etc.) plus a pre-built `to` path.
// Pages and the build-rss script both consume this shape.
export const getLatestPost = () => {
  const sorted = sortByPubDateDesc(feed)
  const latest = sorted[0]
  if (!latest) return null
  return { ...latest, to: toFor(latest.slug) }
}

// Post whose slug matches, or null. Same shape as `getLatestPost`
// — raw post + pre-built `to`. The `Post` page uses the body to
// render via PostBody; the `usePageIcon` hook only checks existence.
export const getPostBySlug = (slug) => {
  const post = slug ? feed.find((p) => p.slug === slug) : null
  if (!post) return null
  return { ...post, to: toFor(post.slug) }
}

// Every post, newest first. Same per-post shape as the
// single-post selectors. The News archive consumes this for
// the paginated card list.
export const getAllPosts = () =>
  sortByPubDateDesc(feed).map((post) => ({ ...post, to: toFor(post.slug) }))

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

// HTML entities the body might decode to (e.g. `&hellip;` → `…`)
// after the tag-strip pass. Kept narrow — anything outside this
// table falls through to the numeric-entity decoders below.
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

// An inline image — `![alt](url)` mixed with prose on the
// same line. Standalone images (one per line) are handled at
// the block level by `parseMarkdownBlocks` and never reach
// this regex; this only fires when an image sits inside a
// paragraph, heading, list item, or blockquote line.
const INLINE_IMAGE = /!\[([^\]]*)\]\(\s*(\S+?)\s*(?:"([^"]+)")?\)/g

// Strip inline markdown (`**bold**`, `*italic*`,
// `[text](url)`, `` `code` ``) from a chunk of inline-
// markdown text, returning the readable plain text.
// Shared by the RSS <description> excerpt (`bodyToPlainText`)
// and the plain-text body renderer (`renderBodyAsPlainText`)
// so the two surfaces produce identical prose for the same
// source paragraph.
//
// 1. Inline images are preprocessed to a `[Image: alt]`
//    marker so the alt text survives — marked would
//    otherwise render them as `<img>` and the next step's
//    tag-strip would drop the alt attribute.
// 2. The remaining inline markdown runs through
//    `marked.parseInline`, then DOMPurified, then stripped
//    of tags — same stack the on-page PostBody uses.
// 3. HTML entities are decoded and whitespace collapsed.
//
// Code spans (backticks) stay literal because `marked`
// doesn't re-process them — so the standard CommonMark
// backslash escapes survive (`\*` → `*`, `\[` → `[`, …).
// See FIELD-NOTES-SYNTAX.md for the escape contract.
const stripInlineMarkdown = (content) => {
  const withImageMarkers = String(content).replace(
    INLINE_IMAGE,
    (_, alt) => `[Image: ${alt}]`,
  )
  const html = DOMPurify.sanitize(marked.parseInline(withImageMarkers))
  const text = decodeHtmlEntities(html.replace(/<[^>]+>/g, ''))
  return text.replace(/\s+/g, ' ').trim()
}

const bodyToPlainText = (raw, maxLen = 280) => {
  const blocks = parseMarkdownBlocks(raw)
  const parts = []
  for (const block of blocks) {
    if (block.type === 'code') continue
    if (block.type === 'image') {
      if (block.alt) parts.push(`(image: ${block.alt})`)
      continue
    }
    if (block.type === 'heading') {
      const text = stripInlineMarkdown(block.content)
      if (text) parts.push(text)
      continue
    }
    if (block.type === 'list') {
      const itemTexts = block.items
        .map(stripInlineMarkdown)
        .filter(Boolean)
      if (itemTexts.length > 0) parts.push(itemTexts.join('; '))
      continue
    }
    const text = stripInlineMarkdown(block.content)
    if (text) parts.push(text)
  }
  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLen) return text
  const cut = text.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  const head = lastSpace > 0 ? cut.slice(0, lastSpace) : cut
  return `${head.replace(/[,;:.–—-]\s*$/, '')}…`
}

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

export const buildRss = (notes = feed) => {
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
// Content is markdown-rendered to plain text via the shared
// `marked.parseInline` + DOMPurify + tag-strip + entity-decode
// pipeline the RSS `<description>` excerpt uses, so a reader
// that ignores inline markup (terminal, pipe to `less`, mirror
// that strips tags) sees the same prose for the same source
// paragraph that an RSS reader shows in the description field.
// Bold / italic markers disappear, links collapse to their
// visible text, inline code keeps just the code. Inline images
// `![alt](url)` mixed with prose are preprocessed to a
// `[Image: alt]` marker so the alt text survives. Standalone
// images are handled at the block level by `parseMarkdownBlocks`
// and never reach the stripper.
//
// The standard CommonMark backslash escapes survive the
// stripper (`\*`, `\[`, `\]`, `` \` ``, `\_`, …), so a post
// that wants raw markdown kept — e.g. an asterisk-driven
// obfuscation like `*No bull*****` — can escape each
// would-be emphasis delimiter with a backslash and the
// literal characters survive. See FIELD-NOTES-SYNTAX.md for
// the escape contract and `updates.txt` H-5 for the
// post-rewrite question.
//
// The structural transformations only — i.e. the parts of
// the body that aren't already stripped markdown:
//   - blank lines stay blank lines (paragraph breaks)
//   - `> ...` lines are indented by two columns
//   - ```lang ... ``` fenced blocks get a labeled rule on
//     top and a closing rule on bottom
//   - long paragraph lines are word-wrapped to `WRAP_WIDTH`
//     columns (so a `less` reader at 80 cols doesn't get
//     mid-word wraps from the terminal)

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
//   - paragraph — inline markdown stripped, then word-wrapped
//     to WRAP_WIDTH, followed by a blank line
//   - quote     — inline markdown stripped, then word-wrapped
//     to WRAP_WIDTH with a `  > ` indent on every wrapped
//     line, followed by a blank line
//   - code      — wrapped in a labeled rule (── lang ──)
//     above and a closing rule below, with each line of
//     code indented two columns. Content inside the fence
//     is rendered verbatim — including blank lines that
//     should not have broken the fence. Per design (the
//     terminal reader runs the code), inline markdown
//     stripping is skipped here.
//
// Inline markdown (`**bold**`, `*italic*`, `[link](url)`,
// `` `code` ``) is stripped on every block except code, via
// the shared `stripInlineMarkdown` helper — same pipeline
// the `<description>` excerpt uses, so the two plain-text
// surfaces agree word-for-word. Code spans stay literal
// (their contents are not re-processed), so the standard
// CommonMark backslash escapes survive: `\*` → `*`,
// `\[` → `[`, etc. A post that wants raw markdown kept
// (e.g. the asterisk-driven obfuscation in Issue-001) can
// escape each would-be emphasis delimiter — see
// FIELD-NOTES-SYNTAX.md for the escape contract.
//
// Standalone images (`![alt](url)` on their own line) are
// replaced with a single `[Image: alt]` line, wrapped in a
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
      out.push(wrapText(stripInlineMarkdown(block.content), WRAP_WIDTH, '  > '))
      out.push('')
      continue
    }
    if (block.type === 'image') {
      const label = block.alt ? `Image: ${block.alt}` : 'Image'
      out.push(`[${label}]`)
      out.push('')
      continue
    }
    if (block.type === 'heading') {
      const rule = block.level === 1 ? '═' : '─'
      const stripped = stripInlineMarkdown(block.content).toUpperCase()
      out.push(repeat(rule, RULE_WIDTH))
      out.push(`  ${stripped}`)
      out.push(repeat(rule, RULE_WIDTH))
      out.push('')
      continue
    }
    if (block.type === 'list') {
      const itemWidth = WRAP_WIDTH - 2
      for (let j = 0; j < block.items.length; j++) {
        const marker = block.ordered ? `${j + 1}.` : '▪'
        const item = stripInlineMarkdown(block.items[j])
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
    out.push(wrapText(stripInlineMarkdown(block.content)))
    out.push('')
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '') + '\n'
}

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

export const buildFeedTxt = (notes = feed) => {
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

// ── Sitemap builder ─────────────────────────────────────────────────────────
//
// Committed artifact matching the rss.xml / feed.txt pattern:
// `landing/public/sitemap.xml` is generated from the same
// `feed` array every other public feed is generated from,
// written by `scripts/build-rss.mjs` after every data change,
// and committed alongside the post body so consumers (Google
// Search Console, robots.txt autodiscoverers, manual auditors)
// don't have to ship a build step.
//
// Structure (sitemap protocol 0.9):
//   <urlset>
//     <url>           — one per static route from App.jsx
//       <loc>         — absolute URL under BRAND_DOMAIN
//       <changefreq>  — hint only; major crawlers may ignore
//       <priority>    — hint only; relative to the site root
//     <url>           — one per post
//       <loc>         — /field-notes/<slug>
//       <lastmod>     — W3C date format (YYYY-MM-DD) from pubDate
//       <changefreq>  — "monthly"
//       <priority>    — below the index, above utility/legal pages
//   </urlset>

const STATIC_ROUTES = [
  { path: '/',             changefreq: 'weekly',  priority: '1.0' },
  { path: '/about',        changefreq: 'monthly', priority: '0.8' },
  { path: '/contact',      changefreq: 'monthly', priority: '0.8' },
  { path: '/bug-report',   changefreq: 'monthly', priority: '0.6' },
  { path: '/field-notes',  changefreq: 'weekly',  priority: '0.9' },
  { path: '/unsubscribe',  changefreq: 'yearly',  priority: '0.3' },
  { path: '/privacy',      changefreq: 'yearly',  priority: '0.4' },
  { path: '/terms',        changefreq: 'yearly',  priority: '0.4' },
]

const buildStaticUrl = (path, changefreq, priority) => `  <url>
    <loc>${siteUrl(path)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`

const buildPostUrl = (note) => {
  const lastmod = /^\d{4}-\d{2}-\d{2}$/.test(note.pubDate) ? note.pubDate : ''
  return `  <url>
    <loc>${siteUrl(`/field-notes/${note.slug}`)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
}

export const buildSitemap = (notes = feed) => {
  const sorted = sortByPubDateDesc(notes)
  const staticUrls = STATIC_ROUTES.map((r) => buildStaticUrl(r.path, r.changefreq, r.priority)).join('\n')
  const postUrls = sorted.map(buildPostUrl).join('\n')
  const blocks = postUrls ? [staticUrls, postUrls] : [staticUrls]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${blocks.join('\n')}
</urlset>
`
}
