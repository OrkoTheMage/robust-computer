/**
 * i18n/en.js
 *
 * English dictionary. Single source of truth for every string the
 * landing renders as copy — section headlines, button labels, nav
 * links, form fields, error states, aria labels, microcopy, page
 * titles and leads. The `useLocale()` hook in `context/LocaleContext`
 * spreads these exports into its context value, so any page or
 * component reads them through `const { hero } = useLocale()`.
 *
 * Structure: this file mirrors the shape `data/copy.js` used to hold.
 * The Spanish dictionary (`i18n/es.js`) exports the same keys. Add
 * a new key to both files at the same time; a missing key on one
 * side falls back to the other (via the dictionary lookup in the
 * LocaleContext), but a missing key on both surfaces as the raw
 * key in the UI, which is a bug.
 *
 * The 0-for-O rule is applied at render time via `<Zer0Text>` and
 * `utils/zer0.js`. It only makes sense for Latin scripts; the
 * rule's docs already call out that it should be skipped on
 * non-Latin scripts. As long as only `en` and `es` are live
 * (both Latin), `<Zer0Text>` is correct everywhere.
 *
 * Plain text everywhere. No React, no JSX, no Lucide imports —
 * keeps this file a pure data module that the build-rss script
 * can also consume if it ever needs to.
 */

// ── Brand ────────────────────────────────────────────────────────────────
//
// `tagline` is the small line under the wordmark in the footer
// brand column. Empty by default — the footer's own tagline
// (`footerChrome.tagline`) sits in the small bottom strip and
// reads as the "site tagline" without duplicating it here.
export const brand = {
  tagline: '',
}

// ── Hero ─────────────────────────────────────────────────────────────────
export const hero = {
  headline: 'Custom software, built to last.',
  lead: 'Robust Computer is a small team of developers. We design it, build it, and stay on after launch, so what we ship keeps working long after we hand it over.',
}

