import styled from '@emotion/styled'
import { colors } from '../../styles/colors'
import { Logo, Zer0Text } from '../brand'

/**
 * PageHeader
 *
 * Page-level header used on About, Contact, and the legal pages.
 * Big title, lead paragraph, and a piece of brand artwork on the
 * right. Gold background. The artwork is desktop-only — on small
 * screens it crowds the title and the cut artwork doesn't scale
 * cleanly.
 *
 * `imageVariant` is forwarded to the `Logo` component, which
 * accepts any of the brand assets (badge, badgeAlt, bannerAlt,
 * poster, …). Most pages use the round badge ("badgeAlt") but
 * the Field Notes post page uses the square mascot ("bannerAlt").
 *
 * `eyebrow` is an optional second header above the main title,
 * used by the Field Notes post page to stack a "Field Notes"
 * section label above the per-post title. It renders as an <h2>
 * styled identically to the <h1> so the two read as a paired
 * unit rather than an eyebrow + title hierarchy. Semantically
 * the <h2> is the section, the <h1> is the page.
 *
 * `kicker` is an optional small line rendered between the
 * eyebrow and the title. Used by the Field Notes post page to
 * show the "Issue 000" sort identifier under the "Field notes"
 * section label. Styled as a small black-on-paper mono tag so
 * it reads as a metadata chip, not another header.
 */

const Wrap = styled.header`
  padding: 60px 56px 52px;
  padding-inline: max(56px, calc((100% - var(--page)) / 2 + 56px));
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 48px;
  align-items: center;
  border-bottom: 3px solid ${colors.ink};
  background: ${colors.gold};
  color: ${colors.ink};

  h1,
  h2 {
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(48px, 6vw, 92px);
    line-height: 0.92;
    text-transform: uppercase;
    letter-spacing: -0.015em;
  }

  h2 {
    /* Tight gap to the kicker/h1 below so the eyebrow + kicker
       + title read as a paired unit. */
    margin: 0 0 6px;
  }

  .kicker {
    display: inline-block;
    margin: 0 0 8px;
    padding: 4px 10px;
    background: ${colors.ink};
    color: ${colors.paper};
    font-family: var(--mono);
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0 0 18px;
  }

  p {
    margin: 0;
    max-width: 36em;
    font-size: 20px;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    padding: 40px 24px 36px;
    gap: 0;

    img {
      display: none;
    }
  }
`

const PageHeader = ({ title, lead, eyebrow, kicker, image = true, imageVariant = 'badge' }) => (
  <Wrap>
    <div>
      {eyebrow && <h2><Zer0Text>{eyebrow}</Zer0Text></h2>}
      {kicker && <span className="kicker">{kicker}</span>}
      {title && <h1><Zer0Text>{title}</Zer0Text></h1>}
      <p>{lead}</p>
    </div>
    {image && (
      <Logo variant={imageVariant} h={400} alt="Robust Computer" />
    )}
  </Wrap>
)

export default PageHeader
