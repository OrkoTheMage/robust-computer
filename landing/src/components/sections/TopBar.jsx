import { colors } from '../../styles/colors'
import styled from '@emotion/styled'
import { Zer0Text } from '../brand'
import { useTopBarJoke } from '../../hooks/useTopBarJoke'
import { useLocale } from '../../context/LocaleContext'

/**
 * TopBar
 *
 * Slim announcement strip above the navbar. On home, the first
 * cell carries a random software-dev tagline picked from
 * `data/jokes.js` at mount.
 */

const Bar = styled.div`
  background: ${colors.ink};
  color: ${colors.paper};
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
  background: ${colors.paper};
  display: block;
  flex: none;
`

const TopBar = () => {
  const joke = useTopBarJoke()
  const { topBar } = useLocale()

  return (
    <Bar data-chrome="top">
      <span><Zer0Text>{`${topBar.nowWith} ${joke}`}</Zer0Text></span>
      <Dot />
      <span><Zer0Text>{topBar.replies}</Zer0Text></span>
    </Bar>
  )
}

export default TopBar
