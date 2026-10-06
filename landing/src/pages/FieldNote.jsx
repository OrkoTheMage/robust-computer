import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import FieldNoteBody from '../components/sections/FieldNoteBody'
import { SEO } from '../components/seo'
import { formatPubDate } from '../utils/formatPubDate'
import { getIssueBySlug } from '../utils/fieldNoteView'
import { fieldNotePage } from '../data/copy'

/**
 * FieldNote
 *
 * Renders a single "Field Notes" post (the targets of the Hero
 * ticket's "Shipped" stamp and the Field Notes band's
 * "Latest issue" link). The data comes from
 * `data/fieldNotes.js` — the page looks up the post whose slug
 * matches the route's `:slug` segment.
 *
 * The body itself is rendered by `FieldNoteBody`, which
 * walks `parseMarkdownBlocks` (lede, then prose / quote /
 * code in source order). An `author` renders a stamp above
 * the back link. Omit `author` to skip the stamp.
 *
 * Route: /field-notes/:slug  (items live at /field-notes/<slug>;
 * single-segment slug for now — see the App.jsx comment if a
 * multi-segment slug is ever needed).
 */

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
const FieldNote = () => {
  const { slug = '' } = useParams()
  const item = getIssueBySlug(slug)
  const seoTitle = item ? item.title : fieldNotePage.notFoundTitle
  const seoDescription = item ? item.description : fieldNotePage.seoFallbackDescription

  if (!item) {
    return (
      <Page>
        <SEO title={seoTitle} description={seoDescription} path={`/field-notes/${slug}`} type="article" />
        <Navbar />
        <PageHeader title={fieldNotePage.notFoundTitle} lead={fieldNotePage.notFoundLead} image={false} />
        <Sheet>
          <BackLink to="/">
            <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
            {fieldNotePage.back}
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
        eyebrow={fieldNotePage.eyebrow}
        lead={item.channelDescription}
        imageVariant="bannerAlt"
      />
      <HeaderBox>
        {item.issuePrefix && <span className="kicker">{item.issuePrefix}</span>}
        <h1>{item.title}</h1>
        <div className="date">Published {formatPubDate(item.pubDate)}</div>
      </HeaderBox>
      <Sheet>
        <FieldNoteBody raw={item.raw} />
        {item.author && (
          <AuthorFoot>
            <AuthorStamp>{`— ${item.author}`}</AuthorStamp>
          </AuthorFoot>
        )}
        <BackLink to="/">
          <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
          {fieldNotePage.back}
        </BackLink>
      </Sheet>
      <Footer />
    </Page>
  )
}

export default FieldNote
