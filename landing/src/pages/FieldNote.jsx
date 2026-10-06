/**
 * FieldNote
 *
 * Renders a single "Field Notes" post (the targets of the Hero
 * ticket's "Shipped" stamp and the Field Notes band's
 * "Latest issue" link). The data comes from
 * `data/fieldNotes.js` — the page looks up the post whose slug
 * matches the route's `:slug` segment.
 *
 * The post body is split on blank lines into blocks. The
 * first block is the Lede (the deck/summary of the post, with
 * its own pull-quote styling). Every remaining block goes
 * inside a single QuoteField — the whole post body sits in
 * one "field" with the input-field aesthetic, so the body
 * reads as a single lifted-out surface rather than a string
 * of loose paragraphs.
 *
 * If the post has an `author`, an `AuthorFoot` is rendered at
 * the bottom of the Sheet (between the body and the back
 * link) as a "signed by" byline. Omit `author` from the data
 * entry to skip the foot.
 *
 * When a richer content store (markdown, CMS, …) is wired
 * up, this block-parsing logic would be replaced by
 * rendering the post body directly.
 *
 * Mobile: the Lede (28px), QuoteSection (18px text + 56px
 * decorative quote marks), and AuthorStamp (24px + 6px
 * border + 8.7° rotation) were all sized for the desktop
 * Sheet (760px wide). Below 760px they dwarf the
 * viewport, so each has a mobile pass that uses `clamp()`
 * for fluid typography and a `@media (max-width: 760px)`
 * block for the layout pieces. The Sheet and HeaderBox
 * already had mobile padding/margins before this pass.
 *
 * Route: /field-notes/:slug  (items live at /field-notes/<slug>;
 * single-segment slug for now — see the App.jsx comment if a
 * multi-segment slug is ever needed).
 */

import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Fragment } from 'react'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { SEO } from '../components/seo'
import { useRssItem, formatPubDate } from '../hooks/useRssItem'
import { parseMarkdownBlocks } from '../utils/parseMarkdownBlocks'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import plaintext from 'highlight.js/lib/languages/plaintext'
import '../styles/highlight.css'

// Register only the languages the FieldNotes content needs.
// Each language is a small separate file, so the bundle
// stays slim even with multiple languages available.
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

const Page = styled.main`
  min-height: 100vh;
  background: ${colors.paper};
`

// Card surface for the post body. Mirrors the visual language
// of the Contact enquiry form's "Sheet" — 3px black border, ticket
// background, 8px hard offset shadow — so the post body reads as
// a physical artifact sitting below the gold PageHeader, the same
// way the enquiry form sits below the Contact PageHeader.
//
// No explicit `width` — a block element already takes the full
// available width of its parent, capped by `max-width`. Adding
// `width: 100%` on top of a horizontal margin caused the Sheet
// to overflow the viewport on mobile (the margin was added
// outside the 100% width, pushing the right edge 16px past the
// viewport). Without the explicit width, the block element
// correctly accounts for the margin and stays inside.
const Sheet = styled.article`
  max-width: 760px;
  margin: 48px auto;
  border: 3px solid ${colors.ink};
  background: ${colors.ticket};
  padding: 30px 34px;
  box-shadow: 8px 8px 0 ${colors.ink};
  color: ${colors.ink};

  @media (max-width: 760px) {
    margin: 32px 16px;
    padding: 24px 22px;
  }
`

// Black "body content header" box that introduces the post
// directly above the Sheet. Styled like the Contact page's
// "Prefer plain email?" box (bg ${colors.ink}, fg paper, 3px border) so
// every "content card" on the site shares the same card language.
// Inside it: the issue kicker (inverted — paper-on-black chip),
// the post title (h1, display, paper), and the published date
// (mono, paper, muted).
//
// Same fix as `Sheet` — no explicit `width`, so the
// block element naturally accounts for the mobile margin
// instead of overflowing the viewport.
const HeaderBox = styled.div`
  max-width: 760px;
  margin: 32px auto 0;
  border: 3px solid ${colors.ink};
  background: ${colors.ink};
  color: ${colors.paper};
  padding: 28px 32px 30px;

  .kicker {
    display: inline-block;
    margin: 0 0 14px;
    padding: 4px 10px;
    background: ${colors.paper};
    color: ${colors.ink};
    font-family: var(--mono);
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(32px, 4.5vw, 52px);
    line-height: 0.98;
    margin: 0 0 14px;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: ${colors.paper};
  }

  .date {
    font-family: var(--mono);
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${colors.paper};
    opacity: 0.7;
  }

  @media (max-width: 760px) {
    margin: 24px 16px 0;
    padding: 22px 22px 24px;
  }
`

