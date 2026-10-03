/**
 * Work
 *
 * "Recent work" — three placeholder project cards. Real project
 * data lives in `data/work.js`; the section itself just renders.
 */

import styled from '@emotion/styled'
import { Container, Chip } from '../ui'
import { work } from '../../data/work'

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
  }

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.article`
  border: 3px solid #000;
  background: var(--ticket);
  box-shadow: 7px 7px 0 #000;
`

const Shot = styled.div`
  height: 200px;
  border-bottom: 3px solid #000;
  background: ${(p) => p.bg};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 26px 26px -4px;
    border: 3px solid #000;
    background: var(--ticket);
  }

  &::after {
    content: '';
    position: absolute;
    right: 40px;
    bottom: 26px;
    width: 90px;
    height: 60px;
    border: 3px solid #000;
    background: var(--gold);
  }
`

const Info = styled.div`
  padding: 20px 22px 24px;

  h3 {
    font-family: var(--display);
    font-weight: 800;
    font-size: 22px;
    line-height: 1;
    margin: 0 0 8px;
    text-transform: uppercase;
  }

  p {
    margin: 0 0 14px;
    font-size: 16px;
  }
`

const Tags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const Work = () => (
  <Section>
    <Container>
      <Head>
        <h2>Recent work</h2>
        <p>Placeholder projects. Swap in real case studies and screenshots.</p>
      </Head>
      <Grid>
        {work.map((w) => (
          <Card key={w.title}>
            <Shot bg={w.shot} />
            <Info>
              <h3>{w.title}</h3>
              <p>{w.description}</p>
              <Tags>
                {w.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </Tags>
            </Info>
          </Card>
        ))}
      </Grid>
    </Container>
  </Section>
)

export default Work
