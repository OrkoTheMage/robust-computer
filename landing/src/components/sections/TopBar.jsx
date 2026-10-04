/**
 * TopBar
 *
 * Slim announcement strip above the navbar. On home, the first
 * cell carries a random software-dev tagline picked from
 * `data/jokes.js` at mount. The "reply within one business day"
 * promise stays static on every page.
 */

import { useState } from 'react'
import styled from '@emotion/styled'
import { jokes } from '../../data/jokes'
import { Zer0Text } from '../ui'

const pickJoke = () => jokes[Math.floor(Math.random() * jokes.length)]

const Bar = styled.div`
  background: #000;
  color: var(--paper);
  display: flex;
  justify-content: center;
  gap: 18px;
  align-items: center;
  padding: 9px 16px;
  font-family: var(--mono);
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.04em;
  text-align: center;
  flex-wrap: wrap;

  @media (max-width: 760px) {
    font-size: 11px;
    gap: 10px;
  }
`

const Dot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--paper);
  display: block;
  flex: none;
`

const TopBar = () => {
  // Picked once per mount. SSR-safe: the lazy initializer runs
  // on the client only, so Math.random is fine.
  const [joke] = useState(pickJoke)

  return (
    <Bar data-chrome="top">
      <span><Zer0Text>{`Now with — ${joke}`}</Zer0Text></span>
      <Dot />
      <span><Zer0Text>Reply within one business day</Zer0Text></span>
    </Bar>
  )
}

export default TopBar
