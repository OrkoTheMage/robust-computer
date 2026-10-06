import styled from '@emotion/styled'
import { Fragment } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import plaintext from 'highlight.js/lib/languages/plaintext'
import { colors } from '../../styles/colors'
import { parseMarkdownBlocks } from '../../utils/parseMarkdownBlocks'
import '../../styles/highlight.css'

/**
 * FieldNoteBody
 *
 * Renders one Field Notes post body. The first block is the
 * lede. Later blocks are prose, quotes, or fenced code, in
 * whatever order the source uses. Links open in a new tab.
 * highlight.js output is sanitized before it is inserted.
 */

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('jsx', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('plaintext', plaintext)
hljs.registerLanguage('text', plaintext)
hljs.registerLanguage('txt', plaintext)

const inlineMarkdown = (text) => {
  const html = marked.parseInline(text).replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" '
  )
  return DOMPurify.sanitize(html)
}

const Inline = ({ text }) => (
  <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(text) }} />
)

const Lede = styled.p`
  font-family: var(--body);
  font-size: clamp(21px, 5vw, 28px);
  font-weight: 700;
  line-height: 1.45;
  color: ${colors.ink};
  padding: 4px 0 4px 24px;
  margin: 0 0 54px;
  border-left: 5px solid ${colors.ink};

  a {
    color: ${colors.ink};
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }
  a:hover { color: ${colors.goldDeep}; }
  code {
    font-family: var(--mono);
    background: ${colors.tie};
    color: ${colors.paper};
    padding: 2px 6px;
    font-size: 0.9em;
    box-shadow: inset 0 -1px 0 ${colors.ink};
  }

  @media (max-width: 760px) {
    padding: 2px 0 2px 16px;
    margin: 0 0 32px;
    border-left-width: 4px;
  }
`

const TextSection = styled.div`
  font-size: 17px;
  line-height: 1.65;
  font-family: var(--prose);
  color: ${colors.ink};
  margin: 0 0 20px;

  a {
    color: ${colors.ink};
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }
  a:hover { color: ${colors.goldDeep}; }
  code {
    font-family: var(--mono);
    background: ${colors.tie};
    color: ${colors.paper};
    padding: 2px 6px;
    font-size: 0.9em;
  }
`

const QuoteSection = styled.div`
  position: relative;
  width: 100%;
  border: 3px solid ${colors.ink};
  background: ${colors.paper};
  color: ${colors.ink};
  padding: 36px 40px;
  font-size: 18px;
  line-height: 1.6;
  font-family: var(--prose);
  font-style: italic;
  margin: 0 0 24px;

  &::before,
  &::after {
    position: absolute;
    font-family: var(--display);
    font-size: 56px;
    font-weight: 800;
    line-height: 1;
    color: ${colors.ink};
    pointer-events: none;
  }
  &::before { content: '\\201C'; top: 4px; left: 16px; }
  &::after { content: '\\201D'; bottom: 4px; right: 16px; }

  a {
    color: ${colors.ink};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  code {
    font-family: var(--mono);
    background: ${colors.tie};
    color: ${colors.paper};
    padding: 2px 6px;
    font-size: 0.9em;
  }

  @media (max-width: 760px) {
    padding: 28px 20px 24px;
    font-size: 16px;
    &::before, &::after { font-size: 32px; }
    &::before { top: 0; left: 10px; }
    &::after { bottom: 0; right: 10px; }
  }
`

const CodeBlock = styled.div`
  border: 3px solid ${colors.ink};
  background: ${colors.tie};
  color: ${colors.paper};
  margin: 0 0 16px;
  overflow: hidden;
`

const CodeHeader = styled.div`
  background: ${colors.gold};
  color: ${colors.ink};
  padding: 6px 14px;
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 3px solid ${colors.ink};
`

const CodeBody = styled.pre`
  margin: 0;
  padding: 16px 20px;
  font-family: var(--mono);
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  color: ${colors.paper};

  code {
    font-family: var(--mono);
    background: transparent;
    color: inherit;
    padding: 0;
    border: 0;
    font-size: inherit;
  }
`

const Code = ({ block }) => {
  const requested = block.lang || 'plaintext'
  const language = hljs.getLanguage(requested) ? requested : 'plaintext'
  let highlighted = block.content
  try {
    highlighted = hljs.highlight(block.content, { language }).value
  } catch {
    highlighted = block.content
  }
  return (
    <CodeBlock>
      <CodeHeader>{requested}</CodeHeader>
      <CodeBody>
        <code dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlighted) }} />
      </CodeBody>
    </CodeBlock>
  )
}

const FieldNoteBody = ({ raw }) => {
  const blocks = parseMarkdownBlocks(raw)
  if (blocks.length === 0) return null
  const [lede, ...bodyBlocks] = blocks
  return (
    <>
      <Lede><Inline text={lede.content} /></Lede>
      {bodyBlocks.map((block, i) => {
        if (block.type === 'code') return <Fragment key={i}><Code block={block} /></Fragment>
        if (block.type === 'quote') {
          return <QuoteSection key={i}><Inline text={block.content} /></QuoteSection>
        }
        return <TextSection key={i}><Inline text={block.content} /></TextSection>
      })}
    </>
  )
}

export default FieldNoteBody