// Lede as a pull-quote. The first paragraph of the post
// becomes the "deck" — a summary statement that sits above the
// body proper. The thick left border + breathing room on the
// indented side gives it a clear "this is the lead" treatment
// that distinguishes it from the body paragraphs below. Sized
// at 28px (vs body's 18px) — 25% larger than the previous
// 22px — so it dominates the reading flow and reads as the
// post's thesis at a glance.
//
// Mobile: scales down via `clamp()` to ~21px (down from
// 28px) so the deck still reads as the lead but doesn't
// dominate the phone viewport. The left border thins to
// 4px and the bottom margin shrinks so the lede doesn't
// push the first body section halfway down the screen.
const Lede = styled.p`
  font-family: var(--body);
  font-size: clamp(21px, 5vw, 28px);
  font-weight: 700;
  line-height: 1.45;
  color: ${colors.ink};
  padding: 4px 0 4px 24px;
  margin: 0 0 54px;
  border-left: 5px solid ${colors.ink};

  /* Inline markdown from marked.parseInline: links + code. */
  a {
    color: ${colors.ink};
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }
  a:hover {
    color: ${colors.goldDeep};
  }
  /* Inline code: same dark surface as the code blocks
     (colors.tie) so a code snippet reads as a chip of the
     same material as the code block. Mono font, paper
     foreground, no border (the dark bg already separates it
     from the cream body). A small inset line at the bottom
     gives it a pressed feel, like the ink on the
     code-block chip. */
  code {
    font-family: var(--mono);
    background: ${colors.tie};
    color: ${colors.paper};
    padding: 2px 6px;
    font-size: 0.9em;
    box-shadow: inset 0 -1px 0 ${colors.ink};
  }
  u {
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }

  @media (max-width: 760px) {
    padding: 2px 0 2px 16px;
    margin: 0 0 32px;
    border-left-width: 4px;
  }
`

// TextSection. A regular prose paragraph — no background, no
// border, just serif text flowing in the normal document
// flow. Multiple TextSections can appear in a post,
// interleaved with QuoteSections and CodeBlocks in any
// order. The chrome (kicker, code blocks, inline code,
// author stamp, back link) keeps the mono treatment; the
// prose gets the readable Georgia serif.
const TextSection = styled.div`
  font-size: 17px;
  line-height: 1.65;
  font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
  color: ${colors.ink};
  margin: 0 0 20px;

  /* Inline markdown from marked.parseInline: links + code.
     Direct child selectors (not p a / p code) because the
     section's only child is the span renderInline returns. */
  a {
    color: ${colors.ink};
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }
  a:hover {
    color: ${colors.goldDeep};
  }
  code {
    font-family: var(--mono);
    background: ${colors.tie};
    color: ${colors.paper};
    padding: 2px 6px;
    font-size: 0.9em;
    box-shadow: inset 0 -1px 0 ${colors.ink};
  }
  u {
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }
`

