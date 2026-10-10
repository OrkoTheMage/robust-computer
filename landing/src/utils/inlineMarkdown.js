import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * inlineMarkdown
 *
 * Render a string of inline markdown (`**bold**`, `*italic*`,
 * `[label](url)`, `` `code` ``) to safe HTML, with all anchor
 * tags rewritten to open in a new tab (`target="_blank"`,
 * `rel="noopener noreferrer"`). Output passes through
 * DOMPurify before return.
 *
 * Used by `PostBody` for paragraph / heading / list-item text
 * and by the field-notes feed's RSS / plain-text pipelines
 * for the same kind of inline-only content. Lives in
 * `utils/` (not `data/` or `styles/`) because it's a pure
 * helper, no React, no JSX.
 *
 * Block-level markdown (paragraphs, code fences, blockquotes,
 * headings) is handled separately by `parseMarkdownBlocks`
 * before this runs — `inlineMarkdown` is intentionally
 * `marked.parseInline` only.
 */

export const inlineMarkdown = (text) => {
  const html = marked.parseInline(text).replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" '
  )
  return DOMPurify.sanitize(html)
}
