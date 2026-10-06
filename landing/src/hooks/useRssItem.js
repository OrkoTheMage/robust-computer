/**
 * landing/src/hooks/useRssItem.js
 *
 * Fetches /rss.xml on mount and returns the <item> whose <link>
 * pathname (or <guid>) matches `slug`. Returns `null` while the
 * fetch is in flight, and `null` if no item matches or the fetch
 * fails.
 *
 * `slug` is the single-segment id from the route
 *   <Route path="/field-notes/:slug" element={<FieldNote />} />
 * so for the item with `<link>.../field-notes/issue-000</link>`
 * the page passes `slug="issue-000"` in. The hook matches
 * against `/field-notes/${slug}` below.
 *
 * Reuses the same XML parsing approach as `useLatestRss` — the
 * two hooks could share a single fetcher but it's not worth the
 * indirection until there's a third caller.
 */

import { useEffect, useState } from 'react'

const fieldNotePath = (href) => {
  if (!href) return null
  try {
    return new URL(href, 'https://robustcomputer.example').pathname
  } catch {
    return null
  }
}

const firstSentence = (raw) => {
  const cleaned = raw.replace(/\s+/g, ' ').trim()
  if (!cleaned) return '—'
  const match = cleaned.match(/^.*?[.!?](?=\s|$)/)
  return match ? match[0] : cleaned
}

export const formatPubDate = (raw) => {
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const useRssItem = (slug) => {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    fetch('/rss.xml')
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((xml) => {
        if (cancelled) return
        const doc = new DOMParser().parseFromString(xml, 'application/xml')
        const items = Array.from(doc.querySelectorAll('item'))
        const match = items.find((it) => {
          const linkPath = fieldNotePath(it.querySelector('link')?.textContent ?? '')
          const guid = it.querySelector('guid')?.textContent ?? ''
          return linkPath === `/field-notes/${slug}` || guid === slug
        })
        if (!match) {
          setItem(null)
          return
        }
        const title = match.querySelector('title')?.textContent ?? ''
        // Strip the "Issue 000 - " sort prefix from the title so
        // the page renders just the post name (e.g. "Title" rather
        // than "Issue 000 - Title"). The prefix itself ("Issue 000")
        // is kept aside and surfaced as a "kicker" so the post
        // page can show "FIELD NOTES / Issue 000 / Title".
        const prefixMatch = title.match(/^(Issue \d+)\s*[-—–]\s*/)
        const issuePrefix = prefixMatch ? prefixMatch[1] : ''
        const cleanTitle = title.replace(/^Issue \d+\s*[-—–]\s*/, '')
        const pubDate = match.querySelector('pubDate')?.textContent ?? ''
        const description = firstSentence(
          match.querySelector('description')?.textContent ?? ''
        )
        // Channel-level description (the "about this feed" line
        // in <channel><description>), distinct from the per-item
        // <description> above. Used as the FieldNote page header
        // lead so every post sits under the same "what is Field
        // Notes" tagline.
        const channelDescription = doc.querySelector('channel > description')?.textContent ?? ''
        const to = fieldNotePath(match.querySelector('link')?.textContent ?? '')
        setItem({
          title: cleanTitle,
          issuePrefix,
          pubDate,
          description,
          channelDescription,
          to,
          raw: match.querySelector('description')?.textContent ?? '',
        })
      })
      .catch(() => {
        if (!cancelled) setItem(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])
  return { item, loading }
}
