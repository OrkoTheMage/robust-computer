/**
 * developerPreviews
 *
 * Per-developer portfolio-preview data consumed by the About
 * page (`pages/About.jsx`) and rendered by the
 * `Developer` section (`sections/Developer.jsx`).
 *
 * Each entry is a `preview` object passed to `<Developer>`:
 *
 *   {
 *     domain   — string rendered as the URL bar caption
 *                (e.g. "grue.sh")
 *     image    — optional screenshot asset; when present
 *                it's rendered as the preview body
 *     bg       — preview body background color
 *     fg       — preview body foreground color
 *     font     — 'sans' | 'serif' — drives the preview
 *                body's font-family
 *     children — optional React node rendered when no
 *                screenshot asset is available
 *   }
 *
 * The `bg` / `fg` hex values are the *other* site's chrome,
 * not the Robust Computer brand palette. They stay here
 * instead of in `styles/colors.js` on purpose — adding them
 * to the brand palette would dilute the source-of-truth rule
 * for our own colors.
 *
 * The `children` JSX is per-developer; the entry below
 * imports the project's `AerynPreview` from
 * `sections/Developer/AerynPreview.jsx` so the JSX isn't
 * inlined inside this data file.
 */

import { AerynPreview } from '../components/sections/Developer/AerynPreview'

export const developerPreviews = [
  {
    domain: 'grue.sh',
    image: '/brand/aeryn-preview.png',
    bg: '#0f1115',
    fg: '#eeeeee',
    font: 'sans',
    children: <AerynPreview />,
  },
]
