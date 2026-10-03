/**
 * CTABand
 *
 * Closing black band with the "Work with the team" headline and a
 * gold CTA button. Reused on the about page.
 */

import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import { Button } from '../ui'

const Band = styled.section`
  background: #000;
  color: var(--paper);
  padding: 64px 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;

  h2 {
    color: var(--paper);
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(36px, 4vw, 60px);
    line-height: 1;
    margin: 0;
    text-transform: uppercase;
  }

  p {
    margin: 12px 0 0;
    font-size: 18px;
    max-width: 28em;
  }

  @media (max-width: 980px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 48px 24px;
  }
`

const CTABand = () => (
  <Band>
    <div>
      <h2>Work with the team</h2>
      <p>
        Tell us what you are building and who it is for. We will reply within
        one business day.
      </p>
    </div>
    <Button as={Link} to="/contact" variant="gold">
      Start a pr0ject
    </Button>
  </Band>
)

export default CTABand
