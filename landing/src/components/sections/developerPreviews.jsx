import styled from '@emotion/styled'
import { colors } from '../../styles/colors'

/**
 * developerPreviews
 *
 * Fake browser contents for the About page mockups. The hex
 * values are the other sites' chrome, not the Robust Computer
 * palette, so they stay here instead of colors.js.
 */

const fixture = {
  bg: '#0f1115',
  fg: '#eeeeee',
  accent: '#3b6cff',
  accentEnd: '#7a4dff',
  panel: '#1b1f27',
  line: '#2a2f3a',
}

const Blurb = styled.p`
  opacity: 0.6;
  max-width: 300px;
  font-size: 13px;
  margin: 0 0 14px;
`

const Pill = styled.span`
  display: inline-block;
  background: ${fixture.accent};
  color: ${colors.white};
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
`

const Tiles = styled.div`
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 22px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`

const Tile = styled.div`
  height: 72px;
  border-radius: 8px;
  background: ${(p) => p.$bg};
  border: ${(p) => p.$border || 0};
`

const AerynPreview = () => (
  <>
    <h4>Full-stack, front to back.</h4>
    <Blurb>React interfaces and the services behind them.</Blurb>
    <Pill>View projects</Pill>
    <Tiles>
      <Tile $bg={`linear-gradient(135deg, ${fixture.accent}, ${fixture.accentEnd})`} />
      <Tile $bg={fixture.panel} $border={`1px solid ${fixture.line}`} />
      <Tile $bg={fixture.panel} $border={`1px solid ${fixture.line}`} />
    </Tiles>
  </>
)

export const developerPreviews = [
  {
    domain: 'grue.sh',
    image: '/brand/aeryn-preview.png',
    bg: fixture.bg,
    fg: fixture.fg,
    font: 'sans',
    children: <AerynPreview />,
  },
]
