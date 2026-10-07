import { useEffect } from 'react'
import config from '../../config'
import { useLocale } from '../../context/LocaleContext'

/**
 * landing/src/components/seo/SEO.jsx
 *
 * Sets the document <title> and the standard social/SEO meta
 * tags (description, Open Graph, Twitter card, canonical link)
 * for the lifetime of the calling page, and restores them on
 * unmount. Renders nothing.
 *
 * Why not react-helmet-async: the page only needs to set a
 * handful of tags and we already control every page in the app.
 * A ~60-line component avoids a new dependency + the SSR setup
 * react-helmet-async requires.
 *
 * Usage
 *   <SEO
 *     title="About"
 *     description="Meet the team at Robust Computer."
 *     path="/about"
 *   />
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
 * The `image` prop is optional; defaults to the wide banner
 * (banner2-cut.svg) which reads well as a Twitter
 * summary_large_image card and an OG image at 1200×630.
 *
 * The `type` prop drives og:type ("website" by default, or
 * "article" for the field-notes post pages).
 *
 * The `path` prop is appended to `config.landingUrl` to build
 * the canonical URL. Omit it for the home page (defaults to
 * the site root).
 */

// `BASE` is the brand name. "Robust Computer" is untranslated
// across every locale (see i18n/index.js "Untranslated by
// design") so the title prefix is the same English string in
// every locale.
const BASE = 'Robust Computer'
const SEP = ' | '

// Default description for any page that doesn't pass one.
// Kept short (~155 chars) so it isn't truncated by Twitter
// or Facebook's preview cards. Same string in every locale
// for the same reason as BASE: this is the rare fallback
// path, and the English wording is the most likely to
// render usefully in a search snippet. Pages that ship
// translated copy override this with their i18n
// `seoDescription` field.
const DEFAULT_DESCRIPTION =
  'Robust Computer is a small team of developers. We design it, build it, and stay on after launch.'

// Wide banner used as the default og:image. The file lives in
// /public so it's served as-is from the site root, and SVG is
// accepted by the major social platforms (Twitter, Facebook,
// LinkedIn) for og:image and twitter:image as of 2023+.
//
// If a future page needs a different visual (e.g. a field-note
// post with a per-post image), pass an absolute or root-relative
// URL via the `image` prop and it'll override this default.
const DEFAULT_IMAGE = `${config.landingUrl}/banner2-cut.svg`

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

const SEO = ({ title, description = DEFAULT_DESCRIPTION, path, image = DEFAULT_IMAGE, type = 'website' }) => {
  const fullTitle = title ? `${BASE}${SEP}${title}` : BASE
  const url = path ? `${config.landingUrl}${path}` : config.landingUrl
  // og:image and twitter:image want absolute URLs.
  const absoluteImage = image.startsWith('http') ? image : `${config.landingUrl}${image}`
  // Track the locale so the effect re-runs on language change.
  // The page's title/description props are themselves read from
  // the i18n dict, so when those props change the effect
  // already re-runs; subscribing to locale is belt-and-braces
  // for the case where a page re-uses the same prop value
  // across a language switch (e.g. an untranslated brand
  // label) but the user-visible body changed.
  const { locale } = useLocale()

  useEffect(() => {
    const previousTitle = document.title

    // <title>
    if (fullTitle !== previousTitle) document.title = fullTitle

    // Standard meta description
    setMeta('meta[name="description"]', 'content', description)

    // Open Graph
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:image"]', 'content', absoluteImage)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[property="og:type"]', 'content', type)
    setMeta('meta[property="og:site_name"]', 'content', BASE)

    // Twitter card. summary_large_image for the wide banner;
    // pages with smaller square images can override via a prop
    // (not wired up yet — the default banner works for all).
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', description)
    setMeta('meta[name="twitter:image"]', 'content', absoluteImage)

    // Canonical URL (SEO best practice; prevents duplicate-content
    // issues when the same page is reachable at multiple paths)
    setLink('canonical', url)

    return () => {
      // Restore the previous title on unmount so the next page
      // starts from a known state. The meta tags get overwritten
      // by the next SEO instance on the next render, so we
      // don't bother restoring them individually.
      if (document.title === fullTitle) document.title = previousTitle
    }
  }, [fullTitle, description, url, absoluteImage, type, locale])

  return null
}

export default SEO
