import styled from '@emotion/styled'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { mobile, navHamburger, fromNavHamburger } from '../../styles/breakpoints'
import {

/**
 * Navbar
 *
 * Sticky, brand-led nav. Clicking the brand icon opens a "site menu"
 * modal with the page list and external social links — useful as a
 * quick-jump surface and a place to put GitHub/LinkedIn/RSS without
 * crowding the top bar. That modal stays available at every width.
 *
 * At 1200px width and below the inline links collapse into a
 * hamburger. The panel drops out of the bar (it does not replace the icon modal),
 * dims the page, and leaves document scroll unlocked. It only lists
 * pages plus the start-a-project CTA.
 *
 * Active link gets the ink underline. The CTA button on the right
 * is the "start a project" call.
 *
 * Two "About" / "News" labels appear inline (desktop) and a third
 * copy is used in the site-menu modal. Both come from the i18n
 * dictionary's `navChrome` so a locale switch updates them at once.
 */

  Github,
  Linkedin,
  Facebook,
  Instagram,
  Rss,
  Mail,
  Home,
  Users,
  Send,
  Newspaper,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react'
import { Button, XBrand } from '../ui'
import { Logo, Zer0Text } from '../brand'
import { Modal } from '../modals'
import { colors } from '../../styles/colors'
import { useNavbar } from '../../hooks/useNavbar'
import { usePageIcon } from '../../hooks/usePageIcon'
import { useLocale } from '../../context/LocaleContext'
import IconLink from './IconLink'
import LanguageButton from './LanguageButton'

// Map icon-name strings from the data file to Lucide components.
const ICON_MAP = { Github, Linkedin, Facebook, Instagram, X: XBrand, Rss, Mail, Home, Users, Send, Newspaper }

const Sticky = styled.div`
  position: sticky;
  top: 0;
  z-index: 40;
`

const Bar = styled.nav`
  max-width: var(--max);
  margin-inline: auto;
  background: ${colors.paper};
  border-bottom: 3px solid ${colors.ink};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 56px;
  padding-inline: max(56px, calc((100% - var(--page)) / 2 + 56px));

  ${mobile} {
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
//
// "Robust" and "Computer" are kept as English literals here
// because they're halves of the brand name. "Robust Computer"
// is untranslated across every locale (see i18n/index.js
// "Untranslated by design"), so the two halves are too.
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
  color: ${colors.ink};

  ${mobile} {
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

  ${navHamburger} {
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
  border: 3px solid ${colors.ink};
  background: ${colors.ticket};
  color: ${colors.ink};
  padding: 0;

  ${navHamburger} {
    display: flex;
  }
`

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 4px 18px 18px;
  background: ${colors.paper};
  border-bottom: 3px solid ${colors.ink};

  ${fromNavHamburger} {
    display: none;
  }
`

const PanelLink = styled(NavLink)`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.04em;
  color: ${colors.ink};
  text-decoration: none;
  padding: 14px 8px;
  border-bottom: 3px solid ${colors.ink};

  &.active {
    background: ${colors.gold};
  }
`

// Mobile-only "back to home"
const PanelBackRow = styled(Link)`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.04em;
  color: ${colors.ink};
  text-decoration: none;
  padding: 14px 8px;
  border-bottom: 3px solid ${colors.ink};
  display: flex;
  align-items: center;
  gap: 10px;

  &:focus-visible {
    outline: 3px solid ${colors.goldDeep};
    outline-offset: -3px;
  }
`

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  background: ${colors.scrimSoft};
  z-index: 25;
  /* Visual only. Pointers pass through so the page underneath
     keeps its native scroll (including touch momentum). */
  pointer-events: none;

  ${fromNavHamburger} {
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
  color: ${colors.ink};
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
// visitors. The whole cluster disappears on phones; the mobile
// panel covers those entries on small screens.
const IconLinks = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  ${mobile} {
    display: none;
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
// surfaces.
//
// Sits at the bottom of the panel (below the CTA). The panel's
// own `border-bottom` closes the section visually, so this row
// doesn't carry its own — the 3px ink divider that used to live
// here moved up to <PanelCTA> when the CTA and the icons row
// swapped positions.
const PanelIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 18px 0 14px;
  margin-top: 14px;
`

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
  color: ${colors.ink};
  padding-right: 50px;
`

const MenuSub = styled.p`
  font-family: var(--mono);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${colors.deskSoft};
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
    background: ${colors.ink};
  }

  span {
    font-family: var(--mono);
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${colors.ink};
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
  color: ${colors.ink};
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
  border: 2.5px solid ${colors.ink};
  background: ${colors.paper};
  color: ${colors.ink};
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
  color: ${colors.ink};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RowHint = styled.span`
  font-family: var(--mono);
  font-weight: 500;
  font-size: 12px;
  color: ${colors.deskSoft};
  margin-top: 2px;
  text-transform: lowercase;
  letter-spacing: 0.02em;
`

const RowMeta = styled.span`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 18px;
  color: ${colors.ink};
  flex: none;
  line-height: 1;
`

// ── Component ────────────────────────────────────────────────────────────

const Navbar = () => {
  const {
    menuOpen,
    mobileOpen,
    stickyRef,
    openMenu,
    closeMenu,
    toggleMobile,
    closeMobile,
  } = useNavbar()
  const { navbarMobilePages, navbarPages, navbarConnects, navbarSocials, navChrome, heroChrome, fieldNotePage } = useLocale()
  const { pathname } = useLocation()
  // Hide the "back to home" row when the user is already at
  // `/` — the modal's CTA + page links are the right
  // surface there, and offering a "back to where you are"
  // button would be confusing.
  const isHome = pathname === '/'
  // Brand icon varies per route — see `usePageIcon` for the
  // route → variant map. The visual swaps to a thematic
  // variant (about/contact/rss/…) without changing the
  // semantic: this is still the brand mark in the navbar,
  // not a page-specific image.
  const pageIcon = usePageIcon()

  return (
    <>
      <Sticky ref={stickyRef}>
        <Bar data-chrome="nav">
          <Brand
            type="button"
            onClick={openMenu}
            aria-label={navChrome.openSiteMenu}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            <Logo src={pageIcon} h={87} />
            <BrandStack>
              <BrandLine><Zer0Text>Robust</Zer0Text></BrandLine>
              <BrandLine><Zer0Text>Computer</Zer0Text></BrandLine>
            </BrandStack>
          </Brand>
          <Links>
            <NavA to="/about"><Zer0Text>{navChrome.about}</Zer0Text></NavA>
            <NavA to="/field-notes"><Zer0Text>{navChrome.news}</Zer0Text></NavA>
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
              <Zer0Text>{heroChrome.start}</Zer0Text>
            </CTA>
          </Links>
          <MenuBtn
            type="button"
            onClick={toggleMobile}
            aria-label={mobileOpen ? navChrome.closeMenu : navChrome.openMenu}
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
            {!isHome && (
              <PanelBackRow to="/" onClick={closeMobile}>
                <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
                {fieldNotePage.back}
              </PanelBackRow>
            )}
            {navbarMobilePages.map((p) => (
              <PanelLink key={p.to} to={p.to} end={p.end} onClick={closeMobile}>
                <Zer0Text>{p.label}</Zer0Text>
              </PanelLink>
            ))}
            <PanelCTA as={Link} to="/contact" onClick={closeMobile}>
              <Zer0Text>{heroChrome.start}</Zer0Text>
            </PanelCTA>
            <div></div>
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
          </Panel>
        )}
      </Sticky>

      {mobileOpen && <Scrim aria-hidden="true" />}

      <Modal
        open={menuOpen}
        onClose={closeMenu}
        ariaLabel={navChrome.menu.title}
      >
        <MenuBody>
          <MenuHeader>{navChrome.menu.title}</MenuHeader>
          <MenuSub>{navChrome.menu.sub}</MenuSub>

          <List>
            <ListDivider>
              <span>{navChrome.menu.pagesHeader}</span>
            </ListDivider>
            {navbarPages.map((p) => {
              const { to, href, label, hint, icon, external } = p
              const Icon = ICON_MAP[icon]
              const isExternal = Boolean(href)
              return (
                <Row
                  key={to || href}
                  as={isExternal ? 'a' : Link}
                  to={isExternal ? undefined : to}
                  href={isExternal ? href : undefined}
                  target={isExternal && external ? '_blank' : undefined}
                  rel={isExternal && external ? 'noopener noreferrer' : undefined}
                  onClick={isExternal ? undefined : closeMenu}
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
              <span>{navChrome.menu.connectHeader}</span>
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
              <span>{navChrome.menu.elsewhereHeader}</span>
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
