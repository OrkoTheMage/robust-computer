import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import pkg from '../../../../package.json'
import { Button } from '../ui'
import { Logo, Zer0Text } from '../brand'
import { ticketIn } from '../../styles/animations'
import { colors } from '../../styles/colors'
import { heroMid, heroStack, mobile } from '../../styles/breakpoints'
import { useLocale } from '../../context/LocaleContext'

/**
 * Hero
 *
 * Home page opening. Headline, lead, two CTAs on the left; the
 * "worker with computer-monitor head" poster on the right with a
 * tilted ticket floating over it.
 *
 * The ticket is a real surface, not a static decoration:
 *   - the right tag reads from the version in package.json
 *     ("RELEASE 0.1.0" today, "RELEASE 0.2.0" after a bump)
 *   - the body reads the most recent Field Notes post from
 *     `data/fieldNotes.js` (the single source of truth — the
 *     /public/rss.xml is regenerated from the same array) and
 *     renders its title, pub date, and one-sentence excerpt. If
 *     the array is empty, it shows a placeholder.
 *
 * The "Release X.Y.Z" tag uses a separate chrome string
 * (`heroChrome.releasePrefix`) so each locale can order the
 * label and the version however reads naturally — e.g.
 */

/* Fills the opening viewport above the promises bar. The inner
   grid stays on --page, which keeps the ticket parked on the art. */
const Wrap = styled.section`
  width: 100%;
  max-width: var(--max);
  margin-inline: auto;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  background: ${colors.paper};
  border-bottom: 3px solid ${colors.ink};

  ${heroStack} {
    /* When the hero stacks, the Opening drops the 100dvh clamp
       (see Home.jsx), so the hero grows to fit its content
       rather than overflowing. */
    flex: none;
    align-items: flex-start;
  }
`

const Inner = styled.div`
  width: 100%;
  max-width: var(--page);
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 960px;
  gap: 72px;
  padding: 64px 56px 72px;
  align-items: center;

  /* Mid tier (1200-1575w, >1215h): stay 2-col but shrink the
     art column so the headline gets enough room on common
     laptop sizes (1280-1536) without the row feeling cramped. */
  ${heroMid} {
    grid-template-columns: minmax(0, 1fr) 720px;
    gap: 56px;
  }

  ${heroStack} {
    grid-template-columns: 1fr;
    padding: 48px 24px 56px;
    gap: 40px;
  }
`

const Headline = styled.h1`
  font-family: var(--display);
  font-weight: 800;
  /* Snaps to four discrete sizes — no continuous growth —
     so the headline locks to the hero's layout breakpoints.
     96px on the desktop row, 72px on the mid tier (2-col
     still, art shrunk to 720), 56px when stacked, 48px on
     phones. */
  font-size: 96px;
  line-height: 0.92;
  margin: 0 0 26px;
  text-transform: uppercase;
  letter-spacing: -0.015em;
  color: ${colors.ink};

  ${heroMid} {
    font-size: 72px;
  }

  ${heroStack} {
    font-size: 56px;
  }

  ${mobile} {
    font-size: 48px;
  }
`

const Lead = styled.p`
  font-size: 22px;
  max-width: 26em;
  margin: 0 0 34px;
  color: ${colors.ink};
`

const CTAs = styled.div`
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
`

const Art = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  ${heroStack} {
    order: -1;
    justify-content: center;
  }
`

const ArtFrame = styled.div`
  position: relative;
  width: 960px;

  ${heroMid} {
    width: 720px;
  }

  ${heroStack} {
    /* Cap the art when stacked so the ticket can sit at a
       reasonable size below it without overflowing the column. */
    width: min(100%, 320px);
    margin-inline: auto;
  }
`

const ArtImg = styled(Logo)`
  display: block;
  width: 960px;
  height: 960px;
  max-width: none;
  filter: drop-shadow(16px 16px 0 ${colors.ink});

  ${heroMid} {
    width: 720px;
    height: 720px;
    filter: drop-shadow(12px 12px 0 ${colors.ink});
  }

  ${heroStack} {
    width: 100%;
    height: auto;
    filter: drop-shadow(8px 8px 0 ${colors.ink});
  }
