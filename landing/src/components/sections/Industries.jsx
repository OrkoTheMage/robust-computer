/**
 * Industries
 *
 * Black band with the headline on the left and a row of industry
 * "chip" pills on the right. Static — the chips are content, not
 * interactive filters (the user can always change them later).
 */

import styled from '@emotion/styled'
import { Container, Chip } from '../ui'

const Bar = styled.section`
  background: #000;
  color: var(--paper);
  padding: 44px 56px;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  align-items: center;

  h2 {
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(28px, 3vw, 44px);
    line-height: 1;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -0.005em;
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    padding: 32px 24px;
    gap: 20px;
  }
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const items = [
  'Finance',
  'Healthcare',
  'Retail',
  'Hospitality',
  'Education',
  'Logistics',
  'Non-profit',
  'Professional services',
]

const Industries = () => (
  <Bar>
    <h2>Built across industries</h2>
    <Chips>
      {items.map((label) => (
        <Chip key={label} onInk>
          {label}
        </Chip>
      ))}
    </Chips>
  </Bar>
)

export default Industries
