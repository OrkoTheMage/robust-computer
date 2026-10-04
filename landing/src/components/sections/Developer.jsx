/**
 * Developer
 *
 * One developer per section on the about page. Alternating layout
 * (props.reversed flips sides). Avatar, name, role, bio, stack,
 * a portfolio link button + two text links, and a portfolio preview
 * block. The preview is rendered as either a static screenshot
 * (`preview.image`) or a live iframe (`preview.url`); otherwise
 * the abstract placeholder content under `preview.children` is used.
 */

import styled from '@emotion/styled'
import { Button, Logo, Zer0Text } from '../ui'

const Wrap = styled.section`
  display: grid;
  grid-template-columns: ${(p) => (p.reversed ? '7fr 5fr' : '5fr 7fr')};
  gap: 56px;
  padding: 72px 56px;
  padding-inline: max(56px, calc((100% - var(--page)) / 2 + 56px));
  border-bottom: 3px solid #000;
  align-items: center;
  background: ${(p) => (p.reversed ? 'var(--ticket)' : 'transparent')};
  color: #000;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    padding: 48px 24px;
    gap: 28px;
  }
`

const Info = styled.div`
  ${(p) => (p.reversed ? 'order: 2;' : '')}

  @media (max-width: 980px) {
    order: 0 !important;
  }
`

const Id = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 18px;

  img {
    width: 104px;
    height: 104px;
    border: 3px solid #000;
    border-radius: 50%;
    background: var(--gold);
    padding: 4px;
    /* Mirror the avatar on every other (reversed) developer
       section, so the icon "faces" the direction the preview
       mockup is on. */
    transform: ${(p) => (p.reversed ? 'scaleX(-1)' : 'none')};
  }

  /* On phones, stack the avatar above the name so the name
     gets the full row width — otherwise long names like
     "PLACEHOLDER" wrap and drop their last letter onto a
     second line. Also shrink the avatar and tighten the gap. */
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;

    img {
      width: 64px;
      height: 64px;
      padding: 3px;
      /* Don't mirror the avatar on phones — the alternation is
         a desktop layout cue and inverting icons on a stacked
         column reads as "wrong" on touch. */
      transform: none;
    }
  }
`

const H2 = styled.h2`
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(36px, 4vw, 54px);
  line-height: 1;
  margin: 0;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  /* Drop the heading size on phones so the name doesn't
     dominate the row even after the avatar stacks above. */
  @media (max-width: 600px) {
    font-size: 28px;
  }
`

const Role = styled.div`
  font-family: var(--mono);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.04em;
  margin-top: 6px;
  text-transform: uppercase;
`

const Body = styled.p`
  margin: 0 0 18px;
  max-width: 30em;
  font-size: 18px;
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
`

const Links = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px 26px;
  align-items: center;

  /* On phones, stack the "Visit portfolio" button on its own
     line and put GitHub + LinkedIn together on a row below. */
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
`

// Row that holds the secondary text links (GitHub, LinkedIn).
// On desktop this sits inline next to the "Visit portfolio"
// button via the parent flex; on mobile the parent collapses
// to a column and this row stays a single horizontal line.
const TextLinks = styled.div`
  display: flex;
  gap: 26px;
  align-items: center;
  flex-wrap: wrap;
`

const TextLink = styled.a`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-decoration: underline;
  text-underline-offset: 5px;
  text-decoration-thickness: 3px;
  text-transform: uppercase;
`

const PreviewWrap = styled.div`
  ${(p) => (p.reversed ? 'order: 1;' : '')}

  @media (max-width: 980px) {
    order: 0 !important;
  }
`

const Preview = styled.div`
  border: 4px solid #000;
  background: #000;
  box-shadow: 10px 10px 0 var(--gold);
`

const PreviewBar = styled.div`
  height: 34px;
  background: var(--paper);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-bottom: 4px solid #000;
  /* Float above the PreviewImage so the image can extend up under
     the Bar (its top edge sits at the very top of the preview). */
  position: relative;
  z-index: 2;

  i {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2.5px solid #000;
    display: block;
  }

  span {
    margin-left: 10px;
    font-family: var(--mono);
    font-weight: 600;
    font-size: 12px;
    border: 2.5px solid #000;
    padding: 0 10px;
    background: #fff8;
  }
`

const Cap = styled.div`
  background: #000;
  color: var(--paper);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  padding: 7px 12px;
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
`

const PreviewBody = styled.div`
  background: ${(p) => p.bg};
  color: ${(p) => p.fg};
  font-family: ${(p) => (p.font === 'serif' ? 'Georgia, serif' : 'system-ui, Arial, sans-serif')};
  height: 340px;
  position: relative;
  overflow: hidden;
  padding: 22px;
  font-size: 13px;

  h4 {
    font-size: 40px;
    line-height: 1;
    letter-spacing: -0.02em;
    font-weight: 800;
    margin: 4px 0 8px;
    max-width: 320px;
  }
`

// Static screenshot preview. Extends UP by 34px (the height of
// PreviewBar) so its top edge sits at the very top of the preview
// window, behind the Bar. The Bar floats on top via z-index.
// object-fit: cover crops to fill, with object-position: top so
// the page header/nav is always visible.
const PreviewImage = styled.img`
  position: absolute;
  top: -34px;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: calc(100% + 34px);
  border: 0;
  display: block;
  object-fit: cover;
  object-position: top center;
  background: #fff;
`

const Developer = ({ dev, preview, reversed }) => (
  <Wrap reversed={reversed}>
    <Info reversed={reversed}>
      <Id reversed={reversed}>
        <Logo variant={dev.avatar} alt="" h={104} />
        <div>
          <H2>{dev.name}</H2>
          <Role><Zer0Text>{dev.role}</Zer0Text></Role>
        </div>
      </Id>
      <Body>{dev.bio}</Body>
      <Chips>
        {dev.stack.map((s) => (
          <span
            key={s}
            style={{
              border: '3px solid #000',
              padding: '7px 13px',
              fontFamily: 'var(--mono)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            {s}
          </span>
        ))}
      </Chips>
      <Links>
        <Button as="a" href={dev.links?.portfolio || '#'}>
          <Zer0Text>Visit portfolio</Zer0Text>
        </Button>
        {(dev.links?.github || dev.links?.linkedin) && (
          <TextLinks>
            {dev.links?.github && (
              <TextLink href={dev.links.github}><Zer0Text>GitHub</Zer0Text></TextLink>
            )}
            {dev.links?.linkedin && (
              <TextLink href={dev.links.linkedin}><Zer0Text>LinkedIn</Zer0Text></TextLink>
            )}
          </TextLinks>
        )}
      </Links>
    </Info>
    <PreviewWrap reversed={reversed}>
      <Preview>
        <PreviewBar>
          <i />
          <i />
          <i />
          <span>{preview.domain}</span>
        </PreviewBar>
        <PreviewBody bg={preview.bg} fg={preview.fg} font={preview.font}>
          {preview.image ? (
            <PreviewImage
              src={preview.image}
              alt={`${preview.domain} — portfolio screenshot`}
              loading="lazy"
            />
          ) : (
            preview.children
          )}
        </PreviewBody>
        <Cap>
          <span>P0RTF0LI0 PREVIEW</span>
        </Cap>
      </Preview>
    </PreviewWrap>
  </Wrap>
)

export default Developer
