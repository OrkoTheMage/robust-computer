import { formatPubDate } from './formatPubDate'
import { heroChrome } from '../i18n/en'

/**
 * formatHeroTicket
 *
 * Build the "ticket" body the Hero panel renders — the
 * short `$ curl /latest.txt` block that lists the most
 * recent Field Notes post. Used by the home page (Home.jsx)
 * via the `getLatestPost` selector, so the ticket text
 * matches the post the Hero's "Shipped" stamp links to.
 *
 * `emptyTicket` is the i18n-aware placeholder rendered
 * when `getLatestPost()` returns null. Defaults to the
 * English string; pages that swap the locale pass a
 * `placeholder` argument so the empty state stays
 * consistent with the rest of the chrome.
 *
 * Layout: three lines — date, title, description — on a
 * `$ curl /latest.txt` prefix. The prefix is the
 * canonical command for "fetch the latest public text
 * file from the site" and matches the same shape the
 * `/latest.txt` symlink serves (see the build-rss
 * script).
 */

export const formatHeroTicket = (latest, placeholder = heroChrome.emptyTicket) => {
  if (!latest) return placeholder
  return `$ curl /latest.txt\n> ${formatPubDate(latest.pubDate)}\n> ${latest.title}\n${latest.description}`
}
