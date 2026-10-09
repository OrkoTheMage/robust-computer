import { getAllByDate, getBySlug, getLatest } from '../data/fieldNotes'

/**
 * Field Notes view selectors.
 *
 * Plain functions over `data/fieldNotes.js`. Not hooks — the
 * lookup is synchronous. Call sites that later need a network
 * source can wrap these without renaming a fake hook.
 *
 * The per-post lead (the line under the post page's
 * `PageHeader` eyebrow) used to come from
 * `getChannelDescription()` here. (`fieldNotes.lead` in `i18n/en.js`
 * and `i18n/es.js`) so a Spanish visitor sees a Spanish
 * channel description; the per-post page now reads it
 * through `useLocale()` directly. The RSS feed still
 * consumes the English string via `CHANNEL_DESCRIPTION` in
 * `data/fieldNotes.js` (the feed is English-only because
 * the posts are English-only).
 */

export const getLatestIssue = () => {
  const latest = getLatest()
  if (!latest) return null
  return {
    title: latest.title,
    pubDate: latest.pubDate,
    description: latest.description,
    to: `/field-notes/${latest.slug}`,
  }
}

export const getIssueBySlug = (slug) => {
  const note = slug ? getBySlug(slug) : null
  if (!note) return null
  return {
    title: note.title,
    issuePrefix: note.issuePrefix,
    pubDate: note.pubDate,
    description: note.description,
    author: note.author ?? null,
    // Per-post social cards. Optional at the field level
    // (see data/fieldNotes.js docstring). `FieldNote.jsx`
    // forwards both to `<SEO image=… twitterImage=… />`;
    // a `null` here resolves to the SEO component's
    // platform-specific fallback (`/og-image.png` /
    // `/twitter-card.png`) via `|| undefined` at the call
    // site. The two fields stay independent so a post can
    // override one without touching the other.
    ogImage: note.ogImage ?? null,
    twitterImage: note.twitterImage ?? null,
    to: `/field-notes/${note.slug}`,
    raw: note.body,
  }
}

export { getAllByDate }
