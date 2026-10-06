/**
 * landing/src/styles/colors.js
 *
 * Single source of truth for every color in the brand. CSS does
 * as little as possible — it only handles @font-face, body/html
 * defaults, and global page behavior. Every component reads
 * colors from here via `${colors.name}` in its styled-component
 * template, so a brand reskin is a single-file edit.
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

  // Desk surface / text variants — were --desk-line, --desk-ink,
  // --desk-soft in the old index.css. Kept here for any future
  // dark-mode work (today nothing imports them — included for
  // parity with the old CSS).
  deskLine: '#14120e',
  deskInk: '#14120e',
  deskSoft: '#5d5744',

  // Form input surfaces
  inputBg: '#fff8',
  placeholderLight: '#6b6450',
  placeholderOnInk: '#7a7260',

  // Form error / validation red — used by Field error slot and
  // the inline error message under form submit buttons.
  error: '#b00020',
})
