/**
 * Shared brand constants.
 *
 * One source for the name, domain, inbox, and timezone. Both
 * config files and the Field Notes feed import this module so a
 * domain change is not a three-file hunt. No Vite APIs — the RSS
 * build script loads it from raw Node.
 */

export const BRAND_NAME = 'Robust Computer'
export const BRAND_DOMAIN = 'robust.computer'
export const BRAND_EMAIL = `hello@${BRAND_DOMAIN}`
export const BRAND_TIMEZONE = 'America/Chicago'

export const FIELD_NOTES_LEAD =
  'Short issues — updates frequently — on building software that lasts. Practical, no spam, unsubscribe any time.'
