import styled from '@emotion/styled'
import { colors } from '../../../styles/colors'

/**
 * AerynPreview
 *
 * The fallback body for the Aeryn portfolio preview on the
 * About page. Used when the `developerPreviews[i].image`
 * asset is missing or hasn't loaded — the preview window
 * still shows a coherent mock of Aeryn's portfolio landing
 * so the page never renders an empty PreviewBody.
 *
 * The hex values here are the *other* site's chrome, not
 * the Robust Computer palette. They match the colors used
 * by the `image` screenshot (when present) so the JSX
 * fallback and the screenshot look identical. They stay
 * here instead of in `styles/colors.js` on purpose — see
 * `data/developerPreviews.js` for the same reasoning.
 */

const Blurb = styled.p`
  opacity: 0.6;
  max-width: 300px;
  font-size: 13px;
  margin: 0 0 14px;
`

const Pill = styled.span`
  display: inline-block;
  background: #3b6cff;
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

export const AerynPreview = () => (
  <>
    <h4>Full-stack, front to back.</h4>
    <Blurb>React interfaces and the services behind them.</Blurb>
    <Pill>View projects</Pill>
    <Tiles>
      <Tile $bg="linear-gradient(135deg, #3b6cff, #7a4dff)" />
      <Tile $bg="#1b1f27" $border="1px solid #2a2f3a" />
      <Tile $bg="#1b1f27" $border="1px solid #2a2f3a" />
    </Tiles>
  </>
)
