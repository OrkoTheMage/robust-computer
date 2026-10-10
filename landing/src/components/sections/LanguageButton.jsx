import styled from '@emotion/styled'
import { Languages } from 'lucide-react'
import { colors } from '../../styles/colors'
import { Modal } from '../modals'
import IconLink from './IconLink'
import { useLanguageMenu } from '../../hooks/useLanguageMenu'
import { useLocale } from '../../context/LocaleContext'
import { LanguageRow } from './LanguageButton/Row'

/**
 * LanguageButton
 *
 * Language control for the main bar (dropdown) and the mobile
 * panel (modal). Each instance owns its own open state via
 * `useLanguageMenu`. The actual locale change is handled by
 * the LocaleContext — selecting a row calls
 * `useLanguageMenu`'s `select(code)`, which updates the
 * dictionary every consumer reads, persists the choice to
 * localStorage, and reflects in `<html lang>`. The button
 * itself is a pure control: render the row, fire the setter.
 *
 * `active` is computed from the current `locale` (not a static
 * field on the language entry), so the row that reads
 * "this is the language you're looking at right now" always
 * matches the dictionary the rest of the app is rendering.
 *
 * Per the §3 page/section rule, this file is imports + styled
 * components + the default export. The non-styled row
 * component lives in `LanguageButton/Row.jsx`; the
 * shared `LanguageItem` / `LanguageItemHint` /
 * `LanguageItemAbbr` shells live in
 * `LanguageButton/shells.jsx`; the open / close / select
 * logic lives in `hooks/useLanguageMenu.js`.
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

// Static-positioned wrapper for the language list when rendered
// inside the centered Modal (mobile). The Modal card itself has
// no padding, per the MenuBody pattern used elsewhere in this
// file — the wrapper provides the padding inside the card.
const LanguageModalList = styled.div`
  padding: 12px 0;
  min-width: 320px;
`

// ── LanguageButton ───────────────────────────────────────────────────
// Used twice (main bar + mobile panel); each instance manages
// its own dropdown via `useLanguageMenu`. The hook owns the
// open / close / select state and the close-on-outside-click
// + close-on-Escape effects for the dropdown variant; the
// Modal primitive handles those effects for the modal variant.
// `onAfterSelect` is fired after the user picks a row — used
// by the mobile panel to also dismiss itself.
//
// `variant="dropdown"` (default): desktop, renders a custom menu
// anchored below the icon.
// `variant="modal"`: mobile, renders the same list inside a
// centered Modal dialog (the Modal primitive handles backdrop
// and Escape; its built-in close button is hidden for this
// case via the hideCloseButton prop).
const LanguageButton = ({ variant = 'dropdown', onAfterSelect }) => {
  const { open, wrapRef, isModal, close, toggle, select } = useLanguageMenu(variant)
  const { languages, languageChrome } = useLocale()

  const handleSelect = (code, isAvailable) => {
    if (!isAvailable) return
    select(code)
    onAfterSelect?.()
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
            {languages.map((entry) => (
              <LanguageRow key={entry.code} entry={entry} onSelect={handleSelect} />
            ))}
          </LanguageModalList>
        </Modal>
      )}
      {open && !isModal && (
        <LanguageMenu role="menu" aria-label={languageChrome.ariaLabel}>
          {languages.map((entry) => (
            <LanguageRow key={entry.code} entry={entry} onSelect={handleSelect} />
          ))}
        </LanguageMenu>
      )}
    </LanguageWrap>
  )
}

export default LanguageButton
