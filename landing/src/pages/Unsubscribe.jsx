/**
 * Unsubscribe
 *
 * /unsubscribe — landing target for the unsubscribe link in the
 * "Welcome to Field Notes" confirmation email. The link already
 * includes `?email=…`; the page reads it from the query string
 * and fires `POST /api/unsubscribe` via the useUnsubscribe hook.
 *
 * Layout mirrors NotFound: a full-bleed centered column with the
 * unsubscribe icon on top, the headline underneath, then the
 * state-specific lede, and a "Back to home" button on every
 * terminal state. The icon carries the visual identity; the
 * headline and lede change per state.
 *
 * `icon-var-unsub.svg` is a circular badge like the 404 mascot,
 * so no drop-shadow is applied (the same reasoning as the
 * NotFound illustration — see the comment there).
 */

import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import { colors } from '../styles/colors'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import { Button, Logo, Zer0Text } from '../components/ui'
import { SEO } from '../components/seo'
import { useUnsubscribe } from '../hooks/useUnsubscribe'

const Page = styled.main`
  min-height: 100vh;
  background: ${colors.paper};
  display: flex;
  flex-direction: column;
`

const Inner = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  gap: 24px;
`

const Illustration = styled(Logo)`
  width: clamp(180px, 28vw, 280px);
  height: auto;
`

const Headline = styled.h1`
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(40px, 6vw, 64px);
  line-height: 1;
  margin: 0;
  text-transform: uppercase;
  color: ${colors.ink};
  letter-spacing: -0.005em;
`

const Lede = styled.p`
  font-size: 18px;
  max-width: 32em;
  margin: 0;
  color: ${colors.ink};
`

const Unsubscribe = () => {
  const { email, status, errorMessage } = useUnsubscribe()

  // One render path per status — same shell, different copy.
  // Loading drops the lede + button (transient state); the
  // three terminal states all render icon + headline + lede +
  // back-to-home button so the page ends consistently.

  let headline = 'Unsubscribing…'
  let lede = null
  let showHome = false

  if (status === 'success') {
    headline = "You're off the list"
    lede = (
      <>
        <strong>{email}</strong> will no longer receive Field Notes.
        Changed your mind? You can resubscribe any time from the home page.
      </>
    )
    showHome = true
  } else if (status === 'error') {
    headline = "Couldn't unsubscribe"
    lede = (
      <>
        {errorMessage ||
          'Something went wrong on our end. Please try again in a moment.'}
        {email && (
          <>
            {' '}
            Trying to unsubscribe <strong>{email}</strong>.
          </>
        )}
      </>
    )
    showHome = true
  } else if (status === 'idle') {
    headline = 'This link is broken'
    lede =
      'The unsubscribe link is missing the email address. Open the most recent Field Notes email and use the link at the bottom of that message.'
    showHome = true
  }

  return (
    <Page>
      <SEO
        title="Unsubscribe"
        description="Unsubscribe from Field Notes — the short-issue newsletter from Robust Computer."
        path="/unsubscribe"
      />
      <Navbar />
      <Inner>
        <Illustration variant="iconVarUnsub" />
        <Headline>
          <Zer0Text>{headline}</Zer0Text>
        </Headline>
        {lede && <Lede>{lede}</Lede>}
        {showHome && (
          <Button as={Link} to="/">
            {/* Non-breaking spaces — same fix as NotFound. The
                button is a flex container and was collapsing the
                regular spaces between "to" and "home" once the
                text was zero'd, producing "BACK TOH0ME". */}
            <Zer0Text>{'Back\u00A0to\u00A0home'}</Zer0Text>
          </Button>
        )}
      </Inner>
      <Footer />
    </Page>
  )
}

export default Unsubscribe
