/**
 * Shared brand constants.
 *
 * One source for the name, domain, inbox, timezone, logo, and
 * social profile URLs. The Landing's config, the Field Notes
 * feed, the JSON-LD `Organization` block injected by SEO.jsx,
 * the i18n dictionaries (which read BRAND_LINKS so hrefs
 * aren't duplicated), and the build-rss script all read from
 * this module — a profile link or domain change is a
 * one-file edit. The server deploy is rooted at `server/`
 * and mirrors a small subset of these constants locally in
 * `server/src/config.js` because the Railway build can't
 * import from `landing/`. The two stay in sync manually.
 * No Vite APIs — the RSS build script loads it from raw Node.
 *
 * `BRAND_SOCIAL` is consumed by SEO.jsx as the JSON-LD
 * `sameAs` list. The same four URLs also appear in
 * `issues/001.js`'s body — keep them in sync until H-2
 * normalizes the social profiles (the chunk that pins the
 * canonical avatar / bio / pinned post on every platform);
 * once H-2 lands, this module becomes the single source of
 * truth and the in-post body links can be dropped.
 */

export const BRAND_NAME = 'Robust Computer'
export const BRAND_DOMAIN = 'robust.computer'
export const BRAND_EMAIL = `hello@${BRAND_DOMAIN}`
export const BRAND_TIMEZONE = 'America/Chicago'

// Canonical logo asset. Surfaced via SEO.jsx's JSON-LD
// `Organization.logo` so Google's knowledge-panel avatar
// resolves to the brand mark (the square icon), not a
// horizontal banner. SVG so it scales cleanly to whatever
// crop the search result picks. Lives in `landing/public/`
// and is served from `/icons/icon.svg`.
export const BRAND_LOGO_URL = `https://${BRAND_DOMAIN}/icons/icon.svg`

export const FIELD_NOTES_LEAD =
  'Short issues — updates frequently — on building software that lasts. Practical, no spam, unsubscribe any time.'

// Public social profile URLs. Surfaced via JSON-LD `sameAs`
// (the Organization schema) so search engines can correlate
// the brand entity across platforms. Order matches the
// listing in `issues/001.js`'s body so the schema and the
// post body stay visually consistent until H-2 lands.
export const BRAND_SOCIAL = [
  'https://www.instagram.com/robust.computer/',
  'https://x.com/Robust_Computer',
  'https://www.facebook.com/people/Robust-Computer/61594902219428/',
  'https://www.linkedin.com/company/robust.computer',
]

// Per-platform hrefs keyed by the icon-name strings the
// i18n dictionaries (and JSON-LD `sameAs`) reference.
// `email` is the only non-`https` entry — it's the
// `mailto:` link the navbar / footer render when the user
// wants to write to the team.
//
// i18n dictionaries build their `href` from this map (or
// read the same string verbatim) so a profile or inbox
// change is a one-file edit. The map mirrors `BRAND_SOCIAL`
// but adds `github` (not in `BRAND_SOCIAL` because it
// points at the org's source code, not a public profile)
// and `email` (mailto).
export const BRAND_LINKS = {
  github:    'https://github.com/robust-computer/web',
  email:     `mailto:${BRAND_EMAIL}`,
  linkedin:  'https://www.linkedin.com/company/robust.computer',
  x:         'https://x.com/Robust_Computer',
  instagram: 'https://www.instagram.com/robust.computer/',
  facebook:  'https://www.facebook.com/people/Robust-Computer/61594902219428/',
}
