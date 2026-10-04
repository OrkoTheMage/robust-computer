/**
 * Home page
 *
 * Composes the public home route: TopBar + Navbar + Hero + Promises
 * + Services + Industries + Steps + FieldNotes + Footer.
 * No state here — the FieldNotes section gets its bindings from
 * the page-local `useNewsletterForm` hook.
 *
 * Promises sits inside the hero's viewport, pinned to the bottom,
 * so the sections below start at the fold instead of one bar lower.
 */

import styled from '@emotion/styled'
import TopBar from '../components/sections/TopBar'
import Navbar from '../components/sections/Navbar'
import Hero from '../components/sections/Hero'
import Promises from '../components/sections/Promises'
import Services from '../components/sections/Services'
import Industries from '../components/sections/Industries'
import Steps from '../components/sections/Steps'
import FieldNotes from '../components/sections/FieldNotes'
import Footer from '../components/sections/Footer'
import { useNewsletterForm } from '../hooks/useNewsletterForm'
import { useChromeHeight } from '../hooks/useChromeHeight'

const Page = styled.main`
  min-height: 100vh;
  background: var(--paper);
`

const Opening = styled.div`
  display: flex;
  flex-direction: column;
  /* Fits in one viewport: 100dvh minus the TopBar + Navbar above.
     --chrome is set inline from useChromeHeight. */
  height: calc(100dvh - var(--chrome, 145px));

  @media (max-width: 980px) {
    /* Stacked layout can outgrow a viewport — fall back to
       min-height so the promises bar still sits inside the
       first screen but the content can keep growing. */
    min-height: calc(100dvh - var(--chrome, 145px));
  }
`

export default function Home() {
  const newsletter = useNewsletterForm()
  const chrome = useChromeHeight()

  return (
    <Page>
      <TopBar />
      <Navbar />
      <Opening style={{ '--chrome': `${chrome}px` }}>
        <Hero />
        <Promises />
      </Opening>
      <Services />
      <Industries />
      <Steps />
      <div id="newsletter">
        <FieldNotes
          email={newsletter.email}
          onChange={newsletter.handleChange}
          onSubmit={newsletter.handleSubmit}
          submitting={newsletter.submitting}
          status={newsletter.status}
        />
      </div>
      <Footer />
    </Page>
  )
}
