/**
 * App
 *
 * Top-level router. Three routes (home, about, contact) + a
 * catch-all 404. Wraps the routes in a BrowserRouter (provided
 * in `main.jsx`).
 */

import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import FieldNote from './pages/FieldNote'
import BugReport from './pages/BugReport'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import ScrollToTop from './utils/ScrollToTop'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/bug-report" element={<BugReport />} />
        {/* Field-note post pages: items live at
            `/field-notes/<slug>`. Single-segment slugs for now;
            if multi-segment slugs are ever needed, switch to
            `/field-notes/*` and parse the splat in the page. */}
        <Route path="/field-notes/:slug" element={<FieldNote />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
