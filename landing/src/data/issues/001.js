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
  title: 'A New Beginning',
  issuePrefix: 'Issue 001',
  pubDate: '2026-10-07',
  author: 'Aeryn',
  description:
    'Welcome to The First Issue of Field Notes',
  body: `
Welcome to The First Issue of Field Notes

# Hello World
![CDC 721 Terminal (circa 1982)](/public/field-notes/issue-001/computer.jpg)
### Introduction

In this issue, we will explore the basics of our publication and what you can expect in future issues.

### What to Expect

In future issues, you can look forward to **tech-based topics**, shipped projects, pitfalls and lessons learned from our team. We aim to provide valuable content for developers of all levels. No marketing copy passed off as engineering *wisdom* — ***No bull******

## How to Read 

You can read 'Field Notes' on the [official website](https://www.robust.computer/field-notes). 
Each issue will have its own slug (e.g., \u0060\u0060\u0060issue-001\u0060\u0060\u0060) which you can access directly via its [URL](https://www.robust.computer/field-notes/issue-001).
You can also read our RSS feed via [XML](https://www.robust.computer/rss.xml) or as [plain-text](https://www.robust.computer/feed.txt).
### RSS snippet

\u0060\u0060\u0060bash
# Fetch the RSS feed for Field Notes
# /latest.xml (symlink to the latest RSS feed)
curl -s https://www.robust.computer/rss.xml

# Fetch the plain-text feed for Field Notes
# /latest.txt (symlink to the latest plain-text feed)
curl -s https://www.robust.computer/feed.txt 
\u0060\u0060\u0060

## How to Subscribe

You can subscribe to 'Field Notes' via the [index](https://www.robust.computer/field-notes), or directly via the [RSS feed](https://www.robust.computer/rss.xml). 
We'll keep you updated with the latest issues through these channels. 
![Icon](/public/field-notes/issue-001/icon.png)

- If you're subscribed via email you'll receive updates directly in your inbox. (still working out the kinks — might end up in spam)
- If you're subscribed via RSS or plain-text feeds, you'll receive updates through your preferred feed reader.
- If you follow us on social media, you'll receive updates through those platforms as well.  


### Social Media Links: 
 
- [Instagram](https://www.instagram.com/robust.computer/)
- [X](https://x.com/Robust_Computer)
- [Facebook](https://www.facebook.com/people/Robust-Computer/61594902219428/)
- [LinkedIn](https://www.linkedin.com/company/robust.computer)

> Honestly — I appreciate your support. I look forward to keeping this publication up-to-date. I wanted it, nobody else asked for it, but I made it mine. So here it is, thank you for reading.
`,
}
