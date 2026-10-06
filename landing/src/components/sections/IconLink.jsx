import styled from '@emotion/styled'
import { colors } from '../../styles/colors'

/**
 * IconLink
 *
 * Square nav icon used by the main bar, the mobile panel,
 * and the language control. Shared so those surfaces do not
 * drift.
 */

const IconLink = styled.a`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: 3px solid ${colors.ink};
  background: ${colors.paper};
  color: ${colors.ink};
  flex: none;
  text-decoration: none;
  transition: background 80ms ease, color 80ms ease;

  &:hover,
  &:active {
    background: ${colors.ink};
    color: ${colors.paper};
  }
  &[aria-expanded='true'] {
    background: ${colors.ink};
    color: ${colors.paper};
  }
  &:focus-visible {
    outline: 3px solid ${colors.goldDeep};
    outline-offset: 3px;
  }

  /* Custom hover tooltip. Reads data-tooltip on the element
     and renders a brand-styled label below the icon. Native
     title is removed in favor of this so the browser's
     default tooltip does not double up. */
  &::after {
    content: attr(data-tooltip);
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: ${colors.ink};
    color: ${colors.paper};
    font-family: var(--mono);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 5px 8px;
    border: 2px solid ${colors.ink};
    box-shadow: 3px 3px 0 ${colors.gold};
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 80ms ease;
    z-index: 50;
  }

  &:hover:not([aria-expanded='true'])::after,
  &:focus-visible:not([aria-expanded='true'])::after {
    opacity: 1;
  }
`

export default IconLink
