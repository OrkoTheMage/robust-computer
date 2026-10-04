/**
 * Logo
 *
 * Renders the appropriate SVG asset for a given slot:
 *   - "icon"   → square mascot icon, used in nav + favicon
 *   - "badge"  → round badge, used in hero & page headers
 *   - "wordmark" → brand wordmark
 *   - "avatar" → square headshot, dev cards
 *
 * Sizes are controlled by the consumer — pass `height` (the SVG is
 * viewBox-driven so width auto-scales).
 */

import styled from '@emotion/styled'

const Img = styled.img`
  display: block;
  width: auto;
  height: ${(p) => p.h || 44}px;
`

const variantToSrc = {
  icon: '/icon.svg',
  iconAlt: '/icon-alt.svg',
  icon404: '/icon-404.svg',
  iconVarAngry: '/icon-var-angry.svg',
  iconVarCrying: '/icon-var-crying.svg',
  iconVarDead: '/icon-var-dead.svg',
  iconVarHappy: '/icon-var-happy.svg',
  iconVarPanicked: '/icon-var-panicked.svg',
  iconVarUnamused: '/icon-var-unamused.svg',
  badge: '/badge.svg',
  badgeCut: '/badge-cut.svg',
  wordmark: '/wordmark.svg',
  poster: '/poster.svg',
  banner: '/banner.svg',
  banner2: '/banner2.svg',
  banner2Cut: '/banner2-cut.svg',
}

const variantToAlt = {
  icon: 'Robust Computer',
  iconAlt: 'Robust Computer',
  icon404: 'Page not found',
  iconVarAngry: 'Aeryn (angry)',
  iconVarCrying: 'developer (crying)',
  iconVarDead: 'developer (dead inside)',
  iconVarHappy: 'Aeryn (happy)',
  iconVarPanicked: 'developer (panicked)',
  iconVarUnamused: 'developer (unamused)',
  badge: 'Robust Computer badge',
  badgeCut: 'Robust Computer badge',
  wordmark: 'Robust Computer',
  poster: 'Robust Computer',
  banner: 'Robust Computer',
  banner2: 'Robust Computer',
  banner2Cut: 'Robust Computer',
}

const Logo = ({ variant = 'icon', h, alt, ...rest }) => (
  <Img
    src={variantToSrc[variant]}
    alt={alt ?? variantToAlt[variant]}
    h={h}
    {...rest}
  />
)

export default Logo
