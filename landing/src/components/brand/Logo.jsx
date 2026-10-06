import styled from '@emotion/styled'

/**
 * Logo
 *
 * Renders the appropriate SVG asset for a given slot:
 *   - "icon"   → square mascot icon, used in nav + favicon
 *   - "badge"  → round badge, used in hero & page headers
 *   - "avatar" → square headshot, dev cards
 *
 * Sizes are controlled by the consumer — pass `height` (the SVG is
 * viewBox-driven so width auto-scales).
 */

const Img = styled.img`
  display: block;
  width: auto;
  height: ${(p) => p.h || 44}px;
`

const variantToSrc = {
  icon: '/icon.svg',
  icon404: '/icon-var-404.svg',
  iconVarAngry: '/icon-var-angry.svg',
  iconVarCrying: '/icon-var-crying.svg',
  iconVarDead: '/icon-var-dead.svg',
  iconVarHappy: '/icon-var-happy.svg',
  iconVarPanicked: '/icon-var-panicked.svg',
  iconVarUnamused: '/icon-var-unamused.svg',
  iconVarUnsub: '/icon-var-unsub.svg',
  badge: '/badge.svg',
  badgeAlt: '/badge-cut.svg',
  poster: '/poster.svg',
  banner: '/banner.svg',
  bannerAlt: '/banner-cut.svg',
  banner2: '/banner2.svg',
  banner2Alt: '/banner2-cut.svg',
}

const variantToAlt = {
  icon: 'Robust Computer',
  bannerAlt: 'Robust Computer',
  icon404: 'Page not found',
  iconVarAngry: 'developer (angry)',
  iconVarCrying: 'developer (crying)',
  iconVarDead: 'developer (dead inside)',
  iconVarHappy: 'developer (happy)',
  iconVarPanicked: 'developer (panicked)',
  iconVarUnamused: 'developer (unamused)',
  iconVarUnsub: 'Unsubscribed',
  badge: 'Robust Computer badge',
  badgeAlt: 'Robust Computer badge',
  poster: 'Robust Computer',
  banner: 'Robust Computer',
  banner2: 'Robust Computer',
  banner2Alt: 'Robust Computer',
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
