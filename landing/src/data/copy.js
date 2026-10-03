/**
 * landing/src/data/copy.js
 *
 * Static copy tokens used by the home + about pages. Keeping copy
 * out of JSX makes it easy to scan and edit, and means swapping
 * the language later is a single-file change.
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
    avatar: '/icon.svg',
    links: {
      portfolio: 'https://aeryn.dev',
      github: '#',
      linkedin: '#',
    },
  },
  {
    name: 'Placeholder',
    role: 'Front-end developer',
    bio: 'Short bio goes here: what they care about, what they have shipped, and what clients can hand them with confidence. Two or three sentences is plenty.',
    stack: ['Add', 'Their', 'Stack'],
    avatar: '/icon-alt.svg',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
  {
    name: 'Placeholder',
    role: 'Back-end developer',
    bio: 'Short bio goes here: what they care about, what they have shipped, and what clients can hand them with confidence. Two or three sentences is plenty.',
    stack: ['Add', 'Their', 'Stack'],
    avatar: '/icon.svg',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
]
