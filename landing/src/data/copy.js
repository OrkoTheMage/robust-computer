import { colors } from '../styles/colors'
import { FIELD_NOTES_LEAD } from './brand.js'

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
  lead: FIELD_NOTES_LEAD,
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
  { to: '/field-notes', label: 'News', hint: 'Field notes', icon: 'Newspaper' },
]

export const navbarConnects = [
  {
    href: 'https://github.com/robust-computer/web',
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
    href: 'https://x.com/Robust_Computer',
    label: 'X',
    hint: 'Follow',
    external: true,
    icon: 'X',
  },
  {
    href: 'https://www.instagram.com/robust.computer/',
    label: 'Instagram',
    hint: 'Follow',
    external: true,
    icon: 'Instagram',
  },
  {
    href: 'https://www.facebook.com/profile.php?id=61594902219428',
    label: 'Facebook',
    hint: 'Follow',
    external: true,
    icon: 'Facebook',
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
    { href: 'https://github.com/robust-computer/web', label: 'GitHub', icon: 'Github' },
    { href: 'mailto:hello@robust.computer', label: 'Email', icon: 'Mail' },
  ],
  elsewhere: [
    { href: 'https://linkedin.com/company/robust-computer', label: 'LinkedIn', icon: 'Linkedin' },
    { href: 'https://x.com/Robust_Computer', label: 'X', icon: 'X' },
    { href: 'https://www.instagram.com/robust.computer/', label: 'Instagram', icon: 'Instagram' },
    { href: 'https://www.facebook.com/profile.php?id=61594902219428', label: 'Facebook', icon: 'Facebook' },
  ],
}

// ── Not Found ───────────────────────────────────────────────────────────
export const notFound = {
  headline: 'Page not found',
  lede: 'That page is not here. The link is old or the URL is wrong.',
}

// ── Team (About page) ───────────────────────────────────────────────────
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

export const topBar = {
  nowWith: 'Now with —',
  replies: 'Replies within 1-3 business day',
}

export const subscribeStatus = {
  sending: 'Sending…',
  subscribe: 'Subscribe',
  success: 'Thanks — check your inbox.',
  already: 'Already on the list. No new email sent.',
  error: 'Something went wrong. Try again in a moment.',
  optional: 'Optional. No spam.',
  latestPrefix: 'Latest issue: ',
  latestSuffix: ', read online.',
  latestEmpty: 'Latest issue: placeholder title, read online.',
}

export const contactPage = {
  seoTitle: 'Contact',
  seoDescription: 'Start a project with Robust Computer. Send an enquiry straight to the team inbox — we reply within 1–3 business days.',
  title: 'Start a project',
  lead: "Tell us what you are building. A short message is fine, we will ask the right questions after that. Whether it's a rough idea or a detailed plan, you'll hear back from a developer.",
  enquiryTitle: 'Project enquiry',
  enquiryLead: 'Send an automatic enquiry straight to the team inbox.',
  thankTitle: 'Enquiry sent',
  thankBefore: "Thanks for the details — we'll reply within 1-3 business days from a real person at ",
  thankAfter: '.',
  preferEmailTitle: 'Prefer plain email?',
  preferEmailBody: 'Write to us directly and we will reply from a real person.',
  whatNextTitle: 'What happens next',
  sending: 'Sending…',
  send: 'Send enquiry',
  errorFallback: 'Something went wrong. Please try again.',
}

export const bugReportPage = {
  seoTitle: 'Report a bug',
  seoDescription: 'File a bug report — tell us what broke, what you expected, and what actually happened.',
  title: 'Report a bug',
  sheetTitle: 'Report a bug',
  sheetLead: 'Anonymous-friendly. Only the three repro fields are required.',
  thankTitle: 'Report sent',
  thankBody: "Thanks — the report is in the team's queue. If you left an email, we'll follow up there.",
  sending: 'Sending…',
  send: 'Send report',
}

export const aboutPage = {
  seoTitle: 'About',
  seoDescription: 'Meet the team at Robust Computer — a small studio where you work with the people who write the code.',
  title: 'Meet the Team',
  lead: "Robust Computer is a small team. When you hire us, you work with the people who write the code. Here's who they are and what they bring to your project",
}

export const privacyPage = {
  seoTitle: 'Privacy',
  seoDescription: 'Privacy policy for Robust Computer — what we collect when you visit the site, send an enquiry, or subscribe to Field Notes.',
  title: 'Privacy Policy',
  lead: 'What we collect when you contact us, and what we do with it.',
}

export const termsPage = {
  seoTitle: 'Terms',
  seoDescription: 'Terms of service for the Robust Computer website and any work we deliver.',
  title: 'Terms of Service',
  lead: 'The ground rules for using this site and working with us.',
}

export const fieldNotesPage = {
  empty: "No posts yet — subscribe and you'll get the first one.",
  published: 'Published',
  prev: '‹ Prev',
  next: 'Next ›',
}

export const fieldNotePage = {
  notFoundTitle: 'Not found',
  notFoundLead: 'No post at this URL.',
  eyebrow: 'Field notes',
  back: 'Back to home',
  seoFallbackDescription: 'Field Notes from Robust Computer — short issues on building software that lasts.',
}

export const notFoundPage = {
  seoTitle: 'Not found',
  back: 'Back to home',
}

export const unsubscribePage = {
  seoTitle: 'Unsubscribe',
  seoDescription: 'Unsubscribe from Field Notes — the short-issue newsletter from Robust Computer.',
  loading: 'Unsubscribing…',
  successTitle: "You're off the list",
  successLede: 'will no longer receive Field Notes. Changed your mind? You can resubscribe any time from the home page.',
  errorTitle: "Couldn't unsubscribe",
  errorFallback: 'Something went wrong on our end. Please try again in a moment.',
  brokenTitle: 'This link is broken',
  brokenLede: 'The unsubscribe link is missing the email address. Open the most recent Field Notes email and use the link at the bottom of that message.',
  back: 'Back to home',
}

export const homePage = {
  seoDescription: 'Custom software, built to last. Robust Computer is a small team of developers. We design it, build it, and stay on after launch.',
}

export const heroChrome = {
  start: 'Start a project',
  team: 'Meet the Team',
  buildLog: 'Build log',
  shipped: 'Shipped',
  emptyTicket: '$ curl /latest.txt\n> (no issues yet)',
}

export const footerChrome = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  bug: 'Report a bug',
  tagline: 'Custom software, built to last.',
}
