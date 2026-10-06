/**
 * landing/src/hooks/useLatestRss.js
 *
 * Returns the most recent Field Notes post, or null if the array
 * is empty. Backed by `data/fieldNotes.js` — the JS array is the
 * single source of truth (the /public/rss.xml is regenerated
 * from the same array, so what the Hero ticket and Field Notes
 * band render is always in sync with the feed).
 *
 * The shape returned is:
 *   { title, pubDate, description, to }
 *
 *   title       — the post title (without the "Issue NNN - " prefix)
 *   pubDate     — the ISO 8601 string from the source array
 *   description — the one-sentence excerpt for the post
 *   to         — pathname of the post, suitable for <Link to={…}>
 *
 * `formatPubDate` is a small helper that turns the ISO 8601
 * string into a short human-readable form ("Oct 4, 2026"). It
 * falls back to the raw string if the input can't be parsed.
 *
 * Kept as a hook (rather than a plain function) so the call
 * sites — Hero ticket, Field Notes band's "Latest issue" line —
 * stay uniform with `useRssItem`. Synchronous today; the hook
 * shape means a future async source (CMS, fetch, …) can drop in
 * without touching the consumers.
 */

import { getLatest } from '../data/fieldNotes'

export const formatPubDate = (raw) => {
  if (!raw) return ''
  // For YYYY-MM-DD strings (the canonical form in the data
  // file), parse as a local date so the displayed day matches
  // the typed day. ISO 8601 date-only strings are otherwise
  // parsed as UTC midnight, which would shift the displayed
  // day backward in any negative-offset timezone (e.g.
  // "2026-10-07" formatted in America/Chicago would show
  // "Oct 6, 2026" because UTC midnight Oct 7 is 7pm Oct 6 in
  // CDT). The local-time constructor + no timeZone option on
  // the formatter means parse and format round-trip exactly.
  const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) {
    const [, y, mo, d] = m
    return new Date(+y, +mo - 1, +d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  // Fallback for any other date format (full ISO datetime,
  // RFC 822, etc.) — parse generically and format in the
  // runtime's local timezone. No shift, but no normalization
  // either; this branch is for legacy/external inputs.
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const useLatestRss = () => {
  const latest = getLatest()
  if (!latest) return null
  return {
    title: latest.title,
    pubDate: latest.pubDate,
    description: latest.description,
    to: `/field-notes/${latest.slug}`,
  }
}
