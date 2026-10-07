/**
 * Field Notes — Issue 001
 *
 * Syntax checklist. This is the live test surface for the
 * Field Notes markdown pipeline — every block type and
 * every inline syntax the system supports, exercised in
 * one post. If anything below renders wrong, the syntax
 * is broken; the rendered output of this post is the
 * regression test for the parser, the React renderer,
 * and the RSS / plain-text feed builders.
 *
 * Originally the launch post (Issue 001, "New
 * Beginnings"). Replaced with this checklist so the post
 * body doubles as a living reference. The original
 * launch copy lives in the git history.
 *
 * The body is a single CommonMark-flavoured markdown
 * document. Inline backticks inside the body are escaped
 * with `\u0060` because the body is itself a template
 * literal; unescaped backticks would have terminated the
 * template and broken the file.
 *
 * Field shape: see the `fieldNotes` docstring in
 * `data/fieldNotes.js` for the contract every issue must
 * satisfy (slug, title, issuePrefix, pubDate, description,
 * body, author?). Adding FN-NNN is now:
 *   1. drop a new `00N.js` here with the same shape
 *   2. add one import + one entry in `data/fieldNotes.js`
 * Selectors and the build-rss script pick it up from there.
 */

export const issue001 = {
  slug: 'issue-001',
  title: 'Syntax Checklist',
  issuePrefix: 'Issue 001',
  pubDate: '2026-10-06',
  author: 'Aeryn',
  description:
    'Every supported Field Notes feature, exercised in one post',
  body: `
Field Notes syntax checklist — every supported feature, exercised in one post.

![Test image](/field-notes/issue-001/test.jpg)

If anything below renders wrong, the syntax is broken. This is the live test surface for the markdown pipeline: parser, React renderer, RSS feed, plain-text feed.

## Headings

ATX form, 1–6 leading \u0060#\u0060s. Levels 1–4 render as distinct visual styles; 5 and 6 collapse to h4.

# h1 — gold-ticket section stamp
## h2 — section break with bottom border
### h3 — sub-section, no border
#### h4 — small uppercase mono label

## Inline markdown

**bold**, *italic*, ~~strikethrough~~, \u0060inline code\u0060, [link text](https://example.com), <https://example.com>, **bold with *italic* inside** for nesting. An inline image embedded in prose: look at this ![small icon](/icon-var-rss.svg) sitting in the middle of a sentence.

## Blockquote

> A single-line blockquote with \u0060>\u0060 prefix and **inline markdown** inside. Lines are joined with spaces per CommonMark soft-break semantics.

## Code block

The body is a JS template literal, so the triple backticks below are escaped with \u0060.

\u0060\u0060\u0060bash
# Fenced code block, with a language hint
curl -sL "https://www.robust.computer/rss.xml"
\u0060\u0060\u0060

## Lists

Unordered — consecutive \u0060-\u0060 or \u0060*\u0060 lines become one block:

- one
- two
- three

Ordered — consecutive \u00601.\u0060 or \u00601)\u0060 lines become one block:

1. first
2. second
3. third

Mixed markers in the same run split into two blocks (intentional):

- unordered
- another unordered

1. ordered
2. another ordered

## Image (standalone)

A line that is JUST an image becomes its own block — \u0060Figure\u0060 on the slug page, \u0060<img>\u0060 in the RSS feed, \u0060[image: alt]\u0060 placeholder in the plain-text feed.

![Test image, again](/field-notes/issue-001/test.jpg)
`,
}