// ── Hero chrome ──────────────────────────────────────────────────────────
//
// The "chrome" keys are short strings that hang off the hero
// specifically: button labels, the build-log ticket header, the
// "shipped" stamp, the empty-ticket placeholder, and the
// "Release X.Y.Z" string built from package.json. The CTABand
// reuses `start` for its gold button on the about page.
export const heroChrome = {
  start: 'Start a project',
  team: 'Meet the Team',
  buildLog: 'Build log',
  shipped: 'Shipped',
  emptyTicket: '$ curl /latest.txt\n> (no issues yet)',
  releasePrefix: 'Release',
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
      bg: 'ink',
      fg: 'paper',
      icon: 'MonitorSmartphone',
      title: 'Landing pages and sites',
      body: 'Fast, clear marketing sites that explain what you do and get people to act.',
    },
    {
      span: 5,
      bg: 'gold',
      fg: 'ink',
      icon: 'Code2',
      title: 'Custom web apps',
      body: 'Portals, dashboards and internal tools shaped around how your team works.',
    },
    {
      span: 5,
      bg: 'paper',
      fg: 'ink',
      icon: 'Boxes',
      title: 'SaaS platforms',
      body: 'Accounts, billing and the product itself, built to scale.',
    },
    {
      span: 7,
      bg: 'gold',
      fg: 'ink',
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

// Industry chips on the home page. Static content (not interactive
// filters), so this list lives with the other copy and the page
// just maps over it.
export const industries = [
  'Finance',
  'Healthcare',
  'Retail',
  'Hospitality',
  'Education',
  'Logistics',
  'Non-profit',
  'Professional services',
]

// ── Field Notes ──────────────────────────────────────────────────────────
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
//   - "Field Notes" = the user-facing brand. Used wherever the
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
  headline: 'Field Notes',
  indexTitle: 'Field Notes',
  lead: 'Short issues — updates frequently — on building software that lasts. Practical, no spam, unsubscribe any time.',
  contactBox: {
    header: 'Field Notes',
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
//
// `icon` is a string (mapped to a Lucide component in Navbar.jsx)
// so this file stays pure data.
export const navbarMobilePages = [
  { to: '/field-notes', label: 'News' },
  { to: '/about', label: 'About' },
]

export const navbarPages = [
  { to: '/', label: 'Home', hint: 'What we build', icon: 'Home' },
  { to: '/contact', label: 'Start a project', hint: 'Get in touch', icon: 'Send' },
  { to: '/about', label: 'Meet the Team', hint: 'About', icon: 'Users' },
  { to: '/field-notes', label: 'News', hint: 'Field Notes', icon: 'Newspaper' },
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

// ── Navbar chrome ───────────────────────────────────────────────────────
//
// Strings that hang off the navbar shell but aren't part of the
// page list — the modal's title/sub/section dividers, the mobile
// panel's aria labels, the open/close button labels. Kept
// separate from `navbarPages` so the page list reads as a clean
// data file (one entry per page) and the chrome stays grouped.
export const navChrome = {
  menu: {
    title: 'Menu',
    sub: 'Jump anywhere',
    pagesHeader: 'Pages',
    connectHeader: 'Connect',
    elsewhereHeader: 'Elsewhere',
  },
  // Short labels for the two inline main-bar links that sit
  // between the brand stack and the icon cluster. The
  // mobile panel reads its labels from `navbarMobilePages`
  // (per-entry) and the site-menu modal reads from
  // `navbarPages` (per-entry) — those two paths don't go
  // through these keys, only the inline main bar does.
  about: 'About',
  news: 'News',
  openSiteMenu: 'Open site menu',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
}

// ── Language button chrome ──────────────────────────────────────────────
//
// aria labels, the tooltip text, and the "coming soon" hint shown
// beside disabled entries in the language menu. The `languages`
// list itself lives in `i18n/index.js` (the entry labels are the
// language's own name, not a translation, so they belong with
// the language registry rather than a per-locale dictionary).
export const languageChrome = {
  ariaLabel: 'Language',
  tooltip: 'Language',
  modalAriaLabel: 'Language',
  comingSoon: '(coming soon)',
}

// ── Footer ─────────────────────────────────────────────────────────────
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

// Footer chrome — section headers, legal row, bottom-strip tagline.
// Mirrors the structure of `navChrome`: a small bag of strings
// the footer reads alongside `footerSections`.
export const footerChrome = {
  site: 'Site',
  connect: 'Connect',
  elsewhere: 'Elsewhere',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  bug: 'Report a bug',
  tagline: 'Custom software, built to last.',
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
    role: 'Resident Developer',
    bio: 'Aeryn builds both sides of an application: React front ends people enjoy using, and the back-end services they depend on. Four years of full-stack work across client projects of every size and variety of industries.',
    stack: ['JavaScript', 'Python', 'React', 'MongoDB/SQL', 'APIs'],
    avatar: 'iconVarDead',
    links: {
      portfolio: 'https://grue.vercel.app/',
      github: 'https://github.com/OrkoTheMage',
      linkedin: 'https://www.linkedin.com/in/aeryn-grindle-5730002b5',
    },
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

// ── TopBar ──────────────────────────────────────────────────────────────
export const topBar = {
  nowWith: 'Now with —',
  replies: 'Replies within 1-3 business day',
}

// ── Subscribe widget status ─────────────────────────────────────────────
//
// Drives every status caption rendered under the email field on
// the home page Field Notes band and the NewsletterBox widget on
// the Contact sidebar and the /field-notes index. The component
// switches on `status` from the `useNewsletterForm` hook; this
// object is the lookup table.
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

// ── Form chrome ─────────────────────────────────────────────────────────
//
// Field labels, placeholders, chip options, and "what happens next"
// group labels. The contact and bug-report forms each render a
// small set of these; centralizing them here keeps the two pages
// in sync on the labels that overlap (e.g. "Your name", "Email").
export const fields = {
  email: 'Email',
  emailAddress: 'Email address',
  yourName: 'Your name',
  company: 'Company or project',
  message: 'Tell us more',
  whatDoing: 'What were you doing?',
  whatExpected: 'What did you expect?',
  whatHappened: 'What actually happened?',
  browserDevice: 'Browser + device',
}

export const placeholders = {
  fullName: 'Full name',
  email: 'you@company.com',
  optional: 'Optional',
  messageContact: 'What problem should it solve, and who will use it?',
  stepsRepro: 'Steps to reproduce — the page, the click, the input.',
  whatExpected: 'What should have happened.',
  whatHappened: 'The actual behavior — error messages, broken layout, etc.',
  browserDevice: 'e.g. Chrome 119 on macOS 14, iPhone 15 Safari',
}

// Project-type chips on the contact form. `value` is the wire
// format sent to the server (the route handler maps it back to
// a label here for display).
export const projectTypes = [
  { value: 'landing', label: 'Landing page' },
  { value: 'webapp', label: 'Web app' },
  { value: 'saas', label: 'SaaS platform' },
  { value: 'unsure', label: 'Not sure yet' },
]

// Budget chips. Same wire-format pattern.
export const budgets = [
  { value: 'under_5k', label: 'Under 5k' },
  { value: '5k_15k', label: '5k to 15k' },
  { value: '15k_50k', label: '15k to 50k' },
  { value: '50k_plus', label: '50k+' },
]

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
  whatAreYouBuilding: 'What are you building?',
  roughBudget: 'Rough budget',
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

// ── Field Notes pagination ──────────────────────────────────────────────
//
// Visible prev/next labels and the aria labels for the page
// buttons. The "go to page N" label is built from a function
// (called with the page number) so the string can be assembled
// with the right number in any locale's grammar.
export const fieldNotesPage = {
  empty: "No posts yet — subscribe and you'll get the first one.",
  published: 'Published',
  prev: '‹ Prev',
  next: 'Next ›',
  previousPageLabel: 'Previous page',
  nextPageLabel: 'Next page',
  goToPage: (n) => `Go to page ${n}`,
}

export const fieldNotePage = {
  eyebrow: 'Field Notes',
  back: 'Back to home',
  publishedLabel: 'Published',
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
  // The error-state lede appends the email if we have one so
  // the user can confirm which address failed. Built from a
  // function so the sentence can be assembled in any locale's
  // grammar.
  errorEmailSuffix: (email) => ` Trying to unsubscribe ${email}.`,
  defaultError: 'Could not unsubscribe right now. Try again in a moment.',
}

export const homePage = {
  seoTitle: 'Robust Computer — CUST0M S0FTWARE, BUILT T0 LAST.',
  seoDescription: 'Custom software, built to last. Robust Computer is a small team of developers. We design it, build it, and stay on after launch.',
  tag: 'custom software',
}

// ── Form errors ─────────────────────────────────────────────────────────
//
// Fallback messages shown by the form hooks when the network call
// fails outright (i.e. when the server didn't get a chance to send
// a friendly error of its own). The hooks also surface server
// errors verbatim — those are server-controlled and don't go
// through the i18n system.
export const formErrors = {
  contactFallback: 'Could not send the enquiry. Please try again.',
  bugFallback: 'Could not send the report. Please try again.',
  newsletterFallback: 'Something went wrong. Please try again.',
}
