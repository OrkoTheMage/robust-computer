/**
 * Navbar
 *
 * Sticky, brand-led nav. Clicking the brand icon opens a "site menu"
 * modal with the page list and external social links — useful as a
 * quick-jump surface and a place to put GitHub/LinkedIn/RSS without
 * crowding the top bar. That modal stays available at every width.
 *
 * At the mobile breakpoint the inline links collapse into a hamburger.
 * The panel drops out of the bar (it does not replace the icon modal),
 * dims the page, and leaves document scroll unlocked. It only lists
 * pages plus the start-a-project CTA.
 *
 * Active link gets the ink underline. The CTA button on the right
 * is the "start a project" call.
 */

import styled from '@emotion/styled'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Rss,
  Mail,
  Home,
  Users,
  Send,
  Newspaper,
  Languages,
  Menu,
  X,
} from 'lucide-react'
import { Button, Logo, Modal, Zer0Text } from '../ui'
import { colors } from '../../styles/colors'
import { navbarMobilePages, navbarPages, navbarConnects, navbarSocials, languages } from '../../data/copy'
import { getLatestNewsPath } from '../../data/fieldNotes'

// Map icon-name strings from the data file to Lucide components.
const ICON_MAP = { Github, Linkedin, Facebook, Instagram, Twitter, Rss, Mail, Home, Users, Send, Newspaper, Languages }

const Sticky = styled.div`
  position: sticky;
  top: 0;
  z-index: 40;
`

const Bar = styled.nav`
  background: ${colors.paper};
  border-bottom: 3px solid #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 56px;
  padding-inline: max(56px, calc((100% - var(--page)) / 2 + 56px));

  @media (max-width: 980px) {
    padding: 14px 24px;
  }
`

const Brand = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font: inherit;
`

// Stacked brand text: R0BUST on top, C0MPUTER below. Both lines
// share the same starting x (left-aligned flex column), and
// because IBM Plex Mono is monospace the 0s — which both sit at
// character index 2 — line up vertically without any per-glyph
// padding. Two <span>s so each word is its own <Zer0Text> unit
// and so the line break isn't a stray space.
const BrandStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: var(--mono);
  font-weight: 800;
  font-size: 32px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 1;
  color: #000;

  @media (max-width: 760px) {
    display: none;
  }
`

const BrandLine = styled.span`
  display: block;
`

const Links = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;

  @media (max-width: 760px) {
    display: none;
  }
`

const MenuBtn = styled.button`
  display: none;
  width: 48px;
  height: 48px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 3px solid #000;
  background: ${colors.ticket};
  color: #000;
  padding: 0;

  @media (max-width: 760px) {
    display: flex;
  }
`

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 4px 18px 18px;
  background: ${colors.paper};
  border-bottom: 3px solid #000;

  @media (min-width: 761px) {
    display: none;
  }
`

const PanelLink = styled(NavLink)`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.04em;
  color: #000;
  text-decoration: none;
  padding: 14px 8px;
  border-bottom: 3px solid #000;

  &.active {
    background: ${colors.gold};
  }
`

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 25;
  /* Visual only. Pointers pass through so the page underneath
     keeps its native scroll (including touch momentum). */
  pointer-events: none;

  @media (min-width: 761px) {
    display: none;
  }
`

const NavA = styled(NavLink)`
  font-family: var(--mono);
  font-weight: 800;
  font-size: 24px;
  letter-spacing: 0.02em;
  line-height: 1;
  text-decoration: none;
  padding: 6px 0;
  border-bottom: 3px solid transparent;
  color: #000;
  transition: color 180ms cubic-bezier(0.22, 1, 0.36, 1),
              border-color 180ms cubic-bezier(0.22, 1, 0.36, 1);

  &.active {
    border-bottom-color: ${colors.ink};
  }

  /* Same hover shape as the Footer's site links: 3px underline
     + color shift, but ink instead of gold (the text is already
     ink, so the underline is the visible change). The transparent
     border is always present so the box height doesn't shift. */
  &:hover,
  &:focus-visible {
    color: ${colors.ink};
    border-bottom-color: ${colors.ink};
  }
`

// CTA kept as its own styled component (vs. using <Button>
// inline) so <PanelCTA> can still extend it for the full-width
// mobile menu variant. The visual itself is just the default
// <Button> — no size or shadow overrides — so it matches the
// hero's "Start a project" button exactly.
const CTA = styled(Button)``

// Icon cluster on the main bar — the Languages icon plus the
// two connects flagged with mainBar: true in navbarConnects
// (GitHub + RSS Feed). Those entries are also surfaced as
// full text rows in the site-menu modal (Pages / Connect), but
// the inline icons give a one-click shortcut for repeat
// visitors. The whole cluster disappears below the 760px
// mobile cut; the mobile panel covers those entries on small
// screens.
const IconLinks = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 760px) {
    display: none;
  }
`

