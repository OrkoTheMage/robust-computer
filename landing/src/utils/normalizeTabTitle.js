/**
 * landing/src/utils/normalizeTabTitle.js
 *
 * Normalizes a string for use in the browser tab title
 * (`document.title`). The tab is short, URL-shaped, and
 * shown alongside a tab strip — its casing has to be
 * predictable so a user scanning many tabs can pick out
 * the right one. Hand-typed sources disagree on casing
 * ("field notes" vs "Field Notes") and slug-shaped
 * identifiers are pasted in by URL ("issue-001" instead
 * of "Issue 001"). This helper applies one rule, only
 * when the input "looks broken", so deliberate casing
 * (e.g. "Report a bug", "CUST0M S0FTWARE") is left
 * alone.
 *
 * The rule
 *   The trigger is "looks broken in an objective way":
 *
 *     1. The input is fully lowercase (no capital
 *        letters anywhere) — typical of slug-shaped
 *        values ("issue-001") and lowercase locale
 *        strings ("field notes" smuggled in before
 *        the i18n entry was tightened).
 *     2. OR the input contains a hyphen — a hyphen
 *        almost always means a slug-shaped identifier
 *        ("issue-001", "issue-002") that should be
 *        decomposed into tokens regardless of its
 *        current case.
 *
 *   If neither trigger fires, the input is left alone.
 *   "Report a bug", "Not found", "ABOUT", and
 *   "CUST0M S0FTWARE" all have non-hyphen, mixed-case
 *   characters and pass through unchanged — the rule
 *   doesn't second-guess sentence-case pages or
 *   intentionally-ALL-CAPS brand strings.
 *
 *   When triggered, split on whitespace / hyphen /
 *   underscore, capitalize the first character of each
 *   token, rejoin with single spaces.
 *
 *     normalizeTabTitle('field notes')    // 'Field Notes'
 *     normalizeTabTitle('issue-001')      // 'Issue 001'
 *     normalizeTabTitle('Report a bug')   // 'Report a bug' (unchanged)
 *     normalizeTabTitle('Not found')      // 'Not found'    (unchanged)
 *     normalizeTabTitle('ABOUT')          // 'ABOUT'        (unchanged)
 *
 * Where to apply
 *   `SEO.jsx` runs the candidate tab-title suffix
 *   through this helper before stitching it onto the
 *   `BASE` brand. The og:title / twitter:title form is
 *   NOT normalized — social cards are reviewed by
 *   humans and go through the `title` prop
 *   deliberately. The tab is the auto-leak surface;
 *   this file is the auto-cleanup.
 *
 * Why a util and not a doc-only rule
 *   Each page passes its own string into `tabTitle`
 *   (or auto-defaults from `title`). Source-level
 *   fixes (manually rewriting every locale string and
 *   choosing the right prop in every page) re-open
 *   every time a new post or page is added and the
 *   author forgets Title Case. Centralising the rule
 *   here keeps the brand tab shape consistent as the
 *   project grows — slug-shaped inputs (`tabTitle=
 *   {slug}`), lowercase locale strings, and ad-hoc
 *   JSX copy all flow through the same normalization
 *   on the way to `document.title`.
 */
export const normalizeTabTitle = (s) => {
  if (typeof s !== 'string') return s
  // Whitespace-only is treated as empty: the tab suffix
  // collapses, which SEO.jsx renders as a bare brand
  // tab (`<SEO tabTitle="   " />` → "Robust Computer",
  // not "Robust Computer |   ").
  if (s.trim().length === 0) return ''
  const looksBroken = s.toLowerCase() === s || /-/.test(s)
  if (!looksBroken) return s
  return s
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .map((part) =>
      part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}
