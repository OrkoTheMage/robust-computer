/**
 * Promises
 *
 * Single-row black band under the hero with the four "promises" —
 * the small set of working agreements with clients.
 */

import styled from '@emotion/styled'

const Bar = styled.div`
  background: #000;
  color: var(--paper);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 56px;
  font-family: var(--mono);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-wrap: wrap;
  gap: 14px;

  @media (max-width: 980px) {
    padding: 18px 24px;
    font-size: 12px;
    gap: 10px;
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

const Promises = () => (
  <Bar>
    <span>4+ YEARS BUILDING</span>
    <Dot />
    <span>SMALL TEAM, DIRECT ACCESS</span>
    <Dot />
    <span>FIXED SC0PE, CLEAR PRICING</span>
    <Dot />
    <span>SUPP0RT AFTER LAUNCH</span>
  </Bar>
)

export default Promises
