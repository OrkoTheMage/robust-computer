import styled from '@emotion/styled'
import { colors } from '../../styles/colors'
import { Link } from 'react-router-dom'
import { Button } from '../ui'
import { Zer0Text } from '../brand'
import { useLocale } from '../../context/LocaleContext'

/**
 * CTABand
 *
 * Closing black band with the "Work with the team" headline and a
 * gold CTA button. Reused on the about page.
 */

const Band = styled.section`
  background: ${colors.ink};
  color: ${colors.paper};
  padding: 64px 56px;
  padding-inline: max(56px, calc((100% - var(--page)) / 2 + 56px));
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;

  h2 {
    color: ${colors.paper};
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(36px, 4vw, 60px);
    line-height: 1;
    margin: 0;
    text-transform: uppercase;
  }

  p {
    margin: 12px 0 0;
    font-size: 18px;
    max-width: 28em;
  }

  @media (max-width: 980px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 48px 24px;
  }
`

const CTABand = () => {
  const { ctaBand, heroChrome } = useLocale()
  return (
    <Band>
      <div>
        <h2><Zer0Text>{ctaBand.headline}</Zer0Text></h2>
        <p>{ctaBand.lead}</p>
      </div>
      <Button as={Link} to="/contact" variant="gold">
        <Zer0Text>{heroChrome.start}</Zer0Text>
      </Button>
    </Band>
  )
}

export default CTABand
