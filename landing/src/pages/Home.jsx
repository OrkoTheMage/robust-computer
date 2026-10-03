/**
 * Home page
 *
 * Composes the public home route: TopBar + Navbar + Hero + Promises
 * + Services + Industries + Work + Steps + FieldNotes + Footer.
 * No state here — the FieldNotes section gets its bindings from
 * the page-local `useNewsletterForm` hook.
 */

import styled from '@emotion/styled'
import TopBar from '../components/sections/TopBar'
import Navbar from '../components/sections/Navbar'
import Hero from '../components/sections/Hero'
import Promises from '../components/sections/Promises'
import Services from '../components/sections/Services'
import Industries from '../components/sections/Industries'
import Work from '../components/sections/Work'
import Steps from '../components/sections/Steps'
import FieldNotes from '../components/sections/FieldNotes'
import Footer from '../components/sections/Footer'
import { useNewsletterForm } from '../hooks/useNewsletterForm'

const Page = styled.main`
  min-height: 100vh;
  background: var(--paper);
`

export default function Home() {
  const newsletter = useNewsletterForm()

  return (
    <Page>
      <TopBar />
      <Navbar />
      <Hero />
      <Promises />
      <Services />
      <Industries />
      <Work />
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
