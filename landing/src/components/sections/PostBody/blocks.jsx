import DOMPurify from 'dompurify'
import { inlineMarkdown } from '../../../utils/inlineMarkdown'
import { highlight } from '../../../utils/highlightCode'

/**
 * PostBody blocks
 *
 * Non-styled JSX used by `sections/PostBody.jsx`. The styled
 * shells (Lede, TextSection, QuoteSection, CodeBlock,
 * CodeHeader, CodeBody, Figure, H1Section, H2, H3, H4,
 * UlSection, OlSection) live in `PostBody.jsx` because
 * nothing else uses them — the §3 layer rule keeps
 * page-specific styled components in the section file. The
 * non-styled component definitions and the helper delegation
 * live here.
 *
 * Each block takes a `block` prop whose shape matches the
 * parsed output of `utils/parseMarkdownBlocks.js`:
 *   { type: 'paragraph', content: string }
 *   { type: 'heading', level: 1|2|3|4, content: string }
 *   { type: 'quote', content: string }
 *   { type: 'code', lang?: string, content: string }
 *   { type: 'image', src: string, alt?: string }
 *   { type: 'list', ordered: boolean, items: string[] }
 *
 * The styled shells are passed in as named props so the block
 * JSX stays decoupled from the visual layer. Inline-markdown
 * rendering and code highlighting are pure helpers in
 * `utils/` — same code the field-notes feed pipeline uses, so
 * the in-page render and the RSS / plain-text feeds produce
 * the same markup.
 */

const Inline = ({ text }) => (
  <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(text) }} />
)

export const Code = ({ block, CodeBlock, CodeHeader, CodeBody }) => {
  const requested = block.lang || 'plaintext'
  const highlighted = highlight(block.content, requested)
  return (
    <CodeBlock>
      <CodeHeader>{requested}</CodeHeader>
      <CodeBody>
        <code dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlighted) }} />
      </CodeBody>
    </CodeBlock>
  )
}

export const Image = ({ block, Figure }) => (
  <Figure>
    <img src={block.src} alt={block.alt} loading="lazy" />
    {block.alt && <figcaption>{block.alt}</figcaption>}
  </Figure>
)

export const Heading = ({ block, H1Section, H2, H3, H4 }) => {
  const children = <Inline text={block.content} />
  if (block.level === 1) return <H1Section>{children}</H1Section>
  if (block.level === 2) return <H2>{children}</H2>
  if (block.level === 3) return <H3>{children}</H3>
  return <H4>{children}</H4>
}

export const List = ({ block, UlSection, OlSection }) => {
  const items = block.items.map((content, j) => (
    <li key={j}><Inline text={content} /></li>
  ))
  return block.ordered ? <OlSection>{items}</OlSection> : <UlSection>{items}</UlSection>
}

export { Inline }
