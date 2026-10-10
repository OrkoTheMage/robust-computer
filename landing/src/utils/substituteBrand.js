import { BRAND_NAME, BRAND_EMAIL } from '../data/brand'

/**
 * substituteBrand
 *
 * Replace the brand-name and brand-email placeholders in a
 * string of legal copy with the values from `data/brand.js`.
 * The i18n dictionaries ship the legal text with `[BRAND_NAME]`
 * and `[BRAND_EMAIL]` markers; the page calls this helper
 * before rendering so a brand reskin is a one-file edit
 * (in `data/brand.js`) instead of a hunt through the policy
 * text.
 *
 * Bracketed facts the user still has to fill — date, region,
 * retention period, jurisdiction, SMTP provider — are left
 * untouched. The substitution only fires for the two brand
 * markers, not for the other bracketed placeholders.
 */

export const substituteBrand = (text) => {
  if (typeof text !== 'string') return text
  return text
    .replace(/\[BRAND_NAME\]/g, BRAND_NAME)
    .replace(/\[BRAND_EMAIL\]/g, BRAND_EMAIL)
}
