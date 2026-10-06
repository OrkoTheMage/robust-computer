/**
 * FieldNotes index page
 *
 * Lists every Field Notes post, newest first. The per-post
 * page handles rendering a single post; this page is the
 * "spoke" that collects them all and surfaces the
 * subscribe widget.
 *
 * The post list is a series of bordered cards on the
 * paper surface. The publish date is rendered inside an
 * inverted (ink) chip with `paper` foreground so the
 * date stands out from the card body — chunk 10's
 * "publish date color on /field-notes should be paper"
 * rule, applied to the index (the per-post page keeps
 * its own `paper` text on its `ink` HeaderBox).
 *
 * The "Not already Subscribed?" box reuses the
 * NewsletterBox widget from the Contact page (the only
 * difference is the header/sub copy, both pulled from
 * `data/copy.js`).
 *
 * Route: /field-notes  (must be mounted before
 * /field-notes/:slug in App.jsx so the slug route doesn't
 * swallow this one).
 */

import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import { Link } from 'react-router-dom'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { NewsletterBox } from '../components/sections/FieldNotes'
import { SEO } from '../components/seo'
import { fieldNotes as fieldNotesCopy } from '../data/copy'
import { fieldNotes } from '../data/fieldNotes'
import { formatPubDate } from '../hooks/useLatestRss'
import { usePagination } from '../hooks/usePagination'

const Page = styled.main`
  min-height: 100vh;
  background: ${colors.paper};
`

const List = styled.section`
  width: 100%;
  max-width: var(--page);
  margin: 0 auto;
  padding: 64px 56px 24px;

  @media (max-width: 980px) {
    padding: 40px 24px 16px;
  }
`

// Post card. Ticket surface, 3px black border, hard
// offset shadow — same card language as the Contact
// enquiry Sheet and the per-post page Sheet. The card is
// a real <Link> to the per-post page; the entire card
// is the click target, not just the title.
//
// Hover lifts the card and grows the shadow so the user
// gets the same "press me" affordance as the other
// neo-brutalist surfaces on the site.
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

  @media (max-width: 760px) {
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

// Date chip — `paper` text on `ink` background, per chunk
// 10. Right-aligned on desktop, left-aligned (under the
// title) on mobile so the stacked card body reads
// top-down.
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

  @media (max-width: 760px) {
    align-self: flex-start;
  }
`

// Subscribe section sits below the list. Same horizontal
// padding as the list so the box aligns with the cards.
const Subscribe = styled.section`
  width: 100%;
  max-width: var(--page);
  margin: 0 auto;
  padding: 24px 56px 96px;

  @media (max-width: 980px) {
    padding: 16px 24px 64px;
  }
`

// Pagination row. Sits between the list and the subscribe
// box, so the reader's eye lands on "Page 2 of 3" before
// the subscribe CTA. Same horizontal padding as the list
// and the subscribe section so the three blocks stack in
// the same column.
const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: var(--page);
  margin: 0 auto;
  padding: 8px 56px 0;

  @media (max-width: 980px) {
    padding: 8px 24px 0;
    gap: 8px;
  }
`

// Compact button for the pagination row. Smaller than the
// standard <Button> primitive (which is sized for CTAs) and
// uses transient props (`$active`, `$disabled`) so the
// DOM stays clean of custom attributes.
//
// Active state is the inverted `ink` block with `paper`
// text and a hard offset shadow — same card language as the
// other surfaces on the page. Inactive state is a bare
// bordered chip so the page numbers read as a row of
// clickable cells rather than a list of buttons.
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

  @media (max-width: 560px) {
    min-width: 38px;
    height: 38px;
    font-size: 12px;
    padding: 0 10px;
  }
`

// Cap the box width on the wider page so the form doesn't
// stretch across the whole column.
const Box = styled.div`
  max-width: 560px;
`

// The data file is already sorted by helpers (`getLatest`),
// but the index page wants a stable, full list. Sort a
// clone so the source array isn't mutated in place.
const sortByPubDateDesc = (notes) =>
  [...notes].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

// Number of posts rendered per page on the index. Held as
// a const (not a prop) because the page is the only
// consumer and the design is tuned for this count. Bump
// it to 10 once the list grows past 30 or so and the cards
// start to dominate the page.
const PAGE_SIZE = 5

export default function FieldNotes() {
  const posts = sortByPubDateDesc(fieldNotes)
  const pager = usePagination(posts, PAGE_SIZE)

  return (
    <Page>
      <SEO
        title="Field notes"
        description={fieldNotesCopy.lead}
        path="/field-notes"
      />
      <Navbar />
      <PageHeader
        title="Field notes"
        lead={fieldNotesCopy.lead}
        imageVariant="bannerAlt"
      />
      <List>
        {pager.pageItems.length === 0 ? (
          <p>No posts yet — subscribe and you&apos;ll get the first one.</p>
        ) : (
          pager.pageItems.map((note) => (
            <Card key={note.slug} to={`/field-notes/${note.slug}`}>
              <Body>
                <Eyebrow>{note.issuePrefix}</Eyebrow>
                <Title>{note.title}</Title>
                <Description>{note.description}</Description>
              </Body>
              <DateChip>Published {formatPubDate(note.pubDate)}</DateChip>
            </Card>
          ))
        )}
      </List>
      {pager.totalPages > 1 && (
        <Pagination aria-label="Field notes pagination">
          <PageBtn
            type="button"
            onClick={pager.prev}
            disabled={!pager.hasPrev}
            aria-label="Previous page"
          >
            ‹ Prev
          </PageBtn>
          {Array.from({ length: pager.totalPages }, (_, i) => i + 1).map((p) => (
            <PageBtn
              key={p}
              type="button"
              onClick={() => pager.goTo(p)}
              $active={pager.page === p}
              aria-label={`Go to page ${p}`}
              aria-current={pager.page === p ? 'page' : undefined}
            >
              {p}
            </PageBtn>
          ))}
          <PageBtn
            type="button"
            onClick={pager.next}
            disabled={!pager.hasNext}
            aria-label="Next page"
          >
            Next ›
          </PageBtn>
        </Pagination>
      )}
      <Subscribe>
        <Box>
          <NewsletterBox
            header={fieldNotesCopy.subscribeBox.header}
            sub={fieldNotesCopy.subscribeBox.sub}
            bg={colors.gold}
            fg={colors.ink}
          />
        </Box>
      </Subscribe>
      <Footer />
    </Page>
  )
}
