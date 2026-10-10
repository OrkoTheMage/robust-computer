/**
 * landing/src/utils/parseMarkdownBlocks.js
 *
 * Parses a markdown body into a structured list of blocks. This
 * is the SHARED parser used by both the per-post React page
 * (pages/Post.jsx) and the plain-text feed.txt builder
 * (data/feed.js#renderBodyAsPlainText), so the two
 * renderers always agree on block boundaries — and a blank line
 * inside a fenced code block never breaks the fence.
 *
 * Block shape:
 *   { type: 'paragraph', content: string }
 *   { type: 'quote',     content: string }
 *   { type: 'code',      content: string, lang: string }
 *   { type: 'image',     alt: string, src: string, title: string }
 *   { type: 'heading',   level: number, content: string }
 *   { type: 'list',      ordered: boolean, items: string[] }
 *
 * Why a line-by-line scan instead of `raw.split(/\n{2,}/)`:
 *
 *   Splitting on blank lines first is the obvious move, but it
 *   treats fenced code blocks as ordinary text. A blank line
 *   INSIDE a fenced block (intentional, for readability — or
 *   pasted in from a real shell session) would split the fence
 *   into two pieces, and neither piece would still look like
 *   a fence when re-classified. The fix is to recognise the
 *   fences first and treat everything between them as opaque
 *   content; only then do we look at blank lines as paragraph
 *   separators.
 *
 * Supported syntax (CommonMark-flavoured, intentionally narrow):
 *
 *   - ```lang … ```         fenced code block; the opening
 *                           fence may carry a language id
 *                           (```bash), the closing fence is
 *                           always bare. Content between the
 *                           fences is preserved VERBATIM,
 *                           including blank lines.
 *
 *   - > …                  blockquote. Consecutive `>` lines
 *                           (separated by single newlines) are
 *                           one quote block; a blank line
 *                           starts a new quote block. The `> `
 *                           prefix is stripped from each line;
 *                           lines are joined with spaces per
 *                           CommonMark soft-break semantics.
 *
 *   - ![alt](url …)        standalone image. A line that is
 *                           ONLY an image (no other prose
 *                           around it) is promoted to its own
 *                           block so the renderer can wrap it
 *                           in a <Figure> / give it caption
 *                           treatment. Mixed prose + image
 *                           (e.g. `look at ![alt](url) from
 *                           yesterday`) stays inside the
 *                           surrounding paragraph and is
 *                           rendered inline by the
 *                           marked.parseInline pass.
 *
 *   - # … / ## … / ### …  ATX heading. 1–6 leading `#`
 *                           characters + a space + the
 *                           heading text. The level is the
 *                           count of `#`s. Optional trailing
 *                           `#`s (ATX-closing style) are
 *                           stripped. Setext-style underlined
 *                           headings (`===` / `---`) are NOT
 *                           supported — ATX is the only
 *                           heading form the project uses.
 *                           H1 inside the body is allowed by
 *                           the parser but discouraged in
 *                           practice; the page title already
 *                           lives in the HeaderBox above the
 *                           body, so H1 inside the body would
 *                           compete with it.
 *
 *   - - / * / 1.          list. Consecutive `- item` or
 *                           `* item` lines become one
 *                           unordered-list block; consecutive
 *                           `1. item`, `2. item`, … lines
 *                           become one ordered-list block.
 *                           A blank line ends the list.
 *                           Switching between ordered and
 *                           unordered markers in the same
 *                           run ends the previous list and
 *                           starts a new one (you can't
 *                           mix types in a single block).
 *                           Items are single-line only —
 *                           multi-line items (continuation
 *                           paragraphs, nested lists) are NOT
 *                           supported; a wrapped line would
 *                           end the list. That keeps the
 *                           block list predictable for both
 *                           the React page and the feed
 *                           builders.
 *
 *   - everything else       paragraph. Consecutive non-blank
 *                           lines (no fence, no `>`, no
 *                           standalone image, no `#` heading,
 *                           no list marker) are one
 *                           paragraph; lines are joined with
 *                           spaces.
 *
 * Inline markdown (`**bold**`, `*italic*`, `[link](url)`,
 * `` `code` ``) is NOT processed here — that's the renderer's
 * job. This parser only identifies block boundaries and types.
 *
 * Leading / trailing blank lines are ignored. Empty blocks
 * (e.g. an empty fenced code block) are dropped.
 *
 * @param {string} raw - the markdown body string
 * @returns {Array<
 *   { type: 'paragraph', content: string } |
 *   { type: 'quote',     content: string } |
 *   { type: 'code',      content: string, lang: string } |
 *   { type: 'image',     alt: string, src: string, title: string } |
 *   { type: 'heading',   level: number, content: string } |
 *   { type: 'list',      ordered: boolean, items: string[] }
 * >}
 */

