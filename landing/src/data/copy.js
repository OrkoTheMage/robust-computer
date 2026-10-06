/**
 * landing/src/data/copy.js
 *
 * Single source of truth for all marketing copy on the site. Per
 * the Source of Truth audit:
 *   - Every sentence, headline, lead, value prop, and section title
 *     lives here.
 *   - UI micro-copy (button labels, form labels, placeholders,
 *     captions) stays in the component — it's tied to the
 *     component's structure, not "content".
 *
 * Plain text — the 0-for-O rule is applied at render time via
 * `utils/zer0.js`. Section titles and developer roles are written
 * in title case here (e.g., 'Full-stack developer'); the
 * rendering site calls zer0 on them since the UI uppercases via CSS.
 *
 * Icon names (in Navbar / Services arrays) are strings, not
 * component references. The component maps them to Lucide
 * imports — keeps this file as pure data, no React/Lucide
 * coupling.
 */

import { colors } from '../styles/colors'
import { getLatestNewsPath } from './fieldNotes'

// ── Brand ────────────────────────────────────────────────────────────────
export const footerTagline = ''

// ── Hero ─────────────────────────────────────────────────────────────────
export const hero = {
  headline: 'Custom software, built to last.',
  lead: 'Robust Computer is a small team of developers. We design it, build it, and stay on after launch, so what we ship keeps working long after we hand it over.',
}

// ── Promises (marquee items) ─────────────────────────────────────────────
export const promisesItems = [
  '4+ years building',
  'small team, direct access',
  'fixed scope, clear pricing',
  'support after launch',
  'ship on the agreed date',
  'no surprise invoices',
  'real humans, not chatbots',
  'your code stays yours',
  'tested before it ships',
  'weekly demos, not surprises',
  'Full ownership after delivery',
  'Custom solutions',
]

// ── Services ────────────────────────────────────────────────────────────
export const services = {
  headline: 'What we build',
  lead: "Every project is designed around the client's business, not a template. Small or large, it gets the same care, and it's built to fit how you actually work.",
  items: [
    {
      span: 7,
      bg: colors.ink,
      fg: colors.paper,
      icon: 'MonitorSmartphone',
      title: 'Landing pages and sites',
      body: 'Fast, clear marketing sites that explain what you do and get people to act.',
    },
    {
      span: 5,
      bg: colors.gold,
      fg: colors.ink,
      icon: 'Code2',
      title: 'Custom web apps',
      body: 'Portals, dashboards and internal tools shaped around how your team works.',
    },
    {
      span: 5,
      bg: colors.paper,
      fg: colors.ink,
      icon: 'Boxes',
      title: 'SaaS platforms',
      body: 'Accounts, billing and the product itself, built to scale.',
    },
    {
      span: 7,
      bg: colors.gold,
      fg: colors.ink,
      icon: 'Workflow',
      title: 'Integrations and APIs',
      body: 'Connect the tools you already use so data moves without anyone retyping it.',
    },
  ],
}

// ── Steps ───────────────────────────────────────────────────────────────
export const stepsHeadline = 'How a project runs'
export const stepsLead = "Four steps, no surprises. — You'll always know what's happening and what's next."

export const steps = [
  {
    title: 'Scope',
    body: 'We talk through goals and agree what gets built, priced in a proposal, in writing.',
  },
  {
    title: 'Design',
    body: 'You see design mockups and brand guidelines before we write the code.',
  },
  {
    title: 'Build',
    body: 'Regular updates and working previews, not a surprise at the end.',
  },
  {
    title: 'Launch',
    body: 'We deploy, hand over, and stay on for fixes and new features.',
  },
]

// ── Industries ──────────────────────────────────────────────────────────
export const industriesHeadline = 'Built across industries'