const IconLink = styled.a`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: 3px solid #000;
  background: ${colors.paper};
  color: #000;
  flex: none;
  text-decoration: none;
  transition: background 80ms ease, color 80ms ease;

  &:hover,
  &:active {
    background: ${colors.ink};
    color: ${colors.paper};
  }
  &[aria-expanded='true'] {
    background: ${colors.ink};
    color: ${colors.paper};
  }
  &:focus-visible {
    outline: 3px solid ${colors.goldDeep};
    outline-offset: 3px;
  }

  /* Custom hover tooltip. Reads data-tooltip on the element
     and renders a brand-styled label below the icon. Native
     title is removed in favor of this so the browser's
     default tooltip does not double up. */
  &::after {
    content: attr(data-tooltip);
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: ${colors.ink};
    color: ${colors.paper};
    font-family: var(--mono);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 5px 8px;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 ${colors.gold};
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 80ms ease;
    z-index: 50;
  }

  &:hover:not([aria-expanded='true'])::after,
  &:focus-visible:not([aria-expanded='true'])::after {
    opacity: 1;
  }
`

const PanelCTA = styled(CTA)`
  width: 100%;
  margin-top: 14px;
`

// Mobile-only icon row that mirrors the desktop main-bar cluster
// (Languages stub + the two mainBar-marked connects). Reuses the
// same <IconLink> styled component so the icons render at the
// same size and use the same hover/active inversion on both
// surfaces. Sits between the page links and the CTA, with its
// own bottom border so the row reads as a discrete block.
const PanelIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 18px 0 14px;
  border-bottom: 3px solid #000;
`

// Languages dropdown — wraps the icon so the menu can anchor
// against it. The wrapper is the only thing that needs
// position: relative; the menu is absolute-positioned and
// drops below the icon.
const LanguageWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const LanguageMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 200px;
  background: ${colors.paper};
  border: 3px solid #000;
  box-shadow: 4px 4px 0 ${colors.gold};
  z-index: 50;
`

const LanguageItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: ${colors.paper};
  color: #000;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 0;
  border-bottom: 3px solid #000;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  line-height: 1;

  &:last-child {
    border-bottom: 0;
  }

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    background: ${colors.ticket};
    outline: 0;
  }

  &:active:not(:disabled) {
    background: ${colors.gold};
  }

  &:disabled {
    color: #5d5744;
    cursor: not-allowed;
  }

  &[aria-current='true'] {
    background: ${colors.gold};
  }
`

const LanguageItemHint = styled.span`
  font-family: var(--mono);
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: lowercase;
  color: #5d5744;
  margin-left: 12px;
`

// Static-positioned wrapper for the language list when rendered
// inside the centered Modal (mobile). Reuses the same
// LanguageItem rows as the dropdown so the "current / disabled /
// coming soon" states look identical across desktop and mobile.
// The wrapper provides only the padding inside the Modal card
// (the card itself has no padding, per the MenuBody pattern
// used elsewhere in this file).
const LanguageModalList = styled.div`
  padding: 12px 0;
  min-width: 320px;
