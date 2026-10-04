/**
 * NotFound
 *
 * Fallback for unknown routes. Keeps the navbar + footer for
 * navigation context. The 404 illustration (`icon-404.svg`)
 * carries the visual; the headline underneath is plain copy.
 */

import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import { Button, Logo, Zer0Text } from '../components/ui'

const Page = styled.main`
  min-height: 100vh;
  background: var(--paper);
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
  filter: drop-shadow(8px 8px 0 #000);
`

const Headline = styled.h1`
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(40px, 6vw, 64px);
  line-height: 1;
  margin: 0;
  text-transform: uppercase;
  color: #000;
  letter-spacing: -0.005em;
`

const Lede = styled.p`
  font-size: 18px;
  max-width: 32em;
  margin: 0;
  color: #000;
`

export default function NotFound() {
  return (
    <Page>
      <Navbar />
      <Inner>
        <Illustration variant="icon404" alt="Page not found" />
        <Headline><Zer0Text>Page not found</Zer0Text></Headline>
        <Lede>That page is not here. The link is old or the URL is wrong.</Lede>
        <Button as={Link} to="/">
          <Zer0Text>Back to home</Zer0Text>
        </Button>
      </Inner>
      <Footer />
    </Page>
  )
}