// A line that is JUST an image (with optional surrounding
// whitespace and an optional `"title"` after the URL). The
// match must consume the entire trimmed line — any prose on
// the same line falls through to the paragraph branch and
// the image renders inline through the marked pipeline.
// URL capture is `\S+?` (non-greedy, no whitespace) so the
// closing `)` reliably terminates the URL; this matches
// CommonMark's behaviour of treating whitespace as the URL
// terminator and means image URLs with literal parens
// inside them need percent-encoding, same as everywhere
// else in the markdown ecosystem.
const IMAGE_ONLY = /^\s*!\[([^\]]*)\]\(\s*(\S+?)\s*(?:"([^"]+)")?\)\s*$/

// ATX heading — 1–6 leading `#`s, a required space, then
// the heading text. The optional trailing `#`s (ATX
// closing style — `# Heading #`) are stripped; the
// captured text is just the visible heading. Matches the
// whole line so a paragraph line that happens to start
// with `#` (rare) still parses correctly.
const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/

// Unordered-list item: `- ` or `* ` followed by the item
// text. The space after the marker is required (so a line
// like `-item` doesn't qualify).
const UL_ITEM = /^[-*]\s+(.+)$/

// Ordered-list item: `1. `, `2. `, etc. (also `1) ` for
// the alternate marker). The number is captured but not
// used at parse time — the renderer numbers items in
// document order so a list that starts at `5` would still
// renumber from 1.
const OL_ITEM = /^\d+[.)]\s+(.+)$/
export const parseMarkdownBlocks = (raw) => {
  const lines = String(raw).replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip blank lines between blocks (also skips leading /
    // trailing blanks).
    if (line.trim() === '') {
      i++
      continue
    }

    // Fenced code block — recognised first so the blank-line
    // rule below doesn't see blank lines INSIDE the fence as
    // block separators. The language id (e.g. "bash") is
    // optional on the opening fence.
    const fenceOpen = line.match(/^```(\S*)\s*$/)
    if (fenceOpen) {
      const lang = fenceOpen[1] || ''
      const codeLines = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i])
        i++
      }
      // Consume the closing fence if present (tolerate a
      // missing closing fence at end-of-input rather than
      // silently swallowing the rest of the post).
      if (i < lines.length) i++
      const content = codeLines.join('\n')
      if (content.trim() !== '') {
        blocks.push({ type: 'code', lang, content })
      }
      continue
    }

    // Blockquote — consecutive `>` lines become one block;
    // a blank line starts a new block.
    if (/^>\s?/.test(line)) {
      const quoteLines = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, '').trim())
        i++
      }
      const content = quoteLines.join(' ')
      if (content !== '') {
        blocks.push({ type: 'quote', content })
      }
      continue
    }

    // Standalone image — a line that is exactly
    // `![alt](url)` (or with an optional `"title"`). Promoted
    // to its own block so the slug page can wrap it in a
    // <Figure> with caption treatment, and the plain-text
    // feeds can replace it with a one-line `[image: alt]`
    // placeholder. Checked BEFORE the paragraph catch-all so
    // an image-only line never gets joined into a
    // surrounding paragraph.
    const imageOnly = line.match(IMAGE_ONLY)
    if (imageOnly) {
      blocks.push({
        type: 'image',
        alt: imageOnly[1] || '',
        src: imageOnly[2],
        title: imageOnly[3] || '',
      })
      i++
      continue
    }

    // ATX heading — 1–6 `#`s, a space, the heading text.
    // Checked BEFORE the paragraph catch-all so a line like
    // `## Subhead` is never joined into the surrounding prose.
    const headingMatch = line.match(HEADING)
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2].trim(),
      })
      i++
      continue
    }

    // List — consecutive `- `/`* ` (unordered) or
    // `N. `/`N) ` (ordered) lines become one list block.
    // Blank line or a non-matching line ends the list.
    // Mixing ordered and unordered markers in the same run
    // is treated as a list break (each run becomes its own
    // block) so a stray `- ` doesn't get merged into an
    // ordered list above it.
    const ulStart = line.match(UL_ITEM)
    const olStart = line.match(OL_ITEM)
    if (ulStart || olStart) {
      const ordered = !!olStart
      const items = []
      while (i < lines.length) {
        const current = lines[i]
        if (ordered) {
          const m = current.match(OL_ITEM)
          if (!m) break
          items.push(m[1].trim())
        } else {
          const m = current.match(UL_ITEM)
          if (!m) break
          items.push(m[1].trim())
        }
        i++
      }
      if (items.length > 0) {
        blocks.push({ type: 'list', ordered, items })
      }
      continue
    }

    // Paragraph — consecutive non-blank, non-fence, non-`>`
    // lines. Lines are joined with a space (CommonMark
    // soft-break semantics).
    const paraLines = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^```/.test(lines[i]) &&
      !/^>\s?/.test(lines[i])
    ) {
      paraLines.push(lines[i].trim())
      i++
    }
    const content = paraLines.join(' ')
    if (content !== '') {
      blocks.push({ type: 'paragraph', content })
    }
  }

  return blocks
}