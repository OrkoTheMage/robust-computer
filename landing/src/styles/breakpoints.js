/**
 * landing/src/styles/breakpoints.js
 *
 * Single source of truth for every media-query breakpoint.
 *
 * Two layout tiers across the app:
 *   - mobile  — phones (≤ 760px)
 *   - default — everything else (tablet, desktop, …)
 *
 * The Hero is the only surface with its own breakpoints —
 *   - stacks at ≤ 1575px width OR
 *   - stacks at ≤ 1215px height
 * (whichever side gives out first wins, because the 960px
 *  art starts to look cramped when the row gets tight).
 *
 * The Navbar collapses into a hamburger at ≤ 1200px. Inline
 * page links stay visible above that — at narrower widths
 * the row can't fit brand + links + CTA without crowding,
 * so the nav switches to a single hamburger button.
 *
 * Use the pre-built media-query strings in styled-components:
 *
 *   const Foo = styled.div`
 *     ${mobile} {
 *       padding: 24px;
 *     }
 *   `
 *
 * `fromMobile` is the inverse (≥ 761px) — use it when it's
 * cleaner to declare a desktop default and override on mobile.
 */

export const BP_MOBILE = '760px'
export const BP_MOBILE_PLUS = '761px'

export const BP_HERO_STACK_W = '1575px'
export const BP_HERO_STACK_H = '1215px'

export const BP_NAV_HAMBURGER = '1200px'
export const BP_NAV_HAMBURGER_PLUS = '1201px'

export const mobile = `@media (max-width: ${BP_MOBILE})`
export const fromMobile = `@media (min-width: ${BP_MOBILE_PLUS})`

export const heroStack = `@media (max-width: ${BP_HERO_STACK_W}), (max-height: ${BP_HERO_STACK_H})`

export const navHamburger = `@media (max-width: ${BP_NAV_HAMBURGER})`
export const fromNavHamburger = `@media (min-width: ${BP_NAV_HAMBURGER_PLUS})`