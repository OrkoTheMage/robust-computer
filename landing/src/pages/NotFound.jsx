/**
 * NotFound
 *
 * Fallback for unknown routes. Keeps the navbar + footer for
 * navigation context.
 */

import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import { Button } from '../components/ui'

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

  h1 {
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(64px, 10vw, 160px);
    line-height: 0.9;
    margin: 0 0 8px;
    text-transform: uppercase;
    color: #000;
  }

  p {
    font-size: 18px;
    max-width: 32em;
    margin: 0 0 24px;
  }
`

export default function NotFound() {
  return (
    <Page>
      <Navbar />
      <Inner>
        <h1>404</h1>
        <p>That page is not here. The link is old or the URL is wrong.</p>
        <Button as={Link} to="/">
          Back to home
        </Button>
      </Inner>
      <Footer />
    </Page>
  )
}
