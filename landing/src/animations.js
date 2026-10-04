/**
 * landing/src/animations.js
 *
 * Shared CSS keyframes. Two flavors live here:
 *
 * 1. JavaScript `keyframes` objects (the default). Returned by
 *    emotion's `keyframes()` factory — interpolating one into a
 *    styled-component template gives you a generated class name
 *    that references the keyframes block. This is the recommended
 *    way to share animations between components, since the
 *    keyframes are defined once and Emotion deduplicates the
 *    output.
 *
 * 2. Plain CSS keyframes (only when needed). The `marqueeLrCss`
 *    string is the raw CSS — use it in a `css\`...\`` helper or
 *    inside a `Global` style when you need a `@keyframes` block
 *    that isn't owned by a single component.
 *
 * Both are `@media (prefers-reduced-motion: reduce)` aware at the
 * call site (the consumer is expected to disable the animation
 * when the user prefers reduced motion).
 */

import { keyframes } from '@emotion/react'

// Ticket comes up from below the art and settles into its
// tilted position. The base `transform: rotate(-2.5deg)` lives
// in BOTH the from and the to keyframes — a CSS animation on
// transform replaces the base transform while it runs, so
// leaving the rotation out of the keyframes would snap the
// ticket to 0° for the duration of the animation and then
// snap back.
//
// 80px of travel is enough to read as a deliberate arrival
// without dragging the ticket through the headline below it
// on mobile.
export const ticketIn = keyframes`
  from {
    transform: translateY(80px) rotate(-2.5deg);
    opacity: 0;
  }
  to {
    transform: translateY(0) rotate(-2.5deg);
    opacity: 1;
  }
`

// Horizontal marquee used by the promises bar. The track is
// duplicated (so the two halves line up) and translated from
// -50% to 0% to give a seamless loop.
export const marqueeLr = keyframes`
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
`
