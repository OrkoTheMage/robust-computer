import styled from '@emotion/styled'

/**
 * Logo
 *
 * Renders the appropriate SVG asset for a given slot:
 *   - "icon"   → square mascot icon, used in nav + favicon
 *   - "badge"  → round badge, used in hero & page headers
 *   - "avatar" → square headshot, dev cards
 *
 * Pass `src` to override the variant's default src. Used by
 * `usePageIcon`, which feeds the navbar's per-route icon —
 * the navbar stays variant-agnostic and the route → icon
 * mapping lives entirely in the hook.
 *
 * Pass `alt` to override the variant's default alt.
 *
 * Sizes are controlled by the consumer — pass `height` (the SVG is
 * viewBox-driven so width auto-scales).
 */

const Img = styled.img`
  display: block;
  width: auto;
  height: ${(p) => p.h || 44}px;
  /* Every icon in /icons/ is a 512×512 SVG (square), so the
     rendered image is always h × h. Reserving the space with
     aspect-ratio: 1 keeps the navbar layout stable across the
     icon swap instead of letting the <img> snap from a 0-width
     placeholder (no intrinsic width until the bytes land) to
     its natural width once the image decodes. */
  aspect-ratio: 1;
`

const variantToSrc = {
  icon: '/icons/icon.svg',
  icon404: '/icons/icon-var-404.svg',
  iconVarAngry: '/icons/icon-var-angry.svg',
  iconVarCrying: '/icons/icon-var-crying.svg',
  iconVarDead: '/icons/icon-var-dead.svg',
  iconVarHappy: '/icons/icon-var-happy.svg',
  iconVarPanicked: '/icons/icon-var-panicked.svg',
  iconVarUnamused: '/icons/icon-var-unamused.svg',
  iconVarUnsub: '/icons/icon-var-unsub.svg',
  badge: '/brand/badge.svg',
  badgeAlt: '/brand/badge-cut.svg',
  poster: '/brand/poster.svg',
  banner: '/brand/banner.svg',
  bannerAlt: '/brand/banner-cut.svg',
  banner2: '/brand/banner2.svg',
  banner2Alt: '/brand/banner2-cut.svg',
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

const Logo = ({ variant = 'icon', src, h, alt, ...rest }) => (
  <Img
    src={src ?? variantToSrc[variant]}
    alt={alt ?? variantToAlt[variant]}
    h={h}
    {...rest}
  />
)

export default Logo
