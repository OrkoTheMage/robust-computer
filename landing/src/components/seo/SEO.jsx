import { useEffect } from 'react'
import config from '../../config'
import { useLocale } from '../../context/LocaleContext'
import { normalizeTabTitle } from '../../utils/normalizeTabTitle'
import {
  BRAND_NAME,
  BRAND_DOMAIN,
  BRAND_LOGO_URL,
  BRAND_SOCIAL,
} from '../../data/brand'

/**
 * landing/src/components/seo/SEO.jsx
 *
 * Sets the document <title> and the standard social/SEO meta
 * tags (description, Open Graph, Twitter card, canonical link,
 * tag, JSON-LD Organization) for the lifetime of the calling
 * page, and restores them on unmount. Renders nothing.
 *
 * Why not react-helmet-async: the page only needs to set a
 * handful of tags and we already control every page in the app.
 * A ~60-line component avoids a new dependency + the SSR setup
 * react-helmet-async requires.
 *
 * Usage
 *   <SEO
 *     title="About"
 *     tabTitle="About"
 *     description="Meet the team at Robust Computer."
 *     path="/about"
 *   />
 *
 * Tab title vs og:title
 *   The browser tab and the social-card headline are two
 *   different surfaces and don't have to share a string.
 *   The tab is short and URL-shaped (so users with many
 *   tabs open can pick out "Robust Computer | issue-001"
 *   at a glance); the social card is descriptive and uses
 *   the long brand line so the preview reads as a polished
 *   slice of the page.
 *
 *     - `title`       → drives `og:title` and
 *                       `twitter:title`. Becomes
 *                       "Robust Computer — <title>" via the
 *                       `BASE` + `SEP` (" — ") prefix.
 *     - `tabTitle`    → drives `document.title` only.
 *                       Optional. Falls back to the `title`
 *                       shape (with " | " separator) when
 *                       omitted, and to bare "Robust
 *                       Computer" on the home page where
 *                       `title` is also omitted.
 *
 *   Field-notes posts use this split: og gets
 *   "Robust Computer — Issue 001: A New Beginning" (the
 *   long descriptive form), the tab gets "Robust Computer
 *   | issue-001" (the URL slug). Pages that don't need the
 *   split can omit `tabTitle` and inherit the
 *   `title`-shaped fallback.
 *
 * Tab title normalization
 *   The candidate suffix (the bit after `BASE + TAB_SEP`)
 *   is run through `normalizeTabTitle()` before being
 *   stitched together. The rule fires when the input
 *   "looks broken" — fully lowercase ("field notes") or
 *   hyphen-shaped ("issue-001") — and applies Title Case
 *   to the resulting tokens. Deliberate mixed-case
 *   strings without hyphens ("Report a bug", "CUST0M
 *   S0FTWARE") pass through untouched. og:title /
 *   twitter:title are NOT normalized — the social-card
 *   form is hand-reviewed and goes through the `title`
 *   prop deliberately. See `utils/normalizeTabTitle.js`
 *   for the exact rule.
 *
 * Locale awareness
 *   The component re-runs its effect whenever the locale
 *   changes, so a user who switches the language without
 *   navigating still gets a title/description/og:* set in
 *   the new language on the next tick. The page itself
 *   re-renders with the new copy, and the SEO component
 *   follows in the same React commit. Without this hookup,
 *   a language switch on, say, the home page would change
 *   the visible headline but leave the document title in
 *   the previous language.
 *
 * The `image` and `twitterImage` props are optional and
 * fall back independently to their own platform-specific
 * general cards (`/og-image.png` and `/twitter-card.png`
 * respectively). The two are kept separate — not because
 * authors will always want different artwork, but because
 * the OG ratio (1200×630 ≈ 1.91:1) and the Twitter
 * summary_large_image ratio (1200×675 ≈ 1.78:1) crop
 * differently, and a post may want a different visual on
 * each platform without sharing a one-size-fits-all
 * compromise. The field-notes pages wire both through
 * from the post shape (`item.ogImage`, `item.twitterImage`)
 * with a `|| undefined` so the fallback kicks in when a
 * post only sets one of the two.
 *
 * The `type` prop drives og:type ("website" by default, or
 * "article" for the field-notes post pages).
 *
 * The `path` prop is appended to `config.landingUrl` to build
 * the canonical URL. Omit it for the home page (defaults to
 * the site root).
 *
 * JSON-LD Organization
 *   A single schema.org `Organization` block is injected
 *   into <head> on every page. The block is locale-agnostic
 *   (it's the brand entity, not page content) and is also
 *   embedded as a static `<script type="application/ld+json">`
 *   in `landing/index.html` so the JS-disabled first paint
 *   matches the post-mount DOM. Identifiers and links come
 *   from `data/brand.js` (BRAND_NAME, BRAND_DOMAIN,
 *   BRAND_LOGO_URL, BRAND_SOCIAL) so the JSON-LD is the same
 *   single source of truth as every other brand surface.
 *   The og:title / twitter:title `BASE` prefix is also read
 *   from `data/brand.js` (BRAND_NAME) so the title bar and
 *   the JSON-LD always agree on the brand name.
 */

