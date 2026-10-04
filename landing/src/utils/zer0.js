/**
 * landing/src/utils/zer0.js
 *
 * SINGLE SOURCE OF TRUTH for the brand's 0-for-O rule.
 *
 * The rule: in uppercase contexts, the Latin capital letter O is
 * rendered as the digit 0. Lowercase o is unaffected.
 *
 * zer0 applies the FULL rule: it first uppercases the input, then
 * replaces every O with 0. The source can be in any case (lowercase,
 * title case, mixed, uppercase) and the result is always the
 * correctly-zer0'd uppercase version. This means the rule works
 * end-to-end regardless of how the source is written or what the
 * surrounding CSS does.
 *
 * Where to apply (DO):
 *   - title lines and headers (h1, h2, h3, h4)
 *   - button labels
 *   - nav links
 *   - tag / chip / badge text
 *   - any text that will be visually uppercase
 *
 * Where NOT to apply (DON'T):
 *   - body copy (paragraphs, list items)
 *   - placeholder text in inputs
 *   - email addresses
 *   - mixed-case content that won't be uppercased
 *
 * @example
 *   zer0('About')              // 'AB0UT'
 *   zer0('open')               // '0PEN'
 *   zer0('Open')               // '0PEN'
 *   zer0('Custom software')    // 'CUST0M S0FTWARE'
 *   zer0('247 open tabs')      // '247 0PEN TABS'
 *   zer0('Privacy Policy')     // 'PRIVACY P0LICY'
 *   zer0('TODO')               // 'T0D0'
 *   zer0('OpenGL')             // '0PENGL' (yes, even camelCase mid-word)
 */
export const zer0 = (str) => String(str).toUpperCase().replace(/O/g, '0')