// QuoteSection. A ">" prefixed block — a pull-quote with its
// own bordered "field" surface and decorative open/close
// quote marks at the corners. The bordered white surface
// (colors.paper) makes the quote stand out from the
// surrounding prose without changing the typography family
// (still Georgia serif, just italic). The opening mark
// (Unicode 201C) sits at the top-left, the closing mark
// (Unicode 201D, the typographic mirror) at the bottom-right.
//
// Mobile: the 56px decorative quotes dwarf the body text
// on a phone, so they drop to 32px (still readable, still
// decorative, no longer competing with the prose). Padding
// tightens to 28px/20px and the quote marks tuck closer
// to the border corners so the field still feels like a
// framed box rather than a paragraph with floating marks.
const QuoteSection = styled.div`
  position: relative;
  width: 100%;
  border: 3px solid ${colors.ink};
  background: ${colors.paper};
  color: ${colors.ink};
  padding: 36px 40px;
  font-size: 18px;
  line-height: 1.6;
  font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
  font-style: italic;
  margin: 0 0 24px;

  /* Decorative opening quote — top-left, slightly inset from
     the border so it sits inside the field. */
  &::before {
    content: '\u201C';
    position: absolute;
    top: 4px;
    left: 16px;
    font-family: var(--display);
    font-size: 56px;
    font-weight: 800;
    line-height: 1;
    color: ${colors.ink};
    pointer-events: none;
  }

  /* Decorative closing quote — bottom-right, the typographic
     mirror of the opening (right: matches the opening's left:
     so the two marks sit at mirrored distances from their
     respective edges). */
  &::after {
    content: '\u201D';
    position: absolute;
    bottom: 4px;
    right: 16px;
    font-family: var(--display);
    font-size: 56px;
    font-weight: 800;
    line-height: 1;
    color: ${colors.ink};
    pointer-events: none;
  }

  /* Same inline-markdown styling as TextSection so links and
     code work the same inside a quote. */
  a {
    color: ${colors.ink};
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }
  a:hover {
    color: ${colors.goldDeep};
  }
  code {
    font-family: var(--mono);
    background: ${colors.tie};
    color: ${colors.paper};
    padding: 2px 6px;
    font-size: 0.9em;
    box-shadow: inset 0 -1px 0 ${colors.ink};
  }
  u {
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }

  @media (max-width: 760px) {
    padding: 28px 20px 24px;
    font-size: 16px;

    &::before {
      top: 0;
      left: 10px;
      font-size: 32px;
    }

    &::after {
      bottom: 0;
      right: 10px;
      font-size: 32px;
    }
  }
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 3px solid ${colors.ink};
  font-family: var(--mono);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${colors.ink};
  text-decoration: none;
  transition: color 180ms cubic-bezier(0.22, 1, 0.36, 1);

  &:hover,
  &:focus-visible {
    color: ${colors.goldDeep};
  }

  @media (max-width: 760px) {
    margin-top: 32px;
    padding-top: 20px;
    font-size: 13px;
  }
`

// Author stamp. A small bordered mark on the Sheet's
// surface — no background fill, just ink border + text.
//
// "Hand-stamped" treatment:
//   - counter-clockwise rotation (-8.7deg) so the stamp
//     looks pressed by hand, not perfectly aligned
//   - a bold-but-small gold offset shadow (3px, no blur) so
//     the stamp has a bit of lift off the Sheet without
//     dominating.
//
// Position: the stamp is right-aligned in a flex parent and
// inset from the right by 40px so its right edge "meets" the
// left edge of the closing double quote (which sits ~40px
// from the Sheet's right edge after the 34px Sheet padding
// and the quote's ~40px character width).
//
// The em-dash prefix keeps the byline reading as "signed by"
// rather than just a label. Conditional render — if the post
// has no `author`, the foot is omitted entirely (the BackLink
// still renders below).

// CodeBlock. A fenced code block in the post body (markdown
// ` ```lang ... ``` `) renders as this: a gold language tag at
// the top, then a dark "tie" body with the highlighted code.
// The highlight.js color classes (.hljs-keyword, .hljs-string,
// etc.) are styled in src/styles/highlight.css to match the
// brand palette — this component only handles layout.
//
// Horizontally scrollable so long lines don't break the
// layout. The <code> inside <pre> is the actual highlighted
// output from highlight.js; the <pre> wrapper preserves
// whitespace and gives us the overflow-x: auto.
const CodeBlock = styled.div`
  border: 3px solid ${colors.ink};
  background: ${colors.tie};
  color: ${colors.paper};
  margin: 0 0 16px;
  overflow: hidden;
`

// Container for code blocks rendered outside the QuoteField
// (Removed — the old "group all code blocks together" container
// is no longer needed now that each section (text, quote,
// code) is rendered as its own modular element. The CodeBlock
// styled component below still carries its own margin.)

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

  @media (max-width: 760px) {
    padding: 5px 12px;
    font-size: 11px;
  }
