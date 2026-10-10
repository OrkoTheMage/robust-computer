import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import { mobile } from '../styles/breakpoints'
import { Link } from 'react-router-dom'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { IssueSubscribe } from '../components/sections/Issue'
import { SEO } from '../components/seo'
import { FIELD_NOTES_PAGE_SIZE } from '../data/feed'
import { formatPubDate } from '../utils/formatPubDate'
import { getAllPosts } from '../data/feed'
import { usePagination } from '../hooks/usePagination'
import { useNewsletterForm } from '../hooks/useNewsletterForm'
import { useLocale } from '../context/LocaleContext'

/**
 * News (Field Notes archive)
 *
 * Lists every Field Notes post, newest first. The per-post
 * page (`pages/Post.jsx`) handles rendering a single post;
 * this page is the "spoke" that collects them all and
 * surfaces the subscribe widget.
 *
 * Naming: `News` is the canonical code-noun for the archive
 * page. The page lives at `pages/News.jsx` and is mounted
 * at the URL `/field-notes` (the URL stays brand-prefixed
 * for SEO continuity — the rename is code-side only).
 *
 * Per-surface rule for the visible identity:
 *
 *   - File name            `pages/News.jsx`     (code-noun)
 *   - Visible H1           `News`               (code-noun)
 *   - Browser <title>      "News | Robust Computer" (code-noun)
 *   - SEO <description>    "Field Notes — ..."  (brand stays)
 *   - URL                  /field-notes         (brand stays)
 *
 * The post list is a series of bordered cards on the
 * paper surface. The publish date is rendered inside an
 * inverted (ink) chip with `paper` foreground so the
 * date stands out from the card body.
 *
 * The "Not already Subscribed?" box reuses the
 * IssueSubscribe widget from the Contact page (the only
 * difference is the header/sub copy, both pulled from
 * the i18n dictionary).
 *
 * Pagination aria labels come from `newsPage` so the
 * prev/next buttons announce correctly to screen readers
 * in the active locale.
 *
 * Route: /field-notes  (must be mounted before
 * /field-notes/:slug in App.jsx so the slug route doesn't
 * swallow this one).
 */

const Page = styled.main`
  max-width: var(--max);
  margin-inline: auto;
  min-height: 100vh;
  background: ${colors.paper};
`

const List = styled.section`
  width: 100%;
  max-width: var(--page);
  margin: 0 auto;
  padding: 64px 56px 24px;

  ${mobile} {
    padding: 40px 24px 16px;
  }
`

const Card = styled(Link)`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: center;
  padding: 26px 32px;
  border: 3px solid ${colors.ink};
  background: ${colors.ticket};
  color: ${colors.ink};
  box-shadow: 6px 6px 0 ${colors.ink};
  text-decoration: none;
  margin: 0 0 24px;
  transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1);

  &:hover,
  &:focus-visible {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 ${colors.ink};
  }

  &:active {
    transform: translate(3px, 3px);
    box-shadow: 3px 3px 0 ${colors.ink};
  }

  ${mobile} {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 22px 22px;
    margin: 0 0 16px;
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Eyebrow = styled.span`
  display: inline-block;
  align-self: flex-start;
  margin: 0;
  padding: 4px 10px;
  background: ${colors.ink};
  color: ${colors.paper};
  font-family: var(--mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const Title = styled.h2`
  margin: 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(28px, 3.5vw, 40px);
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: -0.005em;
  color: ${colors.ink};
`

const Description = styled.p`
  margin: 0;
  font-size: 16px;
  color: ${colors.ink};
  opacity: 0.8;
  max-width: 50ch;
`

const DateChip = styled.span`
  display: inline-block;
  align-self: center;
  padding: 6px 12px;
  background: ${colors.ink};
  color: ${colors.paper};
  font-family: var(--mono);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;

  ${mobile} {
    align-self: flex-start;
  }
`

const Subscribe = styled.section`
  width: 100%;
  max-width: var(--page);
  margin: 0 auto;
  padding: 24px 56px 96px;

  ${mobile} {
    padding: 16px 24px 64px;
  }
`

const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: var(--page);
  margin: 0 auto;
  padding: 8px 56px 0;

  ${mobile} {
    padding: 8px 24px 0;
    gap: 8px;
  }
`

const PageBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 0 14px;
  border: 3px solid ${colors.ink};
  background: ${(p) => (p.$active ? colors.ink : 'transparent')};
  color: ${(p) => (p.$active ? colors.paper : colors.ink)};
  font-family: var(--mono);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: ${(p) => (p.$active ? `4px 4px 0 ${colors.ink}` : 'none')};
  transition: transform 80ms ease, box-shadow 80ms ease;

  &:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: ${(p) => (p.$active ? `5px 5px 0 ${colors.ink}` : 'none')};
  }

  &:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  ${mobile} {
    min-width: 38px;
    height: 38px;
    font-size: 12px;
    padding: 0 10px;
  }
`

const Box = styled.div`
  max-width: 560px;
`

export default function News() {
  const posts = getAllPosts()
  const pager = usePagination(posts, FIELD_NOTES_PAGE_SIZE)
  const newsletter = useNewsletterForm()
  const { feed, newsPage } = useLocale()

  return (
    <Page>
      <SEO
        title={feed.indexTitle}
        tabTitle={feed.indexTitle}
        description={feed.seoDescription}
        path="/field-notes"
      />
      <Navbar />
      <PageHeader
        title={feed.indexTitle}
        lead={feed.archivesLead}
        imageVariant="bannerAlt"
      />
      <List>
        {pager.pageItems.length === 0 ? (
          <p>{newsPage.empty}</p>
        ) : (
          pager.pageItems.map((post) => (
            <Card key={post.slug} to={post.to}>
              <Body>
                <Eyebrow>{post.issuePrefix}</Eyebrow>
                <Title>{post.title}</Title>
                <Description>{post.description}</Description>
              </Body>
              <DateChip>{newsPage.published} {formatPubDate(post.pubDate)}</DateChip>
            </Card>
          ))
        )}
      </List>
      {pager.totalPages > 1 && (
        <Pagination aria-label="Field Notes pagination">
          <PageBtn
            type="button"
            onClick={pager.prev}
            disabled={!pager.hasPrev}
            aria-label={newsPage.previousPageLabel}
          >
            {newsPage.prev}
          </PageBtn>
          {Array.from({ length: pager.totalPages }, (_, i) => i + 1).map((p) => (
            <PageBtn
              key={p}
              type="button"
              onClick={() => pager.goTo(p)}
              $active={pager.page === p}
              aria-label={newsPage.goToPage(p)}
              aria-current={pager.page === p ? 'page' : undefined}
            >
              {p}
            </PageBtn>
          ))}
          <PageBtn
            type="button"
            onClick={pager.next}
            disabled={!pager.hasNext}
            aria-label={newsPage.nextPageLabel}
          >
            {newsPage.next}
          </PageBtn>
        </Pagination>
      )}
      <Subscribe>
        <Box>
          <IssueSubscribe
            header={feed.subscribeBox.header}
            sub={feed.subscribeBox.sub}
            bg={colors.gold}
            fg={colors.ink}
            email={newsletter.email}
            onChange={newsletter.handleChange}
            onSubmit={newsletter.handleSubmit}
            submitting={newsletter.submitting}
            status={newsletter.status}
            errorMessage={newsletter.errorMessage}
          />
        </Box>
      </Subscribe>
      <Footer />
    </Page>
  )
}
