/**
 * formatPubDate
 *
 * Turns a Field Notes date into "Oct 4, 2026". Date-only
 * `YYYY-MM-DD` values are parsed as local dates so a negative
 * UTC offset does not show the previous day. Anything else is
 * parsed with `Date` and formatted in the runtime timezone.
 * Unparseable input is returned unchanged.
 */

export const formatPubDate = (raw) => {
  if (!raw) return ''
  const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) {
    const [, y, mo, d] = m
    return new Date(+y, +mo - 1, +d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
