/**
 * PageHeader
 *
 * Page-level header used on About + Contact. Big title, lead
 * paragraph, and a small badge on the right. Gold background.
 */

import styled from '@emotion/styled'
import { Logo } from '../ui'

const Wrap = styled.header`
  padding: 60px 56px 52px;
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 48px;
  align-items: center;
  border-bottom: 3px solid #000;
  background: var(--gold);
  color: #000;

  h1 {
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(48px, 6vw, 92px);
    line-height: 0.92;
    text-transform: uppercase;
    margin: 0 0 18px;
    letter-spacing: -0.015em;
  }

  p {
    margin: 0;
    max-width: 36em;
    font-size: 20px;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    padding: 40px 24px 36px;
    gap: 24px;

    img {
      width: 120px;
    }
  }
`

const PageHeader = ({ title, lead, badge = true }) => (
  <Wrap>
    <div>
      <h1>{title}</h1>
      <p>{lead}</p>
    </div>
    {badge && <Logo variant="badge" h={200} alt="Robust Computer badge" />}
  </Wrap>
)

export default PageHeader
