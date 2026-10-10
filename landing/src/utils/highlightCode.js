import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import plaintext from 'highlight.js/lib/languages/plaintext'

/**
 * highlightCode
 *
 * One-time registration of the highlight.js languages the
 * Field Notes posts reference, plus a `highlight` helper that
 * resolves the language to one of the registered set (with a
 * plaintext fallback for unknown / missing languages) and
 * returns the highlighted HTML. The caller still passes the
 * output through DOMPurify before injecting it.
 *
 * Module-level `hljs.registerLanguage` calls are an
 * intentional side effect: the first `highlight()` call
 * triggers a single registration pass, and every subsequent
 * call reuses the same registered languages. Registered
 * language aliases (`'js'` → javascript, `'md'` → markdown,
 * etc.) cover the wire-format short names the post markdown
 * uses — see `FIELD-NOTES-SYNTAX.md`.
 *
 * Lives in `utils/` because the helper is pure (string in,
 * string out) and the registration pass is a one-time
 * side-effect on module load.
 */

let registered = false

const registerLanguages = () => {
  if (registered) return
  hljs.registerLanguage('javascript', javascript)
  hljs.registerLanguage('js', javascript)
  hljs.registerLanguage('jsx', javascript)
  hljs.registerLanguage('python', python)
  hljs.registerLanguage('py', python)
  hljs.registerLanguage('css', css)
  hljs.registerLanguage('html', xml)
  hljs.registerLanguage('xml', xml)
  hljs.registerLanguage('markdown', markdown)
  hljs.registerLanguage('md', markdown)
  hljs.registerLanguage('plaintext', plaintext)
  hljs.registerLanguage('text', plaintext)
  hljs.registerLanguage('txt', plaintext)
  registered = true
}

export const highlight = (content, requested) => {
  registerLanguages()
  const language = hljs.getLanguage(requested) ? requested : 'plaintext'
  try {
    return hljs.highlight(content, { language }).value
  } catch {
    return content
  }
}
