/**
 * Button
 *
 * Three styles: solid (black), alt (outline), gold (accent).
 * Each renders a `<button>` by default; pass `as="a"` and `href` to
 * render an anchor styled the same way. Boxes are kept square at
 * 3px borders to match the mockup's neo-brutalist look.
 *
 * Interaction:
 *   hover  → lift (shadow grows, element nudges up-left)
 *   active → press (shadow shrinks, element nudges down-right)
 *
 * Hover is suppressed when the button is disabled.
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
  transition: transform 80ms ease, box-shadow 80ms ease;
  user-select: none;
`

const solid = `
  background: #000;
  color: var(--paper);
  box-shadow: 6px 6px 0 var(--gold);

  &:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 var(--gold);
  }
  &:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 3px 3px 0 var(--gold);
  }
`

const alt = `
  background: transparent;
  color: #000;
  box-shadow: 0 0 0 0 transparent;
  transition: background 180ms cubic-bezier(0.22, 1, 0.36, 1),
              color 180ms cubic-bezier(0.22, 1, 0.36, 1);

  &:hover:not(:disabled) {
    background: #000;
    color: var(--paper);
  }
  &:active:not(:disabled) {
    transform: translate(2px, 2px);
  }
`

const gold = `
  background: var(--gold);
  color: #000;
  box-shadow: 6px 6px 0 var(--paper);

  &:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 var(--paper);
  }
  &:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 3px 3px 0 var(--paper);
  }
`

const Button = styled.button`
  ${base}
  ${(p) => (p.variant === 'alt' ? alt : p.variant === 'gold' ? gold : solid)}
  ${(p) =>
    p.disabled &&
    `
    cursor: not-allowed;
    opacity: 0.55;
  `}
`

export default Button
