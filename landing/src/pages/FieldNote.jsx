/**
 * FieldNote
 *
 * Renders a single "Field Notes" post (the targets of the Hero
 * ticket's "Shipped" stamp and the Field Notes band's
 * "Latest issue" link). The data comes from /rss.xml — the page
 * finds the <item> whose <link> pathname matches the route's
 * `:slug` segment.
 *
 * The RSS <description> is split on blank lines into paragraphs;
 * the first paragraph renders as a larger, bold "lede" and the
 * rest as normal body text. When a richer content store
 * (markdown, CMS, …) is wired up, this split-and-style logic
 * would be replaced by rendering the post body directly.
 *
 * Route: /field-notes/:slug  (items live at /field-notes/<slug>;
 * single-segment slug for now — see the App.jsx comment if a
 * multi-segment slug is ever needed).
 */

import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { SEO } from '../components/seo'
import { useRssItem, formatPubDate } from '../hooks/useRssItem'

const Page = styled.main`
  min-height: 100vh;
  background: ${colors.paper};
`

// Card surface for the post body. Mirrors the visual language
// of the Contact enquiry form's "Sheet" — 3px black border, ticket
// background, 8px hard offset shadow — so the post body reads as
// a physical artifact sitting below the gold PageHeader, the same
// way the enquiry form sits below the Contact PageHeader.
const Sheet = styled.article`
  width: 100%;
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
const HeaderBox = styled.div`
  width: 100%;
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

const Lede = styled.p`
  font-family: var(--body);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.45;
  color: ${colors.ink};
  margin: 0 0 22px;
`

const Body = styled.div`
  font-family: var(--body);
  font-size: 19px;
  line-height: 1.6;
  color: ${colors.ink};

  p {
    margin: 0 0 18px;
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
`

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
        {item.raw
          .split(/\n{2,}/)
          .map((para, i) =>
            i === 0
              ? <Lede key={para.slice(0, 20)}>{para}</Lede>
              : <Body key={para.slice(0, 20)}><p>{para}</p></Body>
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
