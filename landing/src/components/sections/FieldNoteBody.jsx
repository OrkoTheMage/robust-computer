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
 * Renders one Field Notes post body. The first paragraph
 * is the lede; everything after (other paragraphs,
 * blockquotes, fenced code, and standalone images) renders
 * in source order. Links open in a new tab. highlight.js
 * output is sanitized before it is inserted.
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

// Figure. Same card language as the post body Sheet — 3px
// ink border, hard offset shadow, paper background — so an
// image reads as a physical artifact sitting inside the
// Sheet, not a browser-default inline `<img>` floating in
// the middle of a paragraph.
//
// Caption strip below the image. Inverted (ink background,
// paper text) so it visually anchors to the bottom of the
// card the same way the HeaderBox anchors the top of the
// post. Caption text is the image's alt text — the same
// source that becomes the `figcaption` in the on-page HTML
// and the `[image: alt]` placeholder in the plain-text
// feeds, so every surface reads the same caption. Empty
// alt is a deliberate choice (decorative image); we hide
// the strip rather than render a blank.
const Figure = styled.figure`
  margin: 0 0 24px;
  border: 3px solid ${colors.ink};
  background: ${colors.paper};
  box-shadow: 6px 6px 0 ${colors.ink};
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: auto;
  }

  figcaption {
    padding: 8px 12px;
    background: ${colors.ink};
    color: ${colors.paper};
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
  }
`

const Image = ({ block }) => (
  <Figure>
    <img src={block.src} alt={block.alt} loading="lazy" />
    {block.alt && <figcaption>{block.alt}</figcaption>}
  </Figure>
)

// Heading hierarchy for the post body. The page's main
// title already lives in the HeaderBox above the body, so
// these are sub-section dividers. h1 in the body is the
// "section stamp" — gold ticket with a hard offset shadow,
// bigger font than h2 — clearly a step above the
// sub-section h2 without competing with the page title's
// ink-background h1. h2 is the standard section break
// (thick bottom border, display font), h3 is a
// sub-section (no border, smaller display), h4 is a
// tertiary label (uppercase mono).
//
// Inline markdown in the heading text is rendered through
// the same Inline component paragraphs use, so a heading
// like `## What we **shipped**` is a single accent
// fragment inside the bigger label rather than literal
// asterisks.
const H1Section = styled.h1`
  font-family: var(--display);
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  line-height: 1;
  color: ${colors.ink};
  margin: 48px 0 20px;
  padding: 14px 20px 16px;
  background: ${colors.gold};
  border: 3px solid ${colors.ink};
  box-shadow: 5px 5px 0 ${colors.ink};
  text-transform: uppercase;
  letter-spacing: -0.01em;

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
    font-size: 0.85em;
  }
`

const H2 = styled.h2`
  font-family: var(--display);
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: 800;
  line-height: 1.1;
  color: ${colors.ink};
  margin: 36px 0 16px;
  padding: 0 0 8px;
  border-bottom: 3px solid ${colors.ink};
  text-transform: uppercase;
  letter-spacing: -0.005em;

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
    font-size: 0.85em;
  }
`

const H3 = styled.h3`
  font-family: var(--display);
  font-size: clamp(20px, 2.8vw, 24px);
  font-weight: 800;
  line-height: 1.2;
  color: ${colors.ink};
  margin: 28px 0 12px;

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
    font-size: 0.85em;
  }
`

const H4 = styled.h4`
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${colors.ink};
  margin: 24px 0 8px;

  a {
    color: ${colors.ink};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  code {
    font-family: var(--mono);
    background: ${colors.tie};
    color: ${colors.paper};
    padding: 1px 5px;
    font-size: 0.9em;
  }
`

const Heading = ({ block }) => {
  if (block.level === 1) return <H1Section><Inline text={block.content} /></H1Section>
  if (block.level === 2) return <H2><Inline text={block.content} /></H2>
  if (block.level === 3) return <H3><Inline text={block.content} /></H3>
  return <H4><Inline text={block.content} /></H4>
}

// List styles. Custom markers (▪ for unordered, a CSS
// counter for ordered) so the bullets read as part of the
// brand instead of browser-default `•` discs. Items use
// the same prose font and size as TextSection so a list
// inside a paragraph flow doesn't feel like a different
// type of content. Inline markdown (links, code, bold) is
// rendered through the same Inline component paragraphs
// use.
//
// Two separate styled components (rather than one with a
// `ordered` prop) so the HTML stays semantically correct
// (`<ul>` vs `<ol>`) and the counter is scoped to the
// ordered list only.
const UlSection = styled.ul`
  margin: 0 0 20px;
  padding: 0 0 0 8px;
  list-style: none;

  li {
    position: relative;
    padding: 4px 0 4px 24px;
    font-family: var(--prose);
    font-size: 17px;
    line-height: 1.65;
    color: ${colors.ink};

    &::before {
      content: '▪';
      position: absolute;
      left: 4px;
      top: 4px;
      color: ${colors.ink};
      font-size: 16px;
      line-height: 1.65;
    }

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
  }
`

const OlSection = styled.ol`
  margin: 0 0 20px;
  padding: 0 0 0 8px;
  list-style: none;
  counter-reset: list-counter;

  li {
    position: relative;
    padding: 4px 0 4px 28px;
    counter-increment: list-counter;
    font-family: var(--prose);
    font-size: 17px;
    line-height: 1.65;
    color: ${colors.ink};

    &::before {
      content: counter(list-counter) '.';
      position: absolute;
      left: 4px;
      top: 4px;
      color: ${colors.ink};
      font-family: var(--mono);
      font-size: 13px;
      font-weight: 700;
      line-height: 1.65;
    }

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
  }
`

const List = ({ block }) => {
  const items = block.items.map((content, j) => (
    <li key={j}><Inline text={content} /></li>
  ))
  return block.ordered ? <OlSection>{items}</OlSection> : <UlSection>{items}</UlSection>
}

const FieldNoteBody = ({ raw }) => {
  const blocks = parseMarkdownBlocks(raw)
  if (blocks.length === 0) return null
  // The lede is the first block only when it is a paragraph.
  // If the post opens with an image (or anything else), that
  // block falls through to the body loop and the post has no
  // lede at all.
  const [first, ...rest] = blocks
  const lede = first.type === 'paragraph' ? first : null
  const bodyBlocks = lede ? rest : [first, ...rest]
  return (
    <>
      {lede && <Lede><Inline text={lede.content} /></Lede>}
      {bodyBlocks.map((block, i) => {
        if (block.type === 'code') return <Fragment key={i}><Code block={block} /></Fragment>
        if (block.type === 'quote') {
          return <QuoteSection key={i}><Inline text={block.content} /></QuoteSection>
        }
        if (block.type === 'image') {
          return <Fragment key={i}><Image block={block} /></Fragment>
        }
        if (block.type === 'heading') {
          return <Fragment key={i}><Heading block={block} /></Fragment>
        }
        if (block.type === 'list') {
          return <Fragment key={i}><List block={block} /></Fragment>
        }
        return <TextSection key={i}><Inline text={block.content} /></TextSection>
      })}
    </>
  )
}

export default FieldNoteBody
