/**
 * Issue/index.js
 *
 * Re-export surface for the `sections/Issue/` directory
 * The Home page imports the
 * default (the Highlight band); the Contact page and the
 * News archive import the named `IssueSubscribe`.
 *
 *   `import IssueHighlight from '../components/sections/Issue'`
 *     → the Highlight (Home page)
 *
 *   `import { IssueSubscribe } from '../components/sections/Issue'`
 *     → the small subscribe widget (Contact sidebar + News archive)
 *
 * Lives at `sections/Issue/` (not `ui/`) because both
 * pieces are page shells, not generic primitives. Form
 * state is owned by the page and passed in.
 */

export { default } from './Highlight'
export { default as IssueSubscribe } from './Subscribe'