// ── Field Notes ───────────────────────────────────────────────────────────
//
// One product, three labels — picked by context, not by surface:
//
//   - "newsletter"  = the backend / technical name. Used in API
//                     routes, model names, function names, and
//                     code comments on the server.
//
//   - "News"        = the frontend link label. Used wherever the
//                     user clicks to reach the subscription
//                     surface (Navbar main row, Navbar modal,
//                     Footer site column).
//
//   - "Field notes" = the user-facing brand. Used wherever the
//                     thing is mentioned, advertised, or titled
//                     — the home-page Band h2, the per-post
//                     eyebrow, the NewsletterBox headers, the
//                     /field-notes index page title, and the
//                     email content (subject, body, log type).
//                     Sentence case in the UI; CSS uppercases
//                     it via `text-transform`.
//
// The two `NewsletterBox` call sites share the form
// (email input + subscribe button + status caption) but
// differ in framing. Both pairs of strings live here so
// the two pages stay in sync on the only thing they
// actually differ on.
export const fieldNotes = {
  headline: 'Field notes',
  indexTitle: 'Field notes',
  lead: 'Short issues — updates frequently — on building software that lasts. Practical, no spam, unsubscribe any time.',
  contactBox: {
    header: 'Field notes',
    sub: 'Short issues — updates frequently — on building software that lasts.',
  },
  subscribeBox: {
    header: 'Not already Subscribed?',
    sub: "Subscribe to 'Field Notes' today.",
  },
}

// ── CTABand ─────────────────────────────────────────────────────────────
export const ctaBand = {
  headline: 'Work with the team',
  lead: 'Tell us what you are building and who it is for. We will reply within one business day.',
}

// ── Navbar ─────────────────────────────────────────────────────────────
// `icon` is a string (mapped to a Lucide component in Navbar.jsx)
// so this file stays pure data.
export const navbarMobilePages = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
]

export const navbarPages = [
  { to: '/', label: 'Home', hint: 'What we build', icon: 'Home' },
  { to: '/contact', label: 'Start a project', hint: 'Get in touch', icon: 'Send' },
  { to: '/about', label: 'Meet the Team', hint: 'About', icon: 'Users' },
  // News goes to the Field Notes index page (not the latest
  // individual issue) so the modal entry matches the main-nav
  // entry. The per-issue deep link still works through the
  // Hero "Shipped" stamp and the FieldNotes band's
  // "Latest issue" line, both of which read from
  // `useLatestRss`.
  { to: '/field-notes', label: 'News', hint: 'Field notes', icon: 'Newspaper' },
]

export const navbarConnects = [
  {
    href: 'https://github.com/OrkoTheMage/robust-computer',
    label: 'GitHub',
    hint: 'View source',
    external: true,
    icon: 'Github',
    mainBar: true,
  },
  {
    href: 'mailto:hello@robust.computer',
    label: 'Email',
    hint: 'Write to us',
    external: false,
    icon: 'Mail',
  },
  {
    href: '/rss.xml',
    label: 'RSS Feed',
    hint: 'Subscribe',
    external: false,
    icon: 'Rss',
    mainBar: true,
  },
]

export const navbarSocials = [
  {
    href: 'https://linkedin.com/company/robust-computer',
    label: 'LinkedIn',
    hint: 'Follow',
    external: true,
    icon: 'Linkedin',
  },
  {
    href: 'https://www.facebook.com/profile.php?id=61594902219428',
    label: 'Facebook',
    hint: 'Follow',
    external: true,
    icon: 'Facebook',
  },
  {
    href: 'https://www.instagram.com/robust.computer/',
    label: 'Instagram',
    hint: 'Follow',
    external: true,
    icon: 'Instagram',
  },
  {
    href: 'https://x.com/Robust_Computer',
    label: 'X',
    hint: 'Follow',
    external: true,
    icon: 'Twitter',
  },
]

// ── Languages (i18n stub) ────────────────────────────────────────────────
// Drives the language dropdown that opens behind the Languages
// icon in the nav. Top 5 by total speakers (native + L2), per
// the common "most used languages" ranking. English is the
// active language; the other four are disabled placeholders so
// the menu shape is visible before translations actually land.
//
// Non-Latin scripts (zh, hi) will fall back from IBM Plex Mono
// to the browser's system CJK / Devanagari font on the menu row.
// That's a visible inconsistency — see Navbar.jsx for a
// fallback stack you can add to LanguageItem if it bothers you.
export const languages = [
  { code: 'en', label: 'English', available: true, active: true },
  { code: 'es', label: 'Español', available: false },
  { code: 'fr', label: 'Français', available: false },
  { code: 'hi', label: 'हिन्दी', available: false },
  { code: 'zh', label: '中文', available: false },
]

