/**
 * Steps
 *
 * "How a project runs" — gold band with a 4-step row. Numbers are
 * huge, body copy is small. Static content lives in `data/copy.js`.
 */

import styled from '@emotion/styled'
import { Container } from '../ui'
import { steps } from '../../data/copy'

const Section = styled.section`
  background: var(--gold);
  border-top: 3px solid #000;
  border-bottom: 3px solid #000;
  padding: 72px 56px;
  color: #000;

  @media (max-width: 980px) {
    padding: 48px 24px;
  }

  h2 {
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(36px, 4.5vw, 56px);
    line-height: 1;
    margin: 0 0 40px;
    text-transform: uppercase;
    letter-spacing: -0.005em;
  }
`

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 40px;
  border: 3px solid #000;
  background: var(--paper);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`

const Step = styled.div`
  padding: 26px 26px 30px;
  border-right: 3px solid #000;

  &:last-child {
    border-right: 0;
  }

  @media (max-width: 760px) {
    border-right: 0;
    border-bottom: 3px solid #000;

    &:last-child {
      border-bottom: 0;
    }
  }

  .n {
    font-family: var(--display);
    font-weight: 800;
    font-size: 60px;
    line-height: 1;
    display: block;
    margin-bottom: 10px;
  }

  h3 {
    font-family: var(--display);
    font-weight: 800;
    font-size: 20px;
    margin: 0 0 6px;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    font-size: 16px;
  }
`

const Steps = () => (
  <Section>
    <Container>
      <h2>How a project runs</h2>
      <Row>
        {steps.map((s, i) => (
          <Step key={s.title}>
            <span className="n">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </Step>
        ))}
      </Row>
    </Container>
  </Section>
)

export default Steps
