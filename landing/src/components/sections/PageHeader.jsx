/**
 * PageHeader
 *
 * Page-level header used on About, Contact, and the legal pages.
 * Big title, lead paragraph, and a badge on the right. Gold background.
 * The badge is desktop-only — on small screens it crowds the title
 * and the cut artwork doesn't scale cleanly.
 */

import styled from '@emotion/styled'
import { Logo, Zer0Text } from '../ui'

const Wrap = styled.header`
  padding: 60px 56px 52px;
  padding-inline: max(56px, calc((100% - var(--page)) / 2 + 56px));
  display: grid;
  grid-template-columns: 1fr 420px;
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
    gap: 0;

    img {
      display: none;
    }
  }
`

const PageHeader = ({ title, lead, badge = true, badgeVariant = 'badge' }) => (
  <Wrap>
    <div>
      <h1><Zer0Text>{title}</Zer0Text></h1>
      <p>{lead}</p>
    </div>
    {badge && (
      <Logo variant={badgeVariant} h={400} alt="Robust Computer badge" />
    )}
  </Wrap>
)

export default PageHeader