// `BASE` is the brand name. Read from `data/brand.js`
// (BRAND_NAME) so a brand reskin is a one-file edit. The
// brand name is untranslated across every locale (see
// i18n/index.js "Untranslated by design") so the title
// prefix is the same English string in every locale. The
// full document title shown when no `title` prop is passed
// (i.e. on the home page) is read from the active locale's
// i18n dict (`homePage.seoTitle`); the English-only value
// is also the static fallback in `landing/index.html` <title>
// (which has no access to the React context).
//
// The 0-for-O rule (see `utils/zer0.js`) is applied to the
// tagline half in each locale — the home title is rendered
// uppercase in the browser tab, so a visitor who recognises
// the headline from the hero sees the same brand styling
// there. Other pages keep the un-zer0'd title prop.
const BASE = BRAND_NAME
// `SEP` (em-dash with spaces) joins the brand to the page
// name in og:title / twitter:title. The browser tab uses
// `TAB_SEP` (pipe with spaces) instead — the pipe keeps
// many-open-tabs readable where an em-dash would blend
// into the brand on the right of the tab. Two surfaces,
// two separators; see the docstring "Tab title vs
// og:title" above.
const SEP = ' — '
const TAB_SEP = ' | '

// Site-wide social card. Two artifacts live at the site
// root and serve as the general og:image / twitter:image
// fallback:
//   - `/og-image.png`     — 1200×630, the OG / Facebook /
//                           LinkedIn / Slack target
//   - `/twitter-card.png` — 1200×600 (or 1200×675), the
//                           Twitter summary_large_image target
//
// Both files live in `landing/public/` so Vite serves them
// from the site root. Pages that need a different visual
// override via the `image` / `twitterImage` props. The two
// cards live at their own URLs because the OG ratio
// (1200×630 ≈ 1.91:1) and the Twitter summary_large_image
// ratio (1200×675 ≈ 1.78:1, or 2:1) crop differently —
// the two artifacts are designed for their target
// platform's preview shape rather than shared as a
// one-size-fits-all compromise.
//
// The two static `landing/index.html` <head> tags point at
// the same two files, so the JS-disabled first paint
// matches the social-platform preview the SEO component
// produces.
const DEFAULT_IMAGE = `${config.landingUrl}/og-image.png`
const DEFAULT_TWITTER_IMAGE = `${config.landingUrl}/twitter-card.png`

