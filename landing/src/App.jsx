import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import News from './pages/News'
import Post from './pages/Post'
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
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="/field-notes" element={<News />} />
        <Route path="/field-notes/:slug" element={<Post />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
