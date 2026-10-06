import { keyframes } from '@emotion/react'

/**
 * landing/src/styles/animations.js
 *
 * Shared CSS keyframes. Emotion's `keyframes()` factory
 * returns a class name so the same animation can be used from
 * more than one styled component. Call sites disable the
 * animation when the user prefers reduced motion.
 */

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