`

const CodeBody = styled.pre`
  margin: 0;
  padding: 16px 20px;
  font-family: var(--mono);
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  color: ${colors.paper};

  /* Reset the inline-<code> styling (background, border, etc.)
     since the block is already inside a bordered surface and
     the highlight.js output adds its own <span> wrappers. */
  code {
    font-family: var(--mono);
    background: transparent;
    color: inherit;
    padding: 0;
    border: 0;
    font-size: inherit;
  }

  @media (max-width: 760px) {
    padding: 12px 16px;
    font-size: 13px;
  }
`

const AuthorFoot = styled.div`
  margin-top: 48px;
  display: flex;
  justify-content: flex-end;
`

const AuthorStamp = styled.div`
  position: relative;
  display: inline-block;
  padding: 17px 31px;
  border: 6px solid ${colors.ink};
  /* Bold-but-small offset shadow — solid gold, 3px, no blur.
     Small enough to read as "lift", bold enough to give the
     stamp presence against the Sheet. */
  box-shadow: 3px 3px 0 ${colors.gold};
  /* Inset from the right by 40px so the stamp's right edge
     lines up with the left edge of the closing double quote
     (which sits at right: -8px in a 72px font, ~40px from
     the Sheet's right edge). */
  margin-right: 40px;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${colors.ink};
  /* Counter-clockwise tilt — reads as hand-pressed, not
     perfectly aligned. Negative degrees = left side up. */
  transform: rotate(-8.7deg);

  /* Mobile: the stamp's 6px border + 24px text + 8.7deg
     rotation overflows the Sheet on small viewports. Drop
     the border to 4px, the text to 17px, and the rotation
     to ~4deg (still hand-pressed, not so much that the
     right edge of the stamp touches the Sheet's border).
     The margin-right that lined the stamp up with the
     closing quote on desktop would push it into the
     Sheet's right padding on mobile, so pull it in to
     keep the stamp readable. */
  @media (max-width: 760px) {
    padding: 11px 20px;
    border-width: 4px;
    box-shadow: 2px 2px 0 ${colors.gold};
    margin-right: 16px;
    font-size: 17px;
    transform: rotate(-4deg);
  }
