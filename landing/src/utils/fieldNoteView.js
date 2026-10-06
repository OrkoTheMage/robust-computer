import { getAllByDate, getBySlug, getChannelDescription, getLatest } from '../data/fieldNotes'

/**
 * Field Notes view selectors.
 *
 * Plain functions over `data/fieldNotes.js`. Not hooks — the
 * lookup is synchronous. Call sites that later need a network
 * source can wrap these without renaming a fake hook.
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
    channelDescription: getChannelDescription(),
    to: `/field-notes/${note.slug}`,
    raw: note.body,
  }
}

export { getAllByDate }
