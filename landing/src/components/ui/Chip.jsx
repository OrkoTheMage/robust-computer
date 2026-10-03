/**
 * Chip
 *
 * Tag-style pill used in industries, developer skill lists, work cards.
 * `on` flips the color (selected state in the contact form).
 */

import styled from '@emotion/styled'

const Chip = styled.span`
  display: inline-block;
  border: 3px solid ${(p) => (p.onInk ? 'var(--paper)' : '#000')};
  background: ${(p) => (p.on ? '#000' : 'transparent')};
  color: ${(p) => {
    if (p.on) return 'var(--paper)'
    if (p.onInk) return 'var(--paper)'
    return '#000'
  }};
  font-family: var(--mono);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.03em;
  padding: 7px 13px;
  text-transform: uppercase;
`

export default Chip
