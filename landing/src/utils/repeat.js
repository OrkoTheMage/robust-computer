/**
 * repeat
 *
 * Flattens `copies` clones of `items`. Used by the promises
 * marquee so the track is wider than the viewport at t=0.
 */

export const repeat = (items, copies) =>
  Array.from({ length: copies }, () => items).flat()
