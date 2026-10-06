import { useState } from 'react'
import { jokes } from '../data/jokes'

/**
 * useTopBarJoke
 *
 * Picks one tagline per mount. The lazy initializer runs on
 * the client only, so Math.random is safe without a
 * hydration mismatch in this SPA.
 */

const pickJoke = () => jokes[Math.floor(Math.random() * jokes.length)]

export function useTopBarJoke() {
  const [joke] = useState(pickJoke)
  return joke
}
