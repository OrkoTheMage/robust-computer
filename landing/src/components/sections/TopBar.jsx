/**
 * TopBar
 *
 * Slim announcement strip above the navbar. Repeats the "now booking"
 * message and the one-business-day reply promise.
 */

import styled from '@emotion/styled'

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

const TopBar = () => (
  <Bar>
    <span>N0W B00KING PR0JECTS F0R EARLY 2027</span>
    <Dot />
    <span>REPLY WITHIN 0NE BUSINESS DAY</span>
  </Bar>
)

export default TopBar