`

// ── LanguageButton ───────────────────────────────────────────────────
// Self-contained: owns the open state, the close-on-outside-click
// effect, and the close-on-Escape effect. Used twice (main bar +
// mobile panel); each instance manages its own dropdown.
// `onAfterSelect` is fired after the user picks a row — used by
// the mobile panel to also dismiss itself.
//
// `variant="dropdown"` (default): desktop, renders a custom menu
// anchored below the icon.
// `variant="modal"`: mobile, renders the same list inside a
// centered Modal dialog (the Modal primitive handles backdrop
// and Escape; its built-in close button is hidden for this
// case via the hideCloseButton prop).
const LanguageButton = ({ variant = 'dropdown', onAfterSelect }) => {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const isModal = variant === 'modal'

  // The Modal handles its own Escape / backdrop dismissal, so
  // the document-level close listeners are only needed for the
  // dropdown variant.
  useEffect(() => {
    if (!open || isModal) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e) => {
      if (wrapRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open, isModal])

  const renderItems = () =>
    languages.map(({ code, label, available, active }) => (
      <LanguageItem
        key={code}
        role="menuitem"
        disabled={!available}
        aria-current={active ? 'true' : undefined}
        onClick={() => {
          if (available) {
            // future: persist language choice
          }
          setOpen(false)
          onAfterSelect?.()
        }}
      >
        <span>{label}</span>
        {!available && <LanguageItemHint>(coming soon)</LanguageItemHint>}
      </LanguageItem>
    ))

  return (
    <LanguageWrap ref={wrapRef} data-language-wrap>
      <IconLink
        as="button"
        type="button"
        onClick={(e) => {
          e.preventDefault()
          setOpen((o) => !o)
        }}
        aria-label="Language"
        aria-haspopup={isModal ? 'dialog' : 'menu'}
        aria-expanded={open}
        data-tooltip="Language"
      >
        <Languages size={26} strokeWidth={2.4} />
      </IconLink>
      {open && isModal && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          ariaLabel="Language"
          hideCloseButton
        >
          <LanguageModalList role="menu" aria-label="Language">
            {renderItems()}
          </LanguageModalList>
        </Modal>
      )}
      {open && !isModal && (
        <LanguageMenu role="menu" aria-label="Language">
          {renderItems()}
        </LanguageMenu>
      )}
    </LanguageWrap>
  )
}

// ── Modal content ───────────────────────────────────────────────────────
//
// OS-style list: one row per item, icon + label + hint + meta. No
// boxed groups, no two-column grids. Sections become a thin
// horizontal divider with a centered caps label. Hover tints the
// row, active tints it gold.

const MenuBody = styled.div`
  padding: 28px 8px 22px;
`

const MenuHeader = styled.h2`
  font-family: var(--display);
  font-weight: 800;
  font-size: 28px;
  line-height: 1;
  text-transform: uppercase;
  margin: 0 22px 6px;
  letter-spacing: -0.005em;
  color: #000;
  padding-right: 50px;
`

const MenuSub = styled.p`
  font-family: var(--mono);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #5d5744;
  margin: 0 22px 4px;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 14px;
`

const ListDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 22px 4px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 2px;
    background: #000;
  }

  span {
    font-family: var(--mono);
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #000;
  }
`

// Polymorphic row: renders as <Link> for internal pages or <a>
// for external links, via Emotion's `as` prop.
const Row = styled.a`
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 14px;
  width: 100%;
  background: transparent;
  border: 0;
  padding: 10px 22px;
  text-align: left;
  cursor: pointer;
  color: #000;
  font: inherit;
  text-decoration: none;
  transition: background 60ms ease;

  &:hover {
    background: ${colors.ticket};
  }
  &:active {
    background: ${colors.gold};
  }
  &:focus-visible {
    outline: 3px solid ${colors.goldDeep};
    outline-offset: -3px;
  }
`

const RowIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2.5px solid #000;
  background: ${colors.paper};
  color: #000;
  flex: none;
`

const RowBody = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.15;
`

const RowLabel = styled.span`
  font-family: var(--display);
  font-weight: 800;
  font-size: 17px;
  text-transform: uppercase;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RowHint = styled.span`
  font-family: var(--mono);
  font-weight: 500;
  font-size: 12px;
  color: #5d5744;
  margin-top: 2px;
  text-transform: lowercase;
  letter-spacing: 0.02em;
`

const RowMeta = styled.span`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 18px;
  color: #000;
  flex: none;
  line-height: 1;
