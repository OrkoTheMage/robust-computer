/**
 * landing/src/styles/colors.js
 *
 * Single source of truth for every color in the brand. The
 * `colors` object below is the canonical token table; every
 * styled component reads colors from here via `${colors.name}`
 * in its template literal.
 *
 * The CSS layer (`landing/src/styles/index.css` and
 * `server/src/utils/email/layout.js`) mirrors a small subset
 * of these tokens as CSS variables / inline-hex strings,
 * respectively — neither layer can `import` this file, so
 * the same hex values are duplicated there on purpose. When
 * editing a token, update the matching CSS variable /
 * email-palette entry at the same time. The two surfaces
 * are kept in lockstep manually:
 *
 *   - `index.css` `:root` (read by body / page defaults and
 *      the global focus outline)
 *   - `server/src/utils/email/layout.js` `COLOR` (read by
 *      the email templates; the server deploy is rooted at
 *      `server/` and cannot import from `landing/`)
 *
 * Hex values are the brand samples (paper, gold, ink, tie from
 * the original badge — see WebsiteMockups.html). Lowercase hex
 * throughout so the file matches the `var(--name)` lowercase
 * convention the CSS previously used.
 *
 * `Object.freeze` so styled-components can't accidentally
 * reassign a token at runtime.
 */

export const colors = Object.freeze({
  // Brand surface colors
  paper: '#e2dbc8',
  ticket: '#f1ecdd',
  gold: '#d0c096',
  goldDeep: '#a8935a',
  ink: '#000000',
  tie: '#14120e',
  desk: '#efe9d9',

  deskSoft: '#5d5744',

  // Form input surfaces
  inputBg: '#fff8',
  white: '#ffffff',
  placeholderLight: '#6b6450',
  placeholderOnInk: '#7a7260',

  // Overlay dim. Modal uses the heavier scrim; the mobile nav
  // uses a lighter one because the panel itself is the surface.
  scrim: 'rgba(0, 0, 0, 0.65)',
  scrimSoft: 'rgba(0, 0, 0, 0.45)',

  // Syntax colors that have to read on `tie`. Not brand surfaces.
  highlightString: '#a8d5a8',
  highlightNumber: '#e8c170',
  highlightComment: '#7a7260',

  error: '#b00020',
})
