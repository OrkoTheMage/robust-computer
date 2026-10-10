/**
 * issues/001.js
 *
 * One Field Notes post. Exported as `issue001` (the binding
 * name matches the filename, the natural read for a
 * magazine-style numbered publication). The shape is the
 * per-post record documented in `data/feed.js`:
 *
 *   {
 *     slug, title, issuePrefix, pubDate, description,
 *     body (markdown), author, ogImage, twitterImage
 *   }
 *
 * Adding IssueNNN is a two-step change:
 *   1. drop a new `issueNNN.js` next to this one, exporting
 *      `issueNNN` with the same shape;
 *   2. add the import + an entry in the `feed` array in
 *      `data/feed.js`.
 *
 * The body is plain markdown. The on-page render path
 * (`sections/PostBody.jsx`) and the RSS / plain-text
 * pipeline (`scripts/build-rss.mjs`) both consume the same
 * `body` field, so the in-page and feed readers produce
 * the same content from the same source.
 */

export const issue001 = {
  slug: 'issue-001',
  title: 'A New Beginning',
  issuePrefix: 'Issue 001',
  pubDate: '2026-10-07',
  author: 'Aeryn',
  description:
    'Welcome to The First Issue of Field Notes',
  ogImage: '/field-notes/issue-001/og.png',
  twitterImage: '/field-notes/issue-001/twitter.png',
  body: `
Welcome to The First Issue of Field Notes

# Hello World
![CDC 721 Terminal (circa 1982)](/field-notes/issue-001/computer.jpg)
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
![Icon](/field-notes/issue-001/icon.png)

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
