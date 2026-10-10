import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import { mobile } from '../styles/breakpoints'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import PostBody from '../components/sections/PostBody'
import { SEO } from '../components/seo'
import { formatPubDate } from '../utils/formatPubDate'
import { getPostBySlug } from '../data/feed'
import NotFound from './NotFound'
import { useLocale } from '../context/LocaleContext'

/**
 * Post
 *
 * Renders one Field Notes post (the targets of the Hero
 * ticket's "Shipped" stamp and the Issue/Highlight band's
 * "Latest issue" link). The data comes from
 * `data/feed.js` — the page looks up the post whose slug
 * matches the route's `:slug` segment.
 *
 * The body itself is rendered by `PostBody`, which walks
 * `parseMarkdownBlocks` (lede, then prose / quote / code in
 * source order). An `author` renders a stamp above the back
 * link. Omit `author` to skip the stamp.
 *
 * Naming: `Post` is the canonical entity name for one
 * Field Notes article
 * `pages/Post.jsx` is the per-post page; the array `feed`
 * lives in `data/feed.js`.
 *
 * Route: /field-notes/:slug  (items live at
 * /field-notes/<slug>; single-segment slug for now — see
 * the App.jsx comment if a multi-segment slug is ever
 * needed).
 *
 * A slug that doesn't resolve to a real post renders the
 * standard NotFound page (the same one the catch-all
 * `<Route path="*">` uses) instead of an in-page "this
 * slug wasn't found" affordance. The URL stays at
 * /field-notes/<slug> so the browser shows a real 404
 * path, but the rendered page is the site-wide 404. The
 * matching happens here — React Router matches the dynamic
 * route before the catch-all, so the only place to
 * short-circuit is inside this component.
 *
 * The "Published" line in the post header reads from
 * `postPage.publishedLabel` so a Spanish user sees
 * "Publicado" instead of the English word. The post body,
 * title, and description stay in English (chrome translates,
 * content doesn't — see i18n/index.js "Field Notes content
 * scope").
 *
 * The page's `lead` (the line under the eyebrow on the
 * per-post page header) reads from `feed.lead` via
 * `useLocale()` directly. The RSS feed still consumes the
 * English string via `CHANNEL_DESCRIPTION` in `data/feed.js`
 * (the feed is English-only because the posts are
 * English-only).
 *
 * The browser tab (`<title>`) and og:title use the
 * `"Robust Computer — <issuePrefix>: <title>"` form so the
 * descriptive string survives on social cards while the
 * tab mirrors the URL — see SEO.jsx's "Tab title vs
 * og:title" docstring for the surface split. The SEO
 * description keeps the brand-visible form so search
 * engines see "Field Notes" in the snippet.
 */

const Page = styled.main`
  max-width: var(--max);
  margin-inline: auto;
  min-height: 100vh;
  background: ${colors.paper};
`

const Sheet = styled.article`
  max-width: 760px;
  margin: 48px auto;
  border: 3px solid ${colors.ink};
  background: ${colors.ticket};
  padding: 30px 34px;
  box-shadow: 8px 8px 0 ${colors.ink};
  color: ${colors.ink};

  ${mobile} {
    margin: 32px 16px;
    padding: 24px 22px;
  }
`

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

  ${mobile} {
    margin: 24px 16px 0;
    padding: 22px 22px 24px;
  }
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 48px;
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

  ${mobile} {
    margin-top: 32px;
    font-size: 13px;
  }
`

const AuthorFoot = styled.div`
  margin-top: 72px;
  display: flex;
  justify-content: flex-end;

  ${mobile} {
    margin-top: 48px;
  }
`

const AuthorStamp = styled.div`
  position: relative;
  display: inline-block;
  padding: 17px 31px;
  border: 6px solid ${colors.ink};
  box-shadow: 3px 3px 0 ${colors.gold};
  margin-right: 40px;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${colors.ink};
  transform: rotate(-8.7deg);

  ${mobile} {
    padding: 11px 20px;
    border-width: 4px;
    box-shadow: 2px 2px 0 ${colors.gold};
    margin-right: 16px;
    font-size: 17px;
    transform: rotate(-4deg);
  }
`

const Post = () => {
  const { slug = '' } = useParams()
  const post = getPostBySlug(slug)
  const { postPage, feed } = useLocale()

  if (!post) {
    return <NotFound />
  }

  return (
    <Page>
      <SEO
        title={`${post.issuePrefix}: ${post.title}`}
        tabTitle={slug}
        description={post.description}
        path={`/field-notes/${slug}`}
        type="article"
        image={post.ogImage || undefined}
        twitterImage={post.twitterImage || undefined}
      />
      <Navbar />
      <PageHeader
        eyebrow={postPage.eyebrow}
        lead={feed.lead}
        imageVariant="bannerAlt"
      />
      <HeaderBox>
        {post.issuePrefix && <span className="kicker">{post.issuePrefix}</span>}
        <h1>{post.title}</h1>
        <div className="date">{postPage.publishedLabel} {formatPubDate(post.pubDate)}</div>
      </HeaderBox>
      <Sheet>
        <PostBody raw={post.body} />
        {post.author && (
          <AuthorFoot>
            <AuthorStamp>{`— ${post.author}`}</AuthorStamp>
          </AuthorFoot>
        )}
        <BackLink to="/">
          <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
          {postPage.back}
        </BackLink>
      </Sheet>
      <Footer />
    </Page>
  )
}

export default Post
