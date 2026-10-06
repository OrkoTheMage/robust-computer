/**
 * landing/src/utils/parseMarkdownBlocks.js
 *
 * Parses a markdown body into a structured list of blocks. This
 * is the SHARED parser used by both the per-post React page
 * (FieldNote.jsx) and the plain-text feed.txt builder
 * (data/fieldNotes.js#renderBodyAsPlainText), so the two
 * renderers always agree on block boundaries — and a blank line
 * inside a fenced code block never breaks the fence.
 *
 * Block shape:
 *   { type: 'paragraph', content: string }
 *   { type: 'quote',     content: string }
 *   { type: 'code',      content: string, lang: string }
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
 *   - everything else       paragraph. Consecutive non-blank
 *                           lines (no fence, no `>`) are one
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
 *   { type: 'code',      content: string, lang: string }
 * >}
 */
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