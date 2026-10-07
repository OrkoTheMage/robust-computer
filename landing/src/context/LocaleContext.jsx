import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { dictionaries, languages, DEFAULT_LOCALE, STORAGE_KEY } from '../i18n'

/**
 * context/LocaleContext
 *
 * Owns the current locale for the whole app. The provider
 * spreads the current locale's dictionary into the context
 * value, so a page or component reads translated strings with
 * the same shape the old `data/copy.js` import had:
 *
 *   const { hero, heroChrome } = useLocale()
 *   <Zer0Text>{hero.headline}</Zer0Text>
 *
 * Selection
 *   1. localStorage[STORAGE_KEY] if set and valid
 *   2. DEFAULT_LOCALE otherwise
 *
 * Browser-language detection (navigator.language) is not
 * applied on the first visit: a Spanish-first user who lands
 * on the site once and then switches to English is more
 * important to remember than a fresh visitor's IP-based
 * guess. localStorage wins after the first manual switch.
 *
 * Side effects
 *   - `document.documentElement.lang` is kept in sync with the
 *     current locale so screen readers and search engines see
 *     the right `lang` attribute on the root element. The
 *     initial `<html lang="en">` in `index.html` matches
 *     DEFAULT_LOCALE; the provider takes over from there.
 *   - the choice is persisted to localStorage on every change
 *     so the next mount of the provider picks it up.
 *
 * SSR / pre-mount
 *   - `getInitialLocale` reads localStorage only when
 *     `window` is defined, so server-side rendering and the
 *     first client render agree on the locale. (The Vite
 *     build is SPA-only, but the helper still doesn't blow up
 *     if it's called during prerender or testing.)
 *
 * Dictionary fallback
 *   - if the requested locale's dictionary is missing a key
 *     the consumer asked for, the spread here doesn't help
 *     (each entry is its own key). The pattern is for the
 *     ENTRY to be a complete object, so a missing top-level
 *     key in `dictionaries[locale]` falls back to the
 *     DEFAULT_LOCALE entry — `useLocale()` never returns
 *     `undefined` for a documented export.
 *
 * Consumers
 *   - `useLocale()` — returns the full context value
 *     (`{ locale, setLocale, languages, ...dict }`).
 *   - `useT()` — sugar for `useLocale().dict`; if you only
 *     need to read strings, destructure from `useT()`
 *     directly so the call site reads like the old static
 *     `import { ... } from '../data/copy'` pattern.
 */

const LocaleContext = createContext(null)

const getInitialLocale = () => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && dictionaries[stored]) return stored
  } catch {
    // localStorage can throw in private-browsing modes and
    // when storage quotas are exhausted. Treat any failure
    // as "no stored value" and fall back to the default.
  }
  return DEFAULT_LOCALE
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale)

  const setLocale = useCallback((next) => {
    if (!dictionaries[next]) return
    setLocaleState(next)
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Same defensive try/catch as getInitialLocale — the
      // in-memory state still updates even if persistence
      // fails, so the rest of the app reflects the new
      // locale for this session.
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(() => {
    const primary = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]
    const fallback = dictionaries[DEFAULT_LOCALE]
    // Per-key fallback: if the active locale's dictionary is
    // missing a key, the value from the default (English)
    // dictionary ships through instead of `undefined`. The
    // META_KEYS aren't in either dictionary, so they aren't
    // affected. Top-level keys are spread with the active
    // locale winning for any key it does have.
    const merged = { ...fallback, ...primary }
    return {
      locale,
      setLocale,
      languages,
      ...merged,
    }
  }, [locale, setLocale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error(
      '[Locale] useLocale() must be used inside <LocaleProvider>. ' +
        'Wrap your app in main.jsx so the provider sits above the router.'
    )
  }
  return ctx
}

// Sugar: returns just the current dictionary, with the same
// destructuring shape as the old static import. Useful for
// read-only sites that don't need setLocale.
//
//   const { hero, heroChrome } = useT()
//
// Implementation: pull the spread off the context value via
// useLocale, then strip the meta keys (`locale`, `setLocale`,
// `languages`) so destructuring only yields dictionary entries.
const META_KEYS = new Set(['locale', 'setLocale', 'languages'])

export function useT() {
  const ctx = useLocale()
  const dict = {}
  for (const key of Object.keys(ctx)) {
    if (!META_KEYS.has(key)) dict[key] = ctx[key]
  }
  return dict
}
