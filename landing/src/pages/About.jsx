/**
 * About page
 *
 * "Meet the Team." One section per developer, alternating
 * sides. The "facts" strip sits between the page header and the
 * first developer. Closing CTA band before the footer.
 */

import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Developer from '../components/sections/Developer'
import CTABand from '../components/sections/CTABand'
import Footer from '../components/sections/Footer'
import { SEO } from '../components/seo'
import { developers, teamFacts } from '../data/copy'

const Page = styled.main`
  min-height: 100vh;
  background: ${colors.paper};
`

const FactsBand = styled.div`
  background: ${colors.paper};
  border-bottom: 3px solid ${colors.ink};
`

const Facts = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  max-width: var(--page);
  margin-inline: auto;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`

const Fact = styled.div`
  padding: 22px 40px 24px 56px;
  border-right: 3px solid ${colors.ink};
  font-size: 18px;
  color: ${colors.ink};

  &:last-child {
    border-right: 0;
  }

  @media (max-width: 760px) {
    border-right: 0;
    border-bottom: 3px solid ${colors.ink};
    padding: 22px 24px;
    &:last-child {
      border-bottom: 0;
    }
  }

  b {
    display: block;
    font-family: var(--display);
    font-weight: 800;
    font-size: 40px;
    line-height: 1;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
`

// Three distinct portfolio preview styles — mapped by index so the
// mockup's three previews land on the three developers.
//
// If a preview has an `image`, the browser-window mockup renders
// a static screenshot (Aeryn is real; the other two are
// placeholders and render the abstract content under `children`).
// We use a screenshot instead of an iframe so the embedded site
// doesn't fall into its mobile breakpoint.
const previewStyles = [
  {
    domain: 'grue.sh',
    image: '/aeryn-preview.png',
    bg: '#0f1115',
    fg: '#eee',
    font: 'sans',
    children: (
      <>
        <h4>Full-stack, front to back.</h4>
        <p style={{ opacity: 0.6, maxWidth: 300, fontSize: 13, margin: '0 0 14px' }}>
          React interfaces and the services behind them.
        </p>
        <span
          style={{
            display: 'inline-block',
            background: '#3b6cff',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          View projects
        </span>
        <div
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            bottom: 22,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          <div
            style={{
              height: 72,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b6cff, #7a4dff)',
              border: 0,
            }}
          />
          <div
            style={{
              height: 72,
              borderRadius: 8,
              background: '#1b1f27',
              border: '1px solid #2a2f3a',
            }}
          />
          <div
            style={{
              height: 72,
              borderRadius: 8,
              background: '#1b1f27',
              border: '1px solid #2a2f3a',
            }}
          />
        </div>
      </>
    ),
  },
  {
    domain: 'studio.example',
    bg: '#fff',
  },
  {
    domain: 'name.codes',
    bg: '#fff',
  },
  {
    domain: 'design.work',
    bg: '#fff',
  },
]

export default function About() {
  return (
    <Page>
      <SEO
        title="About"
        description="Meet the team at Robust Computer — a small studio where you work with the people who write the code."
        path="/about"
      />
      <Navbar />
      <PageHeader
        title="Meet the Team"
        lead="Robust Computer is a small team. When you hire us, you work with the people who write the code.
        Here's who they are and what they bring to your project"
        imageVariant="bannerAlt"
      />

      {developers.map((dev, i) => (
        <Developer
          key={dev.name + i}
          dev={dev}
          preview={previewStyles[i] || previewStyles[0]}
          reversed={i % 2 === 1}
        />
      ))}
      <CTABand />
      <Footer />
    </Page>
  )
}
