import styled from '@emotion/styled'
import { Languages } from 'lucide-react'
import { colors } from '../../styles/colors'
import { Modal } from '../modals'
import IconLink from './IconLink'
import { useLanguageMenu } from '../../hooks/useLanguageMenu'
import { useLocale } from '../../context/LocaleContext'

/**
 * LanguageButton
 *
 * Language control for the main bar (dropdown) and the mobile
 * panel (modal). Each instance owns its own open state.
 *
 * The actual locale change is handled by the LocaleContext —
 * selecting a row calls `setLocale(code)`, which updates the
 * dictionary every consumer reads, persists the choice to
 * localStorage, and reflects in `<html lang>`. The button
 * itself is a pure control: render the row, fire the setter.
 *
 * `active` is computed from the current `locale` (not a static
 * field on the language entry), so the row that reads
 * "this is the language you're looking at right now" always
 * matches the dictionary the rest of the app is rendering.
 */

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
  border: 3px solid ${colors.ink};
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
  color: ${colors.ink};
  font-family: var(--mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 0;
  border-bottom: 3px solid ${colors.ink};
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
    color: ${colors.deskSoft};
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
  color: ${colors.deskSoft};
  margin-left: 12px;
`

// Right-side language code (EN, ES, FR, HI, ZH). Kept on its
// own styled component so the text-transform stays uppercase —
// the shared LanguageItemHint is `lowercase` to fit the
// "(coming soon)" copy and would otherwise render "en" / "fr"
// instead of "EN" / "FR". Weight is bumped to 700 so the code
// reads as a label, not a stray annotation.
const LanguageItemAbbr = styled.span`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: ${colors.deskSoft};
  margin-left: 12px;
  flex: none;
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
  const { open, wrapRef, isModal, close, toggle } = useLanguageMenu(variant)
  const { languages, locale, setLocale, languageChrome } = useLocale()

  const select = (code) => {
    setLocale(code)
    close()
    onAfterSelect?.()
  }

  const renderRow = ({ code, label, abbr, available }) => {
    const isActive = code === locale
    return (
      <LanguageItem
        key={code}
        role="menuitem"
        disabled={!available}
        aria-current={isActive ? 'true' : undefined}
        onClick={() => {
          if (!available) return
          select(code)
        }}
      >
        <span>{label}</span>
        {abbr && <LanguageItemAbbr>{abbr}</LanguageItemAbbr>}
        {!available && <LanguageItemHint>{languageChrome.comingSoon}</LanguageItemHint>}
      </LanguageItem>
    )
  }

  return (
    <LanguageWrap ref={wrapRef} data-language-wrap>
      <IconLink
        as="button"
        type="button"
        onClick={(e) => {
          e.preventDefault()
          toggle()
        }}
        aria-label={languageChrome.ariaLabel}
        aria-haspopup={isModal ? 'dialog' : 'menu'}
        aria-expanded={open}
        data-tooltip={languageChrome.tooltip}
      >
        <Languages size={26} strokeWidth={2.4} />
      </IconLink>
      {open && isModal && (
        <Modal
          open={open}
          onClose={close}
          ariaLabel={languageChrome.modalAriaLabel}
          hideCloseButton
        >
          <LanguageModalList role="menu" aria-label={languageChrome.modalAriaLabel}>
            {languages.map(renderRow)}
          </LanguageModalList>
        </Modal>
      )}
      {open && !isModal && (
        <LanguageMenu role="menu" aria-label={languageChrome.ariaLabel}>
          {languages.map(renderRow)}
        </LanguageMenu>
      )}
    </LanguageWrap>
  )
}

export default LanguageButton