`

// Inline markdown renderer for body text. Uses `marked` for
// real markdown parsing (handles nesting, links, inline code,
// and the underscore / asterisk alternatives) and `DOMPurify`
// to sanitize the output before it goes into
// `dangerouslySetInnerHTML` — any literal <, >, & in the
// source are still escaped, and any HTML the user types
// (like <script>) is stripped.
//
// Supported syntax:
//   *italic*  _italic_
//   **bold**  __bold__
//   [text](url)
//   `code`
//   **bold *italic* bold**  (nesting)
//   <https://example.com>  (autolink)
//
// Links are opened in a new tab via a post-processing step
// (target="_blank" rel="noopener noreferrer"). The span
// wrapper is the React child boundary — marked produces
// inline HTML only (no <p>, no <h1>, etc.), so it nests
// correctly inside the Lede's <p> and the QuoteField's
// paragraphs.
const renderInline = (text) => {
  let html = marked.parseInline(text)
  // Open external links in a new tab; noopener prevents the
  // new page from accessing window.opener, noreferrer
  // prevents the Referer header from leaking.
  html = html.replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" '
  )
  const clean = DOMPurify.sanitize(html)
  return <span dangerouslySetInnerHTML={{ __html: clean }} />
}

// Fenced code block parser. Takes a parsed block of shape
// `{ type: 'code', content, lang }` from `parseMarkdownBlocks`.
// The language may be empty (no tag in the opening fence) or
// an unknown id — both fall back to `plaintext` (no
// highlighting). The highlighted HTML goes through DOMPurify
// as a belt-and-suspenders measure even though highlight.js
// output is trusted. Content is rendered verbatim, including
// blank lines inside the fence.
const renderCodeBlock = (block) => {
  const requested = block.lang || 'plaintext'
  const code = block.content
  let highlighted
  try {
    const language = hljs.getLanguage(requested)
      ? requested
      : 'plaintext'
    highlighted = hljs.highlight(code, { language }).value
  } catch {
    highlighted = code
  }
  return (
    <CodeBlock>
      <CodeHeader>{requested}</CodeHeader>
      <CodeBody>
        <code
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlighted) }}
        />
      </CodeBody>
    </CodeBlock>
  )
}

// Block → JSX renderer. Consumes the structured block list
// from `parseMarkdownBlocks`. The first block is the Lede (the
// deck/summary of the post, with its own pull-quote styling).
// Each remaining block is rendered as its own modular
// section — TextSection, QuoteSection, or CodeBlock — so they
// can be interleaved in any order, and any type can appear
// more than once.
//
// Text blocks go through renderInline so the author can use
// *italic*, **bold**, [links](urls), and `inline code` inside
// the body. Quote blocks have the `> ` prefix already
// stripped by the parser (multi-line quotes are joined with
// spaces per CommonMark soft-break semantics). Code blocks go
// through renderCodeBlock which pipes the code through
// highlight.js.
//
// The shared parser handles fenced code blocks opaquely (a
// blank line inside a code fence never breaks the fence), so
// `parseMarkdownBlocks` is the single source of block
// boundaries — used here and by the feed.txt builder.
const renderContent = (raw) => {
  const blocks = parseMarkdownBlocks(raw)
  if (blocks.length === 0) return null

  const [lede, ...bodyBlocks] = blocks

  return (
    <>
      <Lede>{renderInline(lede.content)}</Lede>
      {bodyBlocks.map((block, i) => {
        if (block.type === 'code') {
          return <Fragment key={i}>{renderCodeBlock(block)}</Fragment>
        }
        if (block.type === 'quote') {
          return (
            <QuoteSection key={i}>{renderInline(block.content)}</QuoteSection>
          )
        }
        return (
          <TextSection key={i}>{renderInline(block.content)}</TextSection>
        )
      })}
    </>
  )
}

const FieldNote = () => {
  const { slug = '' } = useParams()
  const { item, loading } = useRssItem(slug)

  // SEO is always rendered first so the title and meta tags are
  // set immediately, even before the RSS fetch resolves (the
  // component renders nothing, so it doesn't affect layout).
  const seoTitle = loading ? 'Field note' : item ? item.title : 'Field note not found'
  const seoDescription = item ? item.description : 'Field Notes from Robust Computer — short issues on building software that lasts.'

  if (loading) {
    return (
      <Page>
        <SEO title={seoTitle} description={seoDescription} path={`/field-notes/${slug}`} type="article" />
        <Navbar />
        <PageHeader title="Field note" lead="Loading…" image={false} />
        <Footer />
      </Page>
    )
  }

  if (!item) {
    return (
      <Page>
        <SEO title={seoTitle} description={seoDescription} path={`/field-notes/${slug}`} type="article" />
        <Navbar />
        <PageHeader title="Not found" lead="No post at this URL." image={false} />
        <Sheet>
          <BackLink to="/">
            <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
            Back to home
          </BackLink>
        </Sheet>
        <Footer />
      </Page>
    )
  }

  return (
    <Page>
      <SEO
        title={seoTitle}
        description={seoDescription}
        path={`/field-notes/${slug}`}
        type="article"
      />
      <Navbar />
      <PageHeader
        eyebrow="Field notes"
        lead={item.channelDescription}
        imageVariant="bannerAlt"
      />
      <HeaderBox>
        {item.issuePrefix && <span className="kicker">{item.issuePrefix}</span>}
        <h1>{item.title}</h1>
        <div className="date">Published {formatPubDate(item.pubDate)}</div>
      </HeaderBox>
      <Sheet>
        {renderContent(item.raw)}
        {item.author && (
          <AuthorFoot>
            <AuthorStamp>{`— ${item.author}`}</AuthorStamp>
          </AuthorFoot>
        )}
        <BackLink to="/">
          <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
          Back to home
        </BackLink>
      </Sheet>
      <Footer />
    </Page>
  )
}

export default FieldNote
