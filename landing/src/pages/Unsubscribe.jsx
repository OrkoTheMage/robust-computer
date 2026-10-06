import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import { colors } from '../styles/colors'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import { Button } from '../components/ui'
import { Logo, Zer0Text } from '../components/brand'
import { SEO } from '../components/seo'
import { useUnsubscribe } from '../hooks/useUnsubscribe'
import { unsubscribePage } from '../data/copy'

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
  const { headline, lede, showHome } = useUnsubscribe()

  return (
    <Page>
      <SEO
        title={unsubscribePage.seoTitle}
        description={unsubscribePage.seoDescription}
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
            <Zer0Text>{unsubscribePage.back.replace(/ /g, '\u00A0')}</Zer0Text>
          </Button>
        )}
      </Inner>
      <Footer />
    </Page>
  )
}

export default Unsubscribe
