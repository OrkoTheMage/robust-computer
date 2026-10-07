import * as en from './en'
import * as es from './es'
import * as fr from './fr'

/**
 * i18n/index.js
 *
 * Registry of available locales + the language list that drives
 * the language dropdown. The dictionaries map locale code to
 * the per-locale module (a flat bag of strings with the same
 * shape in every locale), and `languages` is the menu metadata
 * — language name, available flag, code. The menu labels are
 * the language's own name, NOT a translation: "English" stays
 * "English" in the Spanish dictionary, and "Español" stays
 * "Español" in the English dictionary. Showing the language
 * in its own script is the multilingual-UI convention and
 * removes any ambiguity for the reader.
 *
 * Adding a new locale:
 *   1. drop `i18n/<code>.js` with the same exports as en.js
 *   2. add a `* as <code> from './<code>'` import above
 *   3. register the module in `dictionaries`
 *   4. add an entry to `languages` with `available: true`
 *      (and flip the new entry to `true` once the translation
 *      is shipped — leave `false` while it's a stub)
 *
 * Adding a new key:
 *   1. add the key to en.js (and any other locale that needs
 *      the value)
 *   2. the LocaleContext falls back to the English value if a
 *      locale is missing a key, so a partial Spanish dict is
 *      safe; the missing key surfaces in English
 *
 * The persisted locale is keyed in localStorage by STORAGE_KEY
 * so the language choice survives a reload. The default
 * (used when no choice is stored and no detection picks a
 * match) is `en` — change DEFAULT_LOCALE only if the site
 * should boot in a different language by default.
 *
 * ── Untranslated by design ──────────────────────────────────────────────
 *
 * A small set of brand / content labels intentionally stay in
 * English across every locale. They live in the per-locale
 * dictionaries with the same English value in every file so
 * the page never accidentally translates them:
 *
 *   - "Robust Computer" — the company name. Brand, not a
 *     translatable term. Same value in every locale file.
 *
 *   - "Field notes" — the name of the Field Notes newsletter /
 *     post series. The eyebrow on every post page, the index
 *     page title, the NewsletterBox header on the contact
 *     sidebar, and the "Subscribe to 'Field Notes' today."
 *     sub on the index subscribe box all render the same
 *     English string. The user-facing chrome AROUND those
 *     labels (`eyebrow` is the eyebrow, `indexTitle` is the
 *     page title, `contactBox.sub` is the descriptive line
 *     under the header) is what gets translated.
 *
 *   - "News" — the navbar / footer / modal link label for
 *     `/field-notes`. Kept as a short English token to read
 *     as a brand label rather than a translated category.
 *     Spanish uses "Notas" for the same slot to preserve
 *     the "short English brand label" feel.
 *
 *   - Issue prefix ("Issue 001") — the "Issue NNN" string
 *     lives on the post itself (`issuePrefix` in
 *     `data/issues/00N.js`), not in the i18n dictionaries.
 *     The post is written once in English; future posts
 *     will likely be English-only as well.
 *
 * ── Field Notes content scope ───────────────────────────────────────────
 *
 * Only the chrome around Field Notes translates. The actual
 * post content (post title, description, body markdown) is
 * authored once in English in `data/issues/00N.js` and is
 * rendered verbatim on every page that surfaces it (the
 * per-post page, the index cards, the Hero ticket, the
 * Field Notes band's "Latest issue" line).
 *
 * That means a Spanish visitor on `/field-notes/issue-001`
 * reads: Spanish page chrome (eyebrow, "Publicado", "Volver
 * al inicio", etc.) + the English post body. Translating
 * posts is a content project, not an i18n plumbing project,
 * and isn't part of chunk 6.
 *
 * If a future post needs a translated version, the post
 * shape in `data/issues/00N.js` will grow a per-locale
 * `bodies` / `titles` map rather than a parallel issue
 * tree — keeps the URL and RSS feed identity in English
 * (one post, one slug) while letting each locale render
 * its own content for that post.
 */

export const dictionaries = { en, es, fr }

export const DEFAULT_LOCALE = 'en'

export const STORAGE_KEY = 'rc:locale'

// Language registry — labels are the language's own name, not
// a translation. `available: false` keeps the entry in the menu
// as a disabled row with a "coming soon" hint (rendered by
// LanguageButton) so the menu shape is visible before every
// translation lands.
//
// `abbr` is the short language code shown on the right of the
// menu row (EN, ES, FR, HI, ZH). Codes are universal so the
// value stays the same across every locale — that's why this
// field lives in the registry rather than in the per-locale
// dictionaries. Override per-entry (e.g. `pt-BR` → `BR`) when
// the same code needs a region-specific short form.
export const languages = [
  { code: 'en', label: 'English',  abbr: 'EN', available: true },
  { code: 'es', label: 'Español',  abbr: 'ES', available: true },
  { code: 'fr', label: 'Français', abbr: 'FR', available: true },
  { code: 'hi', label: 'हिन्दी',   abbr: 'HI', available: false },
  { code: 'zh', label: '中文',      abbr: 'ZH', available: false },
]
