/**
 * Footer
 *
 * Black footer with a four-column layout: brand+blurb, SITE pages,
 * CONNECT (direct engagement: GitHub + email), and ELSEWHERE
 * (passive-follow socials). Bottom strip with the small copyright
 * / build line.
 */

import styled from '@emotion/styled'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Users,
  Send,
  Rss,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Mail,
} from 'lucide-react'
import config from '../../config'
import { Logo, Zer0Text } from '../ui'

const Foot = styled.footer`
  background: #000;
  color: var(--paper);
  padding: 56px 56px 30px;
  padding-inline: max(56px, calc((100% - var(--page)) / 2 + 56px));

  @media (max-width: 760px) {
    padding: 40px 24px 24px;
  }
`

const Cols = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
  gap: 40px;
  padding-bottom: 24px;
  border-bottom: 3px solid var(--paper);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 32px;
    justify-items: center;
    text-align: center;
  }
`

const Brand = styled.div`
  .w {
    height: 160px;
    width: auto;
    margin-bottom: 14px;
  }

  p {
    margin: 0 0 6px;
    font-size: 17px;
  }

  .mono {
    font-family: var(--mono);
    font-size: 15px;
  }

  @media (max-width: 760px) {
    display: flex;
    flex-direction: column;
    align-items: center;

    .w {
      margin-inline: auto;
    }
  }
`

const Col = styled.div`
  h4 {
    font-family: var(--mono);
    font-weight: 700;
    margin: 0 0 10px;
    font-size: 14px;
    letter-spacing: 0.05em;
    color: var(--gold);
    text-transform: uppercase;
  }

  a,
  p {
    display: block;
    margin: 0 0 6px;
    font-size: 17px;
    text-decoration: none;
    color: var(--paper);
  }

  /* Links get a gold underline + gold text on hover (and on
     keyboard focus, so the effect is reachable). The 3px
     transparent underline is always present so the link's
     box height doesn't shift on hover.

     width: fit-content is the key bit: the link is still
     display: block (so each one stays on its own line) but
     the box is only as wide as the text — otherwise the
     border-bottom would run the full column width.

     display: flex + align-items: center lays the icon
     and the label out side-by-side. The icon gets flex: none
     so it doesn't get squished if the link is narrow. */
  a {
    display: flex;
    align-items: center;
    gap: 10px;
    width: fit-content;
    max-width: 100%;
    border-bottom: 3px solid transparent;
    padding-bottom: 1px;
    transition: color 180ms cubic-bezier(0.22, 1, 0.36, 1),
                border-color 180ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  a svg {
    flex: none;
  }

  a:hover,
  a:focus-visible {
    color: var(--gold);
    border-bottom-color: var(--gold);
  }

  @media (max-width: 760px) {
    display: flex;
    flex-direction: column;
    align-items: center;

    h4 {
      text-align: center;
    }

    a {
      margin-inline: auto;
    }
  }
`

const Small = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  font-size: 13px;
  font-family: var(--mono);
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
  }
`

// Legal row — sits between the four-column grid and the brand
// strip. Not a column because legal links don't fit a services
// hierarchy; they live in the fine print. The Cols's bottom
// border is the divider above the legal links; we don't add
// another border here (that would double up).
const Legal = styled.nav`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0 0;
  font-family: var(--mono);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  span.sep {
    opacity: 0.55;
  }

  a {
    color: var(--paper);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    padding-bottom: 1px;
    transition: color 180ms cubic-bezier(0.22, 1, 0.36, 1),
                border-color 180ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  a:hover,
  a:focus-visible {
    color: var(--gold);
    border-bottom-color: var(--gold);
  }

  @media (max-width: 760px) {
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 8px;
  }
`

const Footer = () => {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  // If we're already on home, smooth-scroll to the top instead of
  // doing a no-op navigate. The <Link> still gets a `to="/"` so
  // SSR and the no-JS fallback both land on the home page.
  const onHomeClick = (e) => {
    if (isHome) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <Foot>
      <Cols>
        <Brand>
          <Logo variant="banner2Cut" h={160} className="w" alt={config.brand.name} />
          <p>Bespoke websites and software.</p>
          <p className="mono">{config.brand.email}</p>
        </Brand>
        <Col>
          <h4><Zer0Text>Site</Zer0Text></h4>
          <Link to="/" onClick={onHomeClick}>
            <Home size={18} strokeWidth={2.4} aria-hidden="true" />
            Home
          </Link>
        <Link to="/about">
          <Users size={18} strokeWidth={2.4} aria-hidden="true" />
          About
        </Link>
        <Link to="/contact">
          <Send size={18} strokeWidth={2.4} aria-hidden="true" />
          Contact
        </Link>
        <a href="/rss.xml">
          <Rss size={18} strokeWidth={2.4} aria-hidden="true" />
          News (RSS)
        </a>
      </Col>
      <Col>
        <h4><Zer0Text>Connect</Zer0Text></h4>
        <a href="https://github.com/robust-computer" target="_blank" rel="noopener noreferrer">
          <Github size={18} strokeWidth={2.4} aria-hidden="true" />
          GitHub
        </a>
        <a href={`mailto:${config.brand.email}`}>
          <Mail size={18} strokeWidth={2.4} aria-hidden="true" />
          Email
        </a>
      </Col>
      <Col>
        <h4><Zer0Text>Elsewhere</Zer0Text></h4>
        <a href="https://linkedin.com/company/robust-computer" target="_blank" rel="noopener noreferrer">
          <Linkedin size={18} strokeWidth={2.4} aria-hidden="true" />
          LinkedIn
        </a>
        <a href="https://www.facebook.com/profile.php?id=61594902219428" target="_blank" rel="noopener noreferrer">
          <Facebook size={18} strokeWidth={2.4} aria-hidden="true" />
          Facebook
        </a>
        <a href="https://www.instagram.com/robust.computer/" target="_blank" rel="noopener noreferrer">
          <Instagram size={18} strokeWidth={2.4} aria-hidden="true" />
          Instagram
        </a>
        <a href="https://x.com/Robust_Computer" target="_blank" rel="noopener noreferrer">
          <Twitter size={18} strokeWidth={2.4} aria-hidden="true" />
          X
        </a>
      </Col>
    </Cols>
    <Legal aria-label="Legal">
      <Link to="/privacy">Privacy Policy</Link>
      <span className="sep" aria-hidden="true">|</span>
      <Link to="/terms">Terms of Service</Link>
    </Legal>
    <Small>
      <span>{config.brand.name}</span>
      <span><Zer0Text>Built by hand, tested before launch</Zer0Text></span>
    </Small>
  </Foot>
  )
}

export default Footer