`

// ── Component ────────────────────────────────────────────────────────────

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const stickyRef = useRef(null)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  // If we're already on home, the Home row in the modal should
  // smooth-scroll to the top instead of doing a no-op navigate.
  // Anywhere else, let the Link navigate normally.
  const onHomeClick = (e) => {
    if (isHome) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    // The scrim does not take hits, so an outside press both
    // dismisses the panel and would otherwise activate whatever
    // sits under the dim. Swallow that one click.
    const onPointerDown = (e) => {
      if (stickyRef.current?.contains(e.target)) return
      setMobileOpen(false)
      const swallow = (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        document.removeEventListener('click', swallow, true)
      }
      document.addEventListener('click', swallow, true)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <Sticky ref={stickyRef}>
        <Bar data-chrome="nav">
          <Brand
            type="button"
            onClick={() => {
              setMobileOpen(false)
              setMenuOpen(true)
            }}
            aria-label="Open site menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            <Logo variant="icon" h={87} />
            <BrandStack>
              <BrandLine><Zer0Text>Robust</Zer0Text></BrandLine>
              <BrandLine><Zer0Text>Computer</Zer0Text></BrandLine>
            </BrandStack>
          </Brand>
          <Links>
            <NavA to="/about"><Zer0Text>About</Zer0Text></NavA>
            <NavA to={getLatestNewsPath()}><Zer0Text>News</Zer0Text></NavA>
            <IconLinks>
              <LanguageButton />
              {navbarConnects.filter(({ mainBar }) => mainBar).map(({ href, label, icon, external }) => {
                const Icon = ICON_MAP[icon]
                return (
                  <IconLink
                    key={label}
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    aria-label={label}
                    data-tooltip={label}
                  >
                    <Icon size={26} strokeWidth={2.4} />
                  </IconLink>
                )
              })}
            </IconLinks>
            <CTA as={Link} to="/contact">
              <Zer0Text>Start a project</Zer0Text>
            </CTA>
          </Links>
          <MenuBtn
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen
              ? <X size={22} strokeWidth={2.6} />
              : <Menu size={22} strokeWidth={2.6} />}
          </MenuBtn>
        </Bar>
        {mobileOpen && (
          <Panel id="mobile-nav">
            {navbarMobilePages.map((p) => (
              <PanelLink key={p.to} to={p.to} end={p.end} onClick={closeMobile}>
                <Zer0Text>{p.label}</Zer0Text>
              </PanelLink>
            ))}
            <PanelIcons>
              <LanguageButton variant="modal" onAfterSelect={closeMobile} />
              {navbarConnects.filter(({ mainBar }) => mainBar).map(({ href, label, icon, external }) => {
                const Icon = ICON_MAP[icon]
                return (
                  <IconLink
                    key={label}
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    aria-label={label}
                    data-tooltip={label}
                    onClick={closeMobile}
                  >
                    <Icon size={26} strokeWidth={2.4} />
                  </IconLink>
                )
              })}
            </PanelIcons>
            <PanelCTA as={Link} to="/contact" onClick={closeMobile}>
              <Zer0Text>Start a project</Zer0Text>
            </PanelCTA>
          </Panel>
        )}
      </Sticky>

      {mobileOpen && <Scrim aria-hidden="true" />}

      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        ariaLabel="Site menu"
      >
        <MenuBody>
          <MenuHeader>Menu</MenuHeader>
          <MenuSub>Jump anywhere</MenuSub>

          <List>
            <ListDivider>
              <span>Pages</span>
            </ListDivider>
            {navbarPages.map((p) => {
              const { to, href, label, hint, icon, external } = p
              const Icon = ICON_MAP[icon]
              const isExternal = Boolean(href)
              const isHomeRow = !isExternal && to === '/'
              return (
                <Row
                  key={to || href}
                  as={isExternal ? 'a' : Link}
                  to={isExternal ? undefined : to}
                  href={isExternal ? href : undefined}
                  target={isExternal && external ? '_blank' : undefined}
                  rel={isExternal && external ? 'noopener noreferrer' : undefined}
                  onClick={isExternal
                    ? undefined
                    : isHomeRow
                      ? onHomeClick
                      : () => setMenuOpen(false)}
                >
                  <RowIcon>
                    <Icon size={20} strokeWidth={2.4} />
                  </RowIcon>
                  <RowBody>
                    <RowLabel>{label}</RowLabel>
                    <RowHint>{hint}</RowHint>
                  </RowBody>
                  <RowMeta aria-hidden="true">{isExternal ? '↗' : '→'}</RowMeta>
                </Row>
              )
            })}

            <ListDivider>
              <span>Connect</span>
            </ListDivider>
            {navbarConnects.map(({ href, label, hint, external, icon }) => {
              const Icon = ICON_MAP[icon]
              return (
              <Row
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
              >
                <RowIcon>
                  <Icon size={20} strokeWidth={2.4} />
                </RowIcon>
                <RowBody>
                  <RowLabel>{label}</RowLabel>
                  <RowHint>{hint}</RowHint>
                </RowBody>
                <RowMeta aria-hidden="true">{external ? '↗' : '→'}</RowMeta>
              </Row>
              )
            })}

            <ListDivider>
              <span>Elsewhere</span>
            </ListDivider>
            {navbarSocials.map(({ href, label, hint, external, icon }) => {
              const Icon = ICON_MAP[icon]
              return (
              <Row
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
              >
                <RowIcon>
                  <Icon size={20} strokeWidth={2.4} />
                </RowIcon>
                <RowBody>
                  <RowLabel>{label}</RowLabel>
                  <RowHint>{hint}</RowHint>
                </RowBody>
                <RowMeta aria-hidden="true">{external ? '↗' : '→'}</RowMeta>
              </Row>
              )
            })}
          </List>
        </MenuBody>
      </Modal>
    </>
  )
}

export default Navbar
