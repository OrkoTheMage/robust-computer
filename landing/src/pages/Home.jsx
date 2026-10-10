import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import { heroStack } from '../styles/breakpoints'
import TopBar from '../components/sections/TopBar'
import Navbar from '../components/sections/Navbar'
import Hero from '../components/sections/Hero'
import Promises from '../components/sections/Promises'
import Services from '../components/sections/Services'
import Industries from '../components/sections/Industries'
import Steps from '../components/sections/Steps'
import IssueHighlight from '../components/sections/Issue'
import Footer from '../components/sections/Footer'
import { SEO } from '../components/seo'
import { useNewsletterForm } from '../hooks/useNewsletterForm'
import { useChromeHeight } from '../hooks/useChromeHeight'
import { formatPubDate } from '../utils/formatPubDate'
import { getLatestPost } from '../data/feed'
import { useLocale } from '../context/LocaleContext'

/**
 * Home page
 *
 * Composes the public home route: TopBar + Navbar + Hero + Promises
 * + Services + Industries + Steps + Issue (highlight band) + Footer.
 * No state here — the Issue/Highlight band gets its bindings from
 * the page-local `useNewsletterForm` hook.
 *
 * On desktop, Promises sits inside the hero's viewport (pinned to
 * the bottom) so the sections below start at the fold. On mobile
 * the stacked layout is taller than a screen, so both Hero and
 * Promises flow normally and the chrome-height clamp is skipped.
 */

const Page = styled.main`
  max-width: var(--max);
  margin-inline: auto;
  min-height: 100vh;
  background: ${colors.paper};
`

const Opening = styled.div`
  max-width: var(--max);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  /* Fits in one viewport: 100dvh minus the TopBar + Navbar above.
     --chrome is set inline from useChromeHeight. */
  height: calc(100dvh - var(--chrome, 145px));

  ${heroStack} {
    /* When the hero stacks (≤1575w OR ≤1215h), the art + headline
       + ticket + lead + CTAs run taller than a viewport — let the
       hero grow and let Promises sit in normal flow below it. */
    height: auto;
  }
`

export default function Home() {
  const newsletter = useNewsletterForm()
  const chrome = useChromeHeight()
  const latest = getLatestPost()
  const { heroChrome, homePage } = useLocale()
  const ticketBody = latest
    ? `$ curl /latest.txt\n> ${formatPubDate(latest.pubDate)}\n> ${latest.title}\n${latest.description}`
    : heroChrome.emptyTicket

  return (
    <Page>
      <SEO
        description={homePage.seoDescription}
        path="/"
      />
      <TopBar />
      <Navbar />
      <Opening style={{ '--chrome': `${chrome}px` }}>
        <Hero latest={latest} ticketBody={ticketBody} />
        <Promises />
      </Opening>
      <Services />
      <Industries />
      <Steps />
      <div id="newsletter">
        <IssueHighlight
          email={newsletter.email}
          onChange={newsletter.handleChange}
          onSubmit={newsletter.handleSubmit}
          submitting={newsletter.submitting}
          status={newsletter.status}
          errorMessage={newsletter.errorMessage}
          latest={latest}
        />
      </div>
      <Footer />
    </Page>
  )
}
