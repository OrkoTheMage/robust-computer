import styled from '@emotion/styled'
import { colors } from '../../styles/colors'

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

const base = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.04em;
  padding: 15px 24px;
  border: 3px solid ${colors.ink};
  text-decoration: none;
  cursor: pointer;
  text-align: center;
  line-height: 1;
  transition: transform 80ms ease, box-shadow 80ms ease;
  user-select: none;
`

const solid = `
  background: ${colors.ink};
  color: ${colors.paper};
  box-shadow: 6px 6px 0 ${colors.gold};

  &:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 ${colors.gold};
  }
  &:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 3px 3px 0 ${colors.gold};
  }
`

const alt = `
  background: transparent;
  color: ${colors.ink};
  box-shadow: 0 0 0 0 transparent;
  transition: background 180ms cubic-bezier(0.22, 1, 0.36, 1),
              color 180ms cubic-bezier(0.22, 1, 0.36, 1);

  &:hover:not(:disabled) {
    background: ${colors.ink};
    color: ${colors.paper};
  }
  &:active:not(:disabled) {
    transform: translate(2px, 2px);
  }
`

const gold = `
  background: ${colors.gold};
  color: ${colors.ink};
  box-shadow: 6px 6px 0 ${colors.paper};

  &:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 ${colors.paper};
  }
  &:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 3px 3px 0 ${colors.paper};
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
