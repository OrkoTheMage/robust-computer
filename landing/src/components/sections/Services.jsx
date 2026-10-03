/**
 * Services
 *
 * "What we build" — four square-ish cards arranged in a 12-col grid
 * with alternating black/gold/paper backgrounds. Each card has an
 * icon, a title, a one-liner, and a "see examples" pseudo-link.
 */

import styled from '@emotion/styled'
import { MonitorSmartphone, Code2, Boxes, Workflow } from 'lucide-react'
import { Container } from '../ui'

const Section = styled.section`
  padding: 84px 56px 72px;
  border-bottom: 3px solid #000;

  @media (max-width: 980px) {
    padding: 56px 24px 48px;
  }
`

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 34px;
  gap: 40px;
  color: #000;

  h2 {
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(36px, 4.5vw, 56px);
    line-height: 1;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -0.005em;
  }

  p {
    max-width: 30em;
    margin: 0;
    font-size: 18px;
  }

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
`

const Card = styled.article`
  grid-column: ${(p) => p.span};
  background: ${(p) => p.bg};
  color: ${(p) => p.fg};
  border: 3px solid #000;
  padding: 30px 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 260px;

  @media (max-width: 980px) {
    grid-column: span 12 !important;
  }

  h3 {
    font-family: var(--display);
    font-weight: 800;
    font-size: 25px;
    line-height: 1.1;
    margin: 0;
    letter-spacing: 0.01em;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    max-width: 27em;
  }

  .more {
    font-family: var(--mono);
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.04em;
    margin-top: auto;
    padding-top: 10px;
    text-decoration: underline;
    text-underline-offset: 5px;
    text-decoration-thickness: 3px;
    text-transform: uppercase;
  }
`

const items = [
  {
    span: 7,
    bg: '#000',
    fg: 'var(--paper)',
    icon: MonitorSmartphone,
    title: 'Landing pages and sites',
    body:
      'Fast, clear marketing sites that explain what you do and get people to act.',
    moreColor: 'var(--gold)',
  },
  {
    span: 5,
    bg: 'var(--gold)',
    fg: '#000',
    icon: Code2,
    title: 'Custom web apps',
    body:
      'Portals, dashboards and internal tools shaped around how your team works.',
  },
  {
    span: 5,
    bg: 'var(--paper)',
    fg: '#000',
    icon: Boxes,
    title: 'SaaS platforms',
    body:
      'Accounts, billing and the product itself, built to scale.',
  },
  {
    span: 7,
    bg: 'var(--gold)',
    fg: '#000',
    icon: Workflow,
    title: 'Integrations and APIs',
    body:
      'Connect the tools you already use so data moves without anyone retyping it.',
  },
]

const Services = () => (
  <Section>
    <Container>
      <Head>
        <h2>What we build</h2>
        <p>
          Every project is designed around the client&apos;s business, not a
          template. Small or large, it gets the same care.
        </p>
      </Head>
      <Grid>
        {items.map((it) => {
          const Icon = it.icon
          return (
            <Card
              key={it.title}
              span={`span ${it.span}`}
              bg={it.bg}
              fg={it.fg}
            >
              <Icon size={64} strokeWidth={2.4} />
              <h3>{it.title}</h3>
              <p>{it.body}</p>
              <span className="more" style={{ color: it.moreColor }}>
                See examples
              </span>
            </Card>
          )
        })}
      </Grid>
    </Container>
  </Section>
)

export default Services
