/**
 * Footer
 *
 * Black footer with a four-column layout: brand+blurb, BUILD links,
 * STUDIO links, ELSEWHERE links. Bottom strip with the small
 * copyright / build line.
 */

import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import config from '../../config'
import { Logo } from '../ui'

const Foot = styled.footer`
  background: #000;
  color: var(--paper);
  padding: 56px 56px 30px;

  @media (max-width: 760px) {
    padding: 40px 24px 24px;
  }
`

const Cols = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 36px;
  border-bottom: 3px solid var(--paper);

  @media (max-width: 760px) {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
`

const Brand = styled.div`
  .w {
    height: 64px;
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
    gap: 6px;
  }
`

const Footer = () => (
  <Foot>
    <Cols>
      <Brand>
        <Logo variant="badge" h={64} className="w" alt={config.brand.name} />
        <p>Bespoke websites and software.</p>
        <p className="mono">{config.brand.contactEmail}</p>
      </Brand>
      <Col>
        <h4>Build</h4>
        <Link to="/contact">Landing pages</Link>
        <Link to="/contact">Web apps</Link>
        <Link to="/contact">SaaS platforms</Link>
        <Link to="/contact">Integrations</Link>
      </Col>
      <Col>
        <h4>Studio</h4>
        <Link to="/about">Work</Link>
        <Link to="/about">Meet the developers</Link>
        <Link to="/contact">Contact</Link>
        <a href="#newsletter">Field notes</a>
      </Col>
      <Col>
        <h4>Elsewhere</h4>
        <a href="#">GitHub</a>
        <a href="#">LinkedIn</a>
        <a href="#">RSS</a>
      </Col>
    </Cols>
    <Small>
      <span>{config.brand.name}</span>
      <span>BUILT BY HAND, TESTED BEF0RE LAUNCH</span>
    </Small>
  </Foot>
)

export default Footer
