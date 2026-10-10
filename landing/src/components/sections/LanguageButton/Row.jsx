import { useLocale } from '../../../context/LocaleContext'
import {
  LanguageItem,
  LanguageItemAbbr,
  LanguageItemHint,
} from './shells'

/**
 * LanguageRow
 *
 * Single row in the language menu / modal. Rendered once per
 * available language by `LanguageButton`. The row reads
 * `languageChrome.comingSoon` for the "coming soon" hint and
 * `locale` from the LocaleContext to mark the current
 * language as active.
 *
 * A "current" row is `aria-current="true"`, a "coming soon"
 * row is `disabled`. The label is the language's own name
 * (the language registry decides what it's called in its
 * own language, not a translatable string), and the
 * `abbr` (EN, ES, FR, HI, ZH) sits to the right.
 *
 * The styled shells live in `LanguageButton/shells.jsx` —
 * same shells both the dropdown and the modal use, so the
 * "current / disabled / coming soon" states look identical
 * across desktop and mobile.
 *
 * The `onSelect(code, isAvailable)` callback is the parent's
 * `handleSelect`; the row forwards the `isAvailable` flag
 * so the parent can guard `select` before flipping the
 * locale.
 */

export const LanguageRow = ({ entry, onSelect }) => {
  const { code, label, abbr, available } = entry
  const { locale, languageChrome } = useLocale()
  const isActive = code === locale
  return (
    <LanguageItem
      role="menuitem"
      disabled={!available}
      aria-current={isActive ? 'true' : undefined}
      onClick={() => onSelect(code, available)}
    >
      <span>{label}</span>
      {abbr && <LanguageItemAbbr>{abbr}</LanguageItemAbbr>}
      {!available && <LanguageItemHint>{languageChrome.comingSoon}</LanguageItemHint>}
    </LanguageItem>
  )
}
