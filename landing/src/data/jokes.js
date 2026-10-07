/**
 * landing/src/data/jokes.js
 *
 * Software-dev taglines shown in the home topbar, picked at random
 * per page load. Modeled on the "random tip" pattern from the
 * Minecraft main menu (format only, not the visuals).
 *
 * Plain text — the 0-for-O rule is applied at render time via
 * `utils/zer0.js`, not baked into the source. See that file for the
 * single source of truth.
 *
 * Selection criteria: each joke has to be unambiguously a joke.
 * Nothing that could pass as a real feature claim or marketing
 * tagline. If "Now with — X" could be re-read as a product
 * promise, it's too soft and gets cut.
 */

export const jokes = [
  '247 open tabs',
  'Homies Games!',
  'Protocodex!',
  'AI we don\u2019t understand',
  'unhandled rejections',
  'more bugs than features',
  'a Jira we don\u2019t use',
  'the Konami code',
  'xyzzy',
  'Java. The drink; not the language',
  '0% documentation',
  'a merge conflict in package-lock.json',
  'copy-pasted Stack Overflow answers',
  'a working KUDA driver',
  'a Friday 4:59pm deploy',
  'a jQuery plugin from 2013',
  'a localhost-only guarantee',
  'a RAM download link',
  'tabs vs spaces (we won\u2019t say)',
  'a meeting that could\u2019ve been an email',
  'the missing semicolon (still)',
  'planning poker',
  'a patched kernel',
  'an emoji for every commit message',
  'CSS that works in exactly one browser',
  '2 weeks to launch (a month ago)',
  'the floppy disk save icon',
  'a deploy button we don\u2019t trust',
  'a Figma file named final_final_v3',
  'a 47-step README',
  'Un diccionario Español',
  'Un dictionnaire Français',
]
  