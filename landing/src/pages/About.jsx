/**
 * About page
 *
 * "Meet the developers." One section per developer, alternating
 * sides. The "facts" strip sits between the page header and the
 * first developer. Closing CTA band before the footer.
 */

import styled from '@emotion/styled'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Developer from '../components/sections/Developer'
import CTABand from '../components/sections/CTABand'
import Footer from '../components/sections/Footer'
import { developers, teamFacts } from '../data/copy'

const Page = styled.main`
  min-height: 100vh;
  background: var(--paper);
`

const Facts = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 3px solid #000;
  background: var(--paper);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`

const Fact = styled.div`
  padding: 22px 40px 24px 56px;
  border-right: 3px solid #000;
  font-size: 18px;
  color: #000;

  &:last-child {
    border-right: 0;
  }

  @media (max-width: 760px) {
    border-right: 0;
    border-bottom: 3px solid #000;
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
const previewStyles = [
  {
    domain: 'aeryn.dev',
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
    fg: '#1a1a1a',
    font: 'serif',
    children: (
      <>
        <h4 style={{ fontStyle: 'italic', fontWeight: 400, maxWidth: 300 }}>
          Interfaces that feel obvious.
        </h4>
        <p
          style={{
            fontSize: 13,
            maxWidth: 280,
            color: '#555',
            margin: '6px 0 0',
          }}
        >
          Front-end developer working with small teams and founders.
        </p>
        <div
          style={{
            position: 'absolute',
            right: 22,
            top: 80,
            width: 150,
            height: 180,
            background: '#f3c9a5',
          }}
        />
      </>
    ),
  },
  {
    domain: 'name.codes',
    bg: '#2146d1',
    fg: '#fff',
    font: 'sans',
    children: (
      <>
        <h4 style={{ maxWidth: 330, fontWeight: 900 }}>
          I build the product behind the product.
        </h4>
        <span
          style={{
            display: 'inline-block',
            margin: '10px 0 0',
            background: '#ffe14d',
            color: '#111',
            padding: '9px 18px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          See what I&apos;ve built
        </span>
        <div
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            bottom: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
          }}
        >
          <div style={{ height: 78, borderRadius: 14, background: '#fff' }} />
          <div style={{ height: 78, borderRadius: 14, background: '#ffe14d' }} />
          <div style={{ height: 78, borderRadius: 14, background: '#ff6b6b' }} />
          <div style={{ height: 78, borderRadius: 14, background: '#7ee0b1' }} />
        </div>
      </>
    ),
  },
]

export default function About() {
  return (
    <Page>
      <Navbar />
      <PageHeader
        title="Meet the developers"
        lead="Robust Computer is a small team. When you hire us, you work with the people who write the code."
      />
      <Facts>
        {teamFacts.map((f) => (
          <Fact key={f.big}>
            <b>{f.big}</b>
            {f.small}
          </Fact>
        ))}
      </Facts>
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