`

// Ticket comes up from below the art and settles into its
// tilted position. The `ticketIn` keyframes live in
// `src/animations.js` so other surfaces (a future modal opener,
// a CTA, etc.) can reuse the same entrance.
//
// 0.3s delay lets the hero settle first; the
// `cubic-bezier(0.22, 1, 0.36, 1)` is the same ease the rest of
// the site uses, so it feels native.
const Ticket = styled.div`
  position: absolute;
  left: -50px;
  bottom: 20px;
  width: 398px;
  background: ${colors.ticket};
  border: 4px solid ${colors.ink};
  box-shadow: 9px 9px 0 ${colors.ink};
  padding: 18px 20px 20px;
  transform: rotate(-2.5deg);
  z-index: 2;
  color: ${colors.ink};
  animation: ${ticketIn} 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
  /* Hint the browser to promote the ticket to its own layer so
     the animation runs on the compositor (no layout/paint). */
  will-change: transform, opacity;

  ${heroMid} {
    left: -36px;
    bottom: 16px;
    width: 320px;
    border-width: 4px;
    box-shadow: 7px 7px 0 ${colors.ink};
  }

  ${heroStack} {
    position: static;
    transform: rotate(-2.5deg);
    width: 100%;
    margin-top: -60px;
    border-width: 3px;
    box-shadow: 6px 6px 0 ${colors.ink};
    padding: 12px 14px 14px;
  }

  @media (prefers-reduced-motion: reduce) {
    /* Skip the entrance — show the ticket in its final position
       immediately. The base transform / opacity still apply, so
       the visual result is identical to the no-animation case. */
    animation: none;
  }
`

const TicketTag = styled.div`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.05em;
  display: flex;
  justify-content: space-between;
  border-bottom: 4px dashed ${colors.ink};
  padding-bottom: 10px;
  margin-bottom: 13px;
  text-transform: uppercase;
  color: ${colors.ink};

  ${heroMid} {
    font-size: 13px;
    border-bottom-width: 3px;
  }

  ${heroStack} {
    font-size: 11px;
    border-bottom-width: 3px;
    padding-bottom: 7px;
    margin-bottom: 8px;
  }
`

const TicketBody = styled.pre`
  margin: 0;
  font-family: var(--mono);
  font-size: 18px;
  line-height: 1.55;
  white-space: pre-wrap;
  color: ${colors.ink};

  ${heroMid} {
    font-size: 16px;
  }

  ${heroStack} {
    font-size: 13px;
  }
`

const TicketStamp = styled.span`
  margin-top: 13px;
  display: inline-block;
  background: ${colors.ink};
  color: ${colors.paper};
  font-family: var(--mono);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.05em;
  padding: 4px 13px;
  text-transform: uppercase;
  text-decoration: none;

  ${heroMid} {
    margin-top: 12px;
    font-size: 13px;
    padding: 4px 11px;
  }

  ${heroStack} {
    margin-top: 10px;
    font-size: 11px;
    padding: 3px 9px;
  }

  ${(p) => p.$link && `
    cursor: pointer;
    &:hover,
    &:focus-visible {
      background: ${colors.gold};
      color: ${colors.ink};
    }
  `}
`

const Hero = ({ latest, ticketBody }) => {
  const { hero, heroChrome } = useLocale()
  return (
    <Wrap>
      <Inner>
        <div>
          <Headline><Zer0Text>{hero.headline}</Zer0Text></Headline>
          <Lead>
            {hero.lead}
          </Lead>
          <CTAs>
            <Button as={Link} to="/contact">
              <Zer0Text>{heroChrome.start}</Zer0Text>
            </Button>
            <Button as={Link} to="/about" variant="alt">
              <Zer0Text>{heroChrome.team}</Zer0Text>
            </Button>
          </CTAs>
        </div>
        <Art>
          <ArtFrame>
            <ArtImg variant="bannerAlt" h={960} alt="The Robust Computer mascot" />
            <Ticket>
              <TicketTag>
                <span><Zer0Text>{heroChrome.buildLog}</Zer0Text></span>
                <span><Zer0Text>{`${heroChrome.releasePrefix} ${pkg.version}`}</Zer0Text></span>
              </TicketTag>
              <TicketBody>{ticketBody}</TicketBody>
              {latest?.to ? (
                <TicketStamp
                  as={Link}
                  to={latest.to}
                  $link
                  aria-label={`Read ${latest.title}`}
                >
                  <Zer0Text>{heroChrome.shipped}</Zer0Text>
                </TicketStamp>
              ) : (
                <TicketStamp><Zer0Text>{heroChrome.shipped}</Zer0Text></TicketStamp>
              )}
            </Ticket>
          </ArtFrame>
        </Art>
      </Inner>
    </Wrap>
  )
}

export default Hero
