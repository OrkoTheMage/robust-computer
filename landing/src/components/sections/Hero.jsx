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
 *   - the body fetches /rss.xml on mount and renders the most
 *     recent <item> — its title, pub date, and the first sentence
 *     of the description. If the feed is empty or the fetch fails,
 *     it shows a placeholder.
 */

import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import pkg from '../../../../package.json'
import { Button, Logo, Zer0Text } from '../ui'
import { useLatestRss, formatPubDate } from '../../hooks/useLatestRss'
import { ticketIn } from '../../styles/animations'
import { colors } from '../../styles/colors'
import { hero } from '../../data/copy'

/* Fills the opening viewport above the promises bar. The inner
   grid stays on --page, which keeps the ticket parked on the art. */
const Wrap = styled.section`
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  background: ${colors.paper};
  border-bottom: 3px solid ${colors.ink};

  @media (max-width: 980px) {
    /* On mobile the Opening drops the 100dvh clamp, so the hero
       grows to fit its stacked content rather than overflowing. */
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

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    padding: 48px 24px 56px;
    gap: 40px;
  }
`

const Headline = styled.h1`
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(48px, 6.5vw, 96px);
  line-height: 0.92;
  margin: 0 0 26px;
  text-transform: uppercase;
  letter-spacing: -0.015em;
  color: ${colors.ink};
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

  @media (max-width: 980px) {
    order: -1;
    justify-content: center;
  }
`

const ArtFrame = styled.div`
  position: relative;
  width: 960px;

  @media (max-width: 980px) {
    /* Cap the art on small screens so the ticket can sit at a
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

  @media (max-width: 980px) {
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

  @media (max-width: 980px) {
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

  @media (max-width: 980px) {
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

  @media (max-width: 980px) {
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

  @media (max-width: 980px) {
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

// RSS reading + date formatting live in `hooks/useLatestRss.js`
// so the Field Notes section can show the same latest issue.

const Hero = () => {
  const latest = useLatestRss()
  const ticketBody = latest
    ? `$ tail --rss -n -1\n> ${formatPubDate(latest.pubDate)}\n> ${latest.title}\n${latest.description}`
    : '$ tail --rss -n -1\n> (no issues yet)'

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
              <Zer0Text>Start a project</Zer0Text>
            </Button>
            <Button as={Link} to="/about" variant="alt">
              <Zer0Text>Meet the Team</Zer0Text>
            </Button>
          </CTAs>
        </div>
        <Art>
          <ArtFrame>
            <ArtImg variant="bannerAlt" h={960} alt="The Robust Computer mascot" />
            <Ticket>
              <TicketTag>
                <span><Zer0Text>Build log</Zer0Text></span>
                <span><Zer0Text>{`Release ${pkg.version}`}</Zer0Text></span>
              </TicketTag>
              <TicketBody>{ticketBody}</TicketBody>
              {latest?.to ? (
                <TicketStamp
                  as={Link}
                  to={latest.to}
                  $link
                  aria-label={`Read ${latest.title}`}
                >
                  <Zer0Text>Shipped</Zer0Text>
                </TicketStamp>
              ) : (
                <TicketStamp><Zer0Text>Shipped</Zer0Text></TicketStamp>
              )}
            </Ticket>
          </ArtFrame>
        </Art>
      </Inner>
    </Wrap>
  )
}

export default Hero
