/**
 * landing/src/hooks/useRssItem.js
 *
 * Returns the Field Notes post whose slug matches, or
 * `{ item: null, loading: false }` if no match is found. Backed
 * by `data/fieldNotes.js` — the JS array is the single source
 * of truth (the /public/rss.xml is regenerated from the same
 * array, so the per-post page and the feed are always in sync).
 *
 * `slug` is the single-segment id from the route
 *   <Route path="/field-notes/:slug" element={<FieldNote />} />
 * so for the post with `slug="issue-001"` the page passes
 * `slug="issue-001"` in.
 *
 * The shape returned is:
 *   { item, loading }
 *
 *   item — null while no match is found, otherwise:
 *     title              — the post title (without the "Issue NNN - " prefix)
 *     issuePrefix        — "Issue NNN" — surfaced as the kicker above the title
 *     pubDate            — the date string from the source array
 *                          (ISO 8601 date-only, e.g. "2026-10-04")
 *     description        — the one-sentence excerpt (used by SEO, etc.)
 *     author             — the byline string, or null if the post has
 *                          no author. The per-post page renders an
 *                          AuthorFoot when this is truthy
 *     channelDescription — the "what is Field Notes" tagline, used as the
 *                          post page's <PageHeader> lead
 *     to                 — pathname of the post, for canonical links
 *     raw                — the full post body, paragraphs separated by
 *                          blank lines; the page splits on /\n{2,}/
 *
 *   loading — false (synchronous lookup). Kept on the return
 *             shape so the page can keep its existing
 *             `if (loading) { … } if (!item) { … }` branches
 *             without a refactor.
 *
 * Kept as a hook (rather than a plain function) so the call
 * site — FieldNote page — stays uniform with `useLatestRss`.
 */

import { getBySlug, getChannelDescription } from '../data/fieldNotes'

export const formatPubDate = (raw) => {
  if (!raw) return ''
  // For YYYY-MM-DD strings (the canonical form in the data
  // file), parse as a local date so the displayed day matches
  // the typed day. ISO 8601 date-only strings are otherwise
  // parsed as UTC midnight, which would shift the displayed
  // day backward in any negative-offset timezone (e.g.
  // "2026-10-07" formatted in America/Chicago would show
  // "Oct 6, 2026"). The local-time constructor + no timeZone
  // option on the formatter means parse and format round-trip
  // exactly.
  const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) {
    const [, y, mo, d] = m
    return new Date(+y, +mo - 1, +d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  // Fallback for any other date format — parse generically
  // and format in the runtime's local timezone.
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const useRssItem = (slug) => {
  const note = slug ? getBySlug(slug) : null
  if (!note) return { item: null, loading: false }
  return {
    item: {
      title: note.title,
      issuePrefix: note.issuePrefix,
      pubDate: note.pubDate,
      description: note.description,
      author: note.author ?? null,
      channelDescription: getChannelDescription(),
      to: `/field-notes/${note.slug}`,
      raw: note.body,
    },
    loading: false,
  }
}
