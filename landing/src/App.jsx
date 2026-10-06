import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import FieldNotes from './pages/FieldNotes'
import FieldNote from './pages/FieldNote'
import BugReport from './pages/BugReport'
import Unsubscribe from './pages/Unsubscribe'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import ScrollToTop from './components/ScrollToTop'

/**
 * App
 *
 * Top-level router. Spoke routes plus a catch-all 404.
 * BrowserRouter is provided in `main.jsx`.
 */

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/bug-report" element={<BugReport />} />
        {/* Unsubscribe target for the link in the Field Notes
            confirmation email. The page reads `?email=…` from
            the query string and fires the API. Mounted before
            the dynamic `/field-notes/:slug` route so it can't
            be swallowed. */}
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        {/* Field-notes index — lists every post, plus the
            "Not already Subscribed?" subscribe box. Mounted
            BEFORE `/field-notes/:slug` so the dynamic route
            doesn't swallow it (React Router v6 matches in
            declaration order). */}
        <Route path="/field-notes" element={<FieldNotes />} />
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
