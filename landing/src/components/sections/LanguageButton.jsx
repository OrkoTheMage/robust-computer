import styled from '@emotion/styled'
import { Languages } from 'lucide-react'
import { colors } from '../../styles/colors'
import { languages } from '../../data/copy'
import { Modal } from '../modals'
import IconLink from './IconLink'
import { useLanguageMenu } from '../../hooks/useLanguageMenu'

/**
 * LanguageButton
 *
 * Language control for the main bar (dropdown) and the mobile
 * panel (modal). Each instance owns its own open state.
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

  return (
    <LanguageWrap ref={wrapRef} data-language-wrap>
      <IconLink
        as="button"
        type="button"
        onClick={(e) => {
          e.preventDefault()
          toggle()
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
          onClose={close}
          ariaLabel="Language"
          hideCloseButton
        >
          <LanguageModalList role="menu" aria-label="Language">
            {languages.map(({ code, label, available, active }) => (
              <LanguageItem
                key={code}
                role="menuitem"
                disabled={!available}
                aria-current={active ? 'true' : undefined}
                onClick={() => {
                  close()
                  onAfterSelect?.()
                }}
              >
                <span>{label}</span>
                {!available && <LanguageItemHint>(coming soon)</LanguageItemHint>}
              </LanguageItem>
            ))}
          </LanguageModalList>
        </Modal>
      )}
      {open && !isModal && (
        <LanguageMenu role="menu" aria-label="Language">
          {languages.map(({ code, label, available, active }) => (
            <LanguageItem
              key={code}
              role="menuitem"
              disabled={!available}
              aria-current={active ? 'true' : undefined}
              onClick={() => {
                close()
                onAfterSelect?.()
              }}
            >
              <span>{label}</span>
              {!available && <LanguageItemHint>(coming soon)</LanguageItemHint>}
            </LanguageItem>
          ))}
        </LanguageMenu>
      )}
    </LanguageWrap>
  )
}

export default LanguageButton
