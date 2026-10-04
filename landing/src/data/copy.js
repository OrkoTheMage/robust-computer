/**
 * landing/src/data/copy.js
 *
 * Static copy tokens used by the home + about pages. Keeping copy
 * out of JSX makes it easy to scan and edit, and means swapping
 * the language later is a single-file change.
 *
 * Plain text — the 0-for-O rule is applied at render time via
 * `utils/zer0.js`. See that file for the single source of truth.
 * Section titles and developer roles are written in title case
 * here (e.g., 'Full-stack developer'); the rendering site calls
 * zer0 on them since the UI uppercases them via CSS.
 */

export const steps = [
  {
    title: 'Scope',
    body: 'We talk through goals and agree what gets built, in writing.',
  },
  {
    title: 'Design',
    body: 'You see the real screens before we write the code.',
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

export const teamFacts = [
  { big: '4+ years', small: 'building for clients' },
  { big: 'Small team', small: 'you talk to the people writing the code' },
  { big: 'Every industry', small: 'from finance to healthcare' },
]

export const developers = [
  {
    name: 'Aeryn',
    role: 'Full-stack developer',
    bio: 'Aeryn builds both sides of an application: React front ends people enjoy using, and the back-end services they depend on. Four years of full-stack work across client projects of every size.',
    stack: ['React', 'Front end', 'Back end', 'APIs'],
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
