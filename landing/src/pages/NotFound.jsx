/**
 * NotFound
 *
 * Fallback for unknown routes. Keeps the navbar + footer for
 * navigation context. The 404 illustration (`icon-var-404.svg`)
 * carries the visual; the headline underneath is plain copy.
 */

import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import { Link } from 'react-router-dom'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import { Button, Logo, Zer0Text } from '../components/ui'
import { SEO } from '../components/seo'
import { notFound } from '../data/copy'

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
  /* No drop-shadow here: the icon is a circular badge whose
     silhouette ring is already a solid black outline, so a
     hard-offset shadow filter duplicates the whole circle and
     only the bottom-right crescent of the duplicate is visible
     — reads as a stray "half-circle shadow." The Hero's ArtImg
     keeps its drop-shadow because it's rectangular. */
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

export default function NotFound() {
  return (
    <Page>
      <SEO
        title="Not found"
        description={notFound.lede}
        type="website"
      />
      <Navbar />
      <Inner>
        <Illustration variant="icon404" alt="Page not found" />
        <Headline><Zer0Text>{notFound.headline}</Zer0Text></Headline>
        <Lede>{notFound.lede}</Lede>
        <Button as={Link} to="/">
          <Zer0Text>{'Back\u00A0to\u00A0home'}</Zer0Text>
        </Button>
      </Inner>
      <Footer />
    </Page>
  )
}