// ── Footer ──────────────────────────────────────────────────────────────
export const footerSections = {
  site: [
    { to: '/', label: 'Home', icon: 'Home' },
    { to: '/about', label: 'About', icon: 'Users' },
    { to: '/contact', label: 'Contact', icon: 'Send' },
    // News goes to the Field Notes index page (not the latest
    // individual issue) so the footer matches the main-nav and
    // modal entries. The per-issue deep link still works
    // through the Hero "Shipped" stamp and the FieldNotes
    // band's "Latest issue" line.
    { to: '/field-notes', label: 'News', icon: 'Newspaper' },
  ],
  connect: [
    { href: 'https://github.com/OrkoTheMage/robust-computer', label: 'GitHub', icon: 'Github' },
    { href: 'mailto:hello@robust.computer', label: 'Email', icon: 'Mail' },
  ],
  elsewhere: [
    { href: 'https://linkedin.com/company/robust-computer', label: 'LinkedIn', icon: 'Linkedin' },
    { href: 'https://www.facebook.com/profile.php?id=61594902219428', label: 'Facebook', icon: 'Facebook' },
    { href: 'https://www.instagram.com/robust.computer/', label: 'Instagram', icon: 'Instagram' },
    { href: 'https://x.com/Robust_Computer', label: 'X', icon: 'Twitter' },
  ],
}

// ── Not Found ───────────────────────────────────────────────────────────
export const notFound = {
  headline: 'Page not found',
  lede: 'That page is not here. The link is old or the URL is wrong.',
}

// ── Team (About page) ───────────────────────────────────────────────────
export const teamFacts = [
  { big: '4+ years', small: 'building for clients' },
  { big: 'Small team', small: 'you talk to the people writing the code' },
  { big: 'Every industry', small: 'from finance to healthcare' },
]

export const developers = [
  {
    name: 'Aeryn',
    role: 'Full-stack developer',
    bio: 'Aeryn builds both sides of an application: React front ends people enjoy using, and the back-end services they depend on. Four years of full-stack work across client projects of every size and variety of industries.',
    stack: ['JavaScript', 'Python', 'React', 'Data Bases', 'APIs'],
    avatar: 'iconVarHappy',
    links: {
      portfolio: 'https://grue.vercel.app/',
      github: 'https://github.com/OrkoTheMage',
      linkedin: 'https://www.linkedin.com/in/aeryn-grindle-5730002b5',
    },
  },
  {
    name: 'Placeholder',
    role: 'Front-end developer',
    bio: 'Short bio goes here: what they care about, what they have shipped, and what clients can hand them with confidence. Two or three sentences is plenty.',
    stack: ['Add', 'Their', 'Stack'],
    avatar: 'iconVarPanicked',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
  {
    name: 'Placeholder',
    role: 'Back-end developer',
    bio: 'Short bio goes here: what they care about, what they have shipped, and what clients can hand them with confidence. Two or three sentences is plenty.',
    stack: ['Add', 'Their', 'Stack'],
    avatar: 'iconVarDead',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
  {
    name: 'Placeholder',
    role: 'Design engineer',
    bio: 'Short bio goes here: what they care about, what they have shipped, and what clients can hand them with confidence. Two or three sentences is plenty.',
    stack: ['Add', 'Their', 'Stack'],
    avatar: 'iconVarUnamused',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
]

// ── Contact ─────────────────────────────────────────────────────────────
export const contactWhatHappens = [
  'We reply within 1-3 business days with questions.',
  'A short call to agree scope and timing.',
  'A written proposal with a fixed price.',
]

// ── Bug Report ──────────────────────────────────────────────────────────
export const bugReportLead = 'Tell us what broke, what you expected, and what actually happened. The form is anonymous-friendly — only the three repro fields are required.'

// ── Privacy (section titles only — body paragraphs stay inline as
//     placeholder legal copy until a real lawyer rewrites them) ──
export const privacySections = [
  'Cookies and analytics',
  'Changes to this policy',
]

// ── Terms (section titles only — body paragraphs stay inline as
//     placeholder legal copy until a real lawyer rewrites them) ──
export const termsSections = [
  'Intellectual property',
  'Engagements and work product',
  'Limitation of liability',
  'Changes to these Terms',
]
