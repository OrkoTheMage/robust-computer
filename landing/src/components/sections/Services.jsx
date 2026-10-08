import styled from '@emotion/styled'
import { colors } from '../../styles/colors'
import { mobile } from '../../styles/breakpoints'
import { MonitorSmartphone, Code2, Boxes, Workflow } from 'lucide-react'
import { Container } from '../ui'
import { Zer0Text } from '../brand'
import { useLocale } from '../../context/LocaleContext'

/**
 * Services
 *
 * "What we build" — four square-ish cards arranged in a 12-col grid
 * with alternating black/gold/paper backgrounds (ink, gold, paper,
 * gold — top to bottom). Each card has an icon, a title, and a
 * one-liner.
 *
 * Per-card copy and `bg`/`fg` colors live in the i18n dictionaries.
 * The `bg`/`fg` fields are tokens ('ink' | 'gold' | 'paper'), not
 * raw color values — keeps the dictionary pure data (no
 * `colors.js` import) while letting the surface track the rest of
 * the site. SWATCHES maps the token to its color when the styled
 * component receives it.
 */

// Map icon-name strings from the i18n dictionary to Lucide
// components. Keeps the dictionary file pure (no React/Lucide
// imports).
const ICON_MAP = { MonitorSmartphone, Code2, Boxes, Workflow }

// Token → color. The dictionary only knows about ink/gold/paper
// because those are the three surface colors the Services grid
// actually uses; if a future item wants a different surface,
// extend this map (don't smuggle raw color strings into the
// dictionary — keeps the surface vocabulary in one place).
const SWATCHES = {
  ink: colors.ink,
  gold: colors.gold,
  paper: colors.paper,
}

const Section = styled.section`
  padding: 84px 56px 72px;
  padding-inline: max(56px, calc((100% - var(--page)) / 2 + 56px));
  border-bottom: 3px solid ${colors.ink};

  ${mobile} {
    padding: 56px 24px 48px;
  }
`

const Head = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 34px;
  gap: 16px;
  color: ${colors.ink};

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
    max-width: 38em;
    margin: 0;
    font-size: 18px;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
`

const Card = styled.article`
  grid-column: ${(p) => p.span};
  background: ${(p) => SWATCHES[p.bg] || p.bg};
  color: ${(p) => SWATCHES[p.fg] || p.fg};
  border: 3px solid ${colors.ink};
  padding: 30px 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 260px;

  ${mobile} {
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
`

const Services = () => {
  const { services } = useLocale()
  return (
    <Section>
      <Container>
        <Head>
          <h2><Zer0Text>{services.headline}</Zer0Text></h2>
          <p>{services.lead}</p>
        </Head>
        <Grid>
          {services.items.map((it) => {
            const Icon = ICON_MAP[it.icon]
            return (
              <Card
                key={it.title}
                span={`span ${it.span}`}
                bg={it.bg}
                fg={it.fg}
              >
                <Icon size={64} strokeWidth={2.4} />
                <h3><Zer0Text>{it.title}</Zer0Text></h3>
                <p>{it.body}</p>
              </Card>
            )
          })}
        </Grid>
      </Container>
    </Section>
  )
}

export default Services