const setMeta = (selector, attr, value) => {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [key, val] = selector.match(/\[(\w+)="(\w+)"\]/)?.slice(1) ?? []
    if (key) el.setAttribute(key, val)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

const setLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// Inject (or replace) a `<script type="application/ld+json">`
// block in <head>. JSON-LD is locale-agnostic, so we re-set
// it on every effect cycle to the same content — there's no
// per-page branch and no per-locale branch, just one
// Organization block on every page.
const setJsonLd = (id, payload) => {
  let el = document.head.querySelector(`script[type="application/ld+json"][data-ld="${id}"]`)
  if (!el) {
    el = document.createElement('script')
    el.setAttribute('type', 'application/ld+json')
    el.setAttribute('data-ld', id)
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(payload)
}

const SEO = ({ title, tabTitle, description, path, image = DEFAULT_IMAGE, twitterImage = DEFAULT_TWITTER_IMAGE, type = 'website' }) => {
  // Home page (no title prop) renders the active locale's
  // `homePage.seoTitle` instead of just BASE so the og
  // headline carries the full brand line — the SEO report
  // flagged the previous "Robust Computer" as too thin for
  // a search snippet. Other pages prepend the brand to the
  // page's `title` prop with the " — " separator. `fullTitle`
  // powers og:title + twitter:title only; the browser tab
  // is built separately as `browserTabTitle` below.
  //
  // The default description is the active locale's
  // `homePage.seoDescription` so a brand / tagline update
  // is a one-file edit. Pages that ship translated copy
  // override it with their own i18n `seoDescription` field
  // (passed in via the `description` prop).
  const { locale, homePage } = useLocale()
  const fullTitle = title ? `${BASE}${SEP}${title}` : homePage.seoTitle
  const resolvedDescription = description || homePage.seoDescription

  // `browserTabTitle` powers `document.title` only. Two
  // surfaces, two rules:
  //
  //   1. `tabTitle` passed explicitly → BASE + TAB_SEP +
  //      normalized `tabTitle`. Empty → bare BASE. Field-
  //      notes posts pass the URL slug here and rely on
  //      the normalization to render "Issue 001" instead
  //      of the raw "issue-001".
  //
  //   2. `tabTitle` not passed → mirror the `title` shape
  //      but switch the separator (` | ` instead of ` — `),
  //      then run the suffix through the same normalizer.
  //      Home (`title` also missing) → bare BASE.
  //
  // `normalizeTabTitle` fires when the input "looks
  // broken" — fully lowercase, hyphen-shaped, or both —
  // and leaves mixed-case-without-hyphen input
  // ("Report a bug", "CUST0M S0FTWARE") untouched. See
  // `utils/normalizeTabTitle.js` for the exact rule.
  const tabSuffix = tabTitle !== undefined
    ? (tabTitle ? normalizeTabTitle(tabTitle) : '')
    : (title ? normalizeTabTitle(title) : '')
  const browserTabTitle = tabSuffix
    ? `${BASE}${TAB_SEP}${tabSuffix}`
    : BASE
  const url = path ? `${config.landingUrl}${path}` : config.landingUrl
  // og:image and twitter:image want absolute URLs. Each prop
  // accepts either an absolute URL or a site-rooted path;
  // when relative, it's prepended with `config.landingUrl`.
  // The two cards are kept on their own prop surface so a
  // post can ship platform-specific artwork without sharing
  // a one-size-fits-all compromise (see the docstring above
  // for the ratio mismatch).
  const absoluteImage = image.startsWith('http') ? image : `${config.landingUrl}${image}`
  const absoluteTwitterImage = twitterImage.startsWith('http') ? twitterImage : `${config.landingUrl}${twitterImage}`
  // The home page's <meta name="tag"> comes from the i18n
  // dict so each locale gets a localised short keyword
  // string. The static `landing/index.html` carries the
  // English-only fallback (same value the home page renders
  // before React mounts).
  const tag = homePage.tag

  useEffect(() => {
    const previousTitle = document.title

    // <title> (browser tab only). `fullTitle` (the og/
    // twitter headline) is intentionally NOT written here —
    // social cards and the tab don't share a string. See
    // `browserTabTitle` above for the rules.
    if (browserTabTitle !== previousTitle) document.title = browserTabTitle

    // Standard meta description
    setMeta('meta[name="description"]', 'content', resolvedDescription)

    // Open Graph — driven by `fullTitle`, not the tab form,
    // so the social card stays the descriptive branded
    // line even on pages where the tab diverges.
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', resolvedDescription)
    setMeta('meta[property="og:image"]', 'content', absoluteImage)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[property="og:type"]', 'content', type)
    setMeta('meta[property="og:site_name"]', 'content', BASE)

    // Twitter card. summary_large_image for the wide banner;
    // twitter:image points at its own dedicated artifact
    // (DEFAULT_TWITTER_IMAGE) unless the page passes a
    // `twitterImage` prop (field-notes posts forward
    // `item.twitterImage` so per-slug artwork is supported).
    // The two cards stay on their own URLs because the OG
    // ratio (1200×630) and the Twitter ratio (1200×675) crop
    // differently — the field-notes shape keeps them as
    // separate optional fields for the same reason.
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', resolvedDescription)
    setMeta('meta[name="twitter:image"]', 'content', absoluteTwitterImage)

    // Site tag. Optional per the SEO report ("Tag is missing
    // but optional") — the major search engines don't read
    // it, but a handful of smaller crawlers and the
    // semantic-web Linter tools do, so the value is a short
    // localised keyword string pulled from `homePage.tag`.
    setMeta('meta[name="tag"]', 'content', tag)

    // Canonical URL (SEO best practice; prevents duplicate-content
    // issues when the same page is reachable at multiple paths)
    setLink('canonical', url)

    // JSON-LD Organization. Single block on every page —
    // locale-agnostic, so the same payload is set on every
    // effect cycle. The static `landing/index.html` carries
    // the same block so the JS-disabled first paint matches.
    setJsonLd('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: BRAND_NAME,
      url: `https://${BRAND_DOMAIN}/`,
      logo: BRAND_LOGO_URL,
      sameAs: BRAND_SOCIAL,
    })

    return () => {
      // Restore the previous title on unmount so the next page
      // starts from a known state. The meta tags get overwritten
      // by the next SEO instance on the next render, so we
      // don't bother restoring them individually. Restore
      // against the string we wrote (`browserTabTitle`), not
      // the og headline, since the two are no longer the same.
      if (document.title === browserTabTitle) document.title = previousTitle
    }
  }, [browserTabTitle, fullTitle, resolvedDescription, url, absoluteImage, absoluteTwitterImage, type, tag, locale])

  return null
}

export default SEO
