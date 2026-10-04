/**
 * landing/src/hooks/useLatestRss.js
 *
 * Fetches /rss.xml on mount and returns the most recent <item>,
 * or null if the feed is empty (or the fetch fails). Shared by
 * the Hero ticket and the Field Notes "latest issue" link.
 *
 * The shape returned is:
 *   { title, pubDate, description, to }
 *
 *   title       — the <title> text
 *   pubDate     — the raw RFC 822 string from <pubDate>
 *   description — first sentence of the <description>, cleaned
 *   to         — pathname of the <link>, suitable for <Link to={…}>
 *
 * `formatPubDate` is a small helper that turns the RFC 822 string
 * into a short human-readable form ("Oct 3, 2026"). It falls back
 * to the raw string if the input can't be parsed.
 *
 * The fetch is cancelled on unmount so a fast route change doesn't
 * try to set state on an unmounted component.
 */

import { useEffect, useState } from 'react'

// Feed links are absolute (example domain or local). Callers
// inside the app only need the pathname, so we strip the rest.
const fieldNotePath = (href) => {
  if (!href) return null
  try {
    return new URL(href, 'https://robustcomputer.example').pathname
  } catch {
    return null
  }
}

// First sentence, terminator included. If the excerpt never ends
// a sentence, the whole cleaned string is used.
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

export const useLatestRss = () => {
  const [latest, setLatest] = useState(null)
  useEffect(() => {
    let cancelled = false
    fetch('/rss.xml')
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((xml) => {
        if (cancelled) return
        const doc = new DOMParser().parseFromString(xml, 'application/xml')
        const item = doc.querySelector('item')
        if (!item) return
        const title = item.querySelector('title')?.textContent ?? ''
        const pubDate = item.querySelector('pubDate')?.textContent ?? ''
        const description = firstSentence(
          item.querySelector('description')?.textContent ?? ''
        )
        const to = fieldNotePath(item.querySelector('link')?.textContent ?? '')
        setLatest({ title, pubDate, description, to })
      })
      .catch(() => {
        /* fail silently — caller renders its placeholder */
      })
    return () => {
      cancelled = true
    }
  }, [])
  return latest
}
