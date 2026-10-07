/**
 * XBrand
 *
 * Inline SVG — the X (formerly Twitter) brand wordmark. lucide-react
 * only ships the legacy Twitter bird, and the angular X mark that
 * replaced it in 2023 isn't in any tree-shakable icon library we
 * use. Rather than pull in react-icons for a single glyph, the
 * official x.com path is inlined here.
 *
 * Generic primitive: no project-specific knowledge. Drops into
 * `ICON_MAP` alongside the Lucide imports in Navbar / Footer.
 */

const XBrand = ({ size = 18, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    {...rest}
  >
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.75h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H3.865z" />
  </svg>
)

export default XBrand