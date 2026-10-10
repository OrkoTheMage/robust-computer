import styled from '@emotion/styled'
import { colors } from '../../../styles/colors'

/**
 * LanguageButton shells
 *
 * Styled components used by `LanguageButton.jsx` and the row
 * component in `LanguageButton/Row.jsx`. These shells are
 * specific to the language control — they render the same
 * "current / disabled / coming soon" states for both the
 * desktop dropdown and the mobile modal list.
 */

export const LanguageItem = styled.button`
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

export const LanguageItemHint = styled.span`
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
export const LanguageItemAbbr = styled.span`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: ${colors.deskSoft};
  margin-left: 12px;
  flex: none;
`
