/**
 * Button
 *
 * Three styles: solid (black), alt (outline), gold (accent).
 * Each renders a `<button>` by default; pass `as="a"` and `href` to
 * render an anchor styled the same way. Boxes are kept square at
 * 3px borders to match the mockup's neo-brutalist look.
 */

import styled from '@emotion/styled'

const base = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.04em;
  padding: 15px 24px;
  border: 3px solid #000;
  text-decoration: none;
  cursor: pointer;
  text-align: center;
  line-height: 1;
  transition: transform 80ms ease;
  user-select: none;

  &:active {
    transform: translate(3px, 3px);
  }
`

const solid = `
  background: #000;
  color: var(--paper);
  box-shadow: 6px 6px 0 var(--gold);
`

const alt = `
  background: transparent;
  color: #000;
  box-shadow: none;
`

const gold = `
  background: var(--gold);
  color: #000;
  box-shadow: 6px 6px 0 var(--paper);
`

const Button = styled.button`
  ${base}
  ${(p) => (p.variant === 'alt' ? alt : p.variant === 'gold' ? gold : solid)}
`

export default Button
