/**
 * FieldNotes/index.js
 *
 * Re-export surface for the `FieldNotes/` section. The
 * home page imports the default (the Band); the Contact
 * page and the new `/field-notes` index import the named
 * `NewsletterBox`.
 *
 *   `import FieldNotes from '../components/sections/FieldNotes'`
 *     → the Band (Home page)
 *
 *   `import { NewsletterBox } from '../components/sections/FieldNotes'`
 *     → the small subscribe widget (Contact sidebar + index page)
 *
 * Lives at `sections/FieldNotes/` (not `ui/`) because both
 * pieces own their own state via `useNewsletterForm` /
 * `useLatestRss` — neither is a generic UI primitive.
 */

export { default } from './Band'
export { default as NewsletterBox } from './NewsletterBox'
