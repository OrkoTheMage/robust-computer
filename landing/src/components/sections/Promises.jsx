/**
 * Promises
 *
 * Single-row black band pinned to the bottom of the hero viewport.
 * The list scrolls right continuously; the track is duplicated so
 * the loop is seamless.
 *
 * Why so many copies: the seamless-loop technique anchors the
 * visible content at t=0 to the right half of the track. With
 * only 2 copies (~880px) the right half is narrower than a
 * typical viewport, leaving a blank gap on the right when the
 * page first paints. 6 copies of 12 items = 72 in the track,
 * which fills any reasonable viewport at t=0 and keeps the
 * loop seam invisible at any scroll position.
 */

import styled from '@emotion/styled'
import { Fragment } from 'react'
import { Zer0Text } from '../ui'

const items = [
  '4+ years building',
  'small team, direct access',
  'fixed scope, clear pricing',
  'support after launch',
  'ship on the agreed date',
  'no surprise invoices',
  'real humans, not chatbots',
  'your code stays yours',
  'tested before it ships',
  'weekly demos, not surprises',
  'Full ownership after delivery',
  'Custom solutions'
]

// Six copies of 12 items = 72 in the track. Wide enough to fully
// fill a 4K viewport at t=0, narrow enough that the loop still
// takes a comfortable amount of time to traverse.
const COPIES = 6

const Bar = styled.div`
  background: #000;
  color: var(--paper);
  padding: 20px 0;
  overflow: hidden;
  position: relative;
  flex: none;
  font-family: var(--mono);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  @media (max-width: 980px) {
    font-size: 12px;
  }
`

// The track is intentionally much wider than the viewport (the
// duplication above). Translating from -50% to 0% scrolls the
// content rightward; when the loop wraps, the seam is invisible
// because the two halves of the track are identical.
//
// Duration scales with the number of unique items so the per-item
// scroll rate stays constant: 4s per item (12 items × 4s = 144s
// per sweep), which matches the rate when there were 4 items at
// 48s duration.
const Track = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
  width: max-content;
  padding-right: 28px;
  animation: marquee-lr 144s linear infinite;
  will-change: transform;

  @keyframes marquee-lr {
    from {
      transform: translateX(-50%);
    }
    to {
      transform: translateX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: none;
  }
`

const Dot = styled.b`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--paper);
  display: block;
  flex: none;
`

const Promises = () => {
  // Build COPIES copies of the items list, flattened.
  const repeated = Array.from({ length: COPIES }, () => items).flat()
  return (
    <Bar aria-label={items.join(' · ')}>
      <Track>
        {repeated.map((text, i) => (
          <Fragment key={i}>
            <span><Zer0Text>{text}</Zer0Text></span>
            {i < repeated.length - 1 ? <Dot aria-hidden="true" /> : null}
          </Fragment>
        ))}
      </Track>
    </Bar>
  )
}

export default Promises
