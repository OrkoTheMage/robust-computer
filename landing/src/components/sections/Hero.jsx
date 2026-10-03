/**
 * Hero
 *
 * Home page opening. Headline, lead, two CTAs on the left; the
 * "worker with computer-monitor head" poster on the right with a
 * rotated "build log" ticket floating over it.
 */

import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import { Button, Logo } from '../ui'

const Wrap = styled.section`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 72px;
  padding: 64px 56px 72px;
  align-items: center;
  border-bottom: 3px solid #000;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    padding: 48px 24px 56px;
    gap: 40px;
  }
`

const Headline = styled.h1`
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(48px, 6.5vw, 96px);
  line-height: 0.92;
  margin: 0 0 26px;
  text-transform: uppercase;
  letter-spacing: -0.015em;
  color: #000;
`

const Lead = styled.p`
  font-size: 22px;
  max-width: 26em;
  margin: 0 0 34px;
  color: #000;
`

const CTAs = styled.div`
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
`

const Art = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 980px) {
    order: -1;
  }
`

const ArtImg = styled(Logo)`
  width: 100%;
  max-width: 480px;
  height: auto;
  filter: drop-shadow(8px 8px 0 #000);
`

const Ticket = styled.div`
  position: absolute;
  left: -40px;
  bottom: 16px;
  width: 318px;
  background: var(--ticket);
  border: 3px solid #000;
  box-shadow: 7px 7px 0 #000;
  padding: 14px 16px 16px;
  transform: rotate(-2.5deg);
  z-index: 2;

  @media (max-width: 980px) {
    left: 0;
    bottom: -30px;
    width: 280px;
  }
`

const TicketTag = styled.div`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.05em;
  display: flex;
  justify-content: space-between;
  border-bottom: 3px dashed #000;
  padding-bottom: 8px;
  margin-bottom: 10px;
  text-transform: uppercase;
`

const TicketBody = styled.pre`
  margin: 0;
  font-family: var(--mono);
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
  color: #000;
`

const TicketStamp = styled.span`
  margin-top: 10px;
  display: inline-block;
  background: #000;
  color: var(--paper);
  font-family: var(--mono);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.05em;
  padding: 3px 10px;
  text-transform: uppercase;
`

const Hero = () => (
  <Wrap>
    <div>
      <Headline>Custom software, built to last.</Headline>
      <Lead>
        Robust Computer is a small team of developers building bespoke
        websites and software. From a single landing page to a full SaaS
        platform, we design it, build it, and stay on after launch.
      </Lead>
      <CTAs>
        <Button as={Link} to="/contact">
          START A PR0JECT
        </Button>
        <Button as={Link} to="/about" variant="alt">
          MEET THE TEAM
        </Button>
      </CTAs>
    </div>
    <Art>
      <ArtImg variant="poster" alt="The Robust Computer mascot" />
      <Ticket>
        <TicketTag>
          <span>BUILD L0G</span>
          <span>RELEASE 1.0</span>
        </TicketTag>
        <TicketBody>
          $ npm run launch{'\n'}✓ design approved{'\n'}✓ 212 tests passing{'\n'}✓
          live in production
        </TicketBody>
        <TicketStamp>SHIPPED</TicketStamp>
      </Ticket>
    </Art>
  </Wrap>
)

export default Hero
