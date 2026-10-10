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
import { useScrollToTop } from './hooks/useScrollToTop'

/**
 * App
 *
 * Top-level router. Spoke routes plus a catch-all 404.
 * BrowserRouter is provided in `main.jsx`.
 *
 * `<ScrollToTopHost />` mounts `useScrollToTop` so the
 * scroll-to-top effect runs once for the app lifetime. The
 * hook lives in `hooks/` per the §4 layer rule; the host
 * component is a thin caller so the same hook can be
 * mounted here without smuggling a render-null component
 * into `components/`.
 */

const ScrollToTopHost = () => {
  useScrollToTop()
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTopHost />
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
