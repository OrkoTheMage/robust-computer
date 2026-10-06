/**
 * Steps
 *
 * "How a project runs" — gold band with a 4-step row. Numbers are
 * huge, body copy is small. Static content lives in `data/copy.js`.
 */

import styled from '@emotion/styled'
import { colors } from '../../styles/colors'
import { Container, Zer0Text } from '../ui'
import { steps, stepsHeadline, stepsLead } from '../../data/copy'

const Section = styled.section`
  background: ${colors.gold};
  border-top: 3px solid ${colors.ink};
  border-bottom: 3px solid ${colors.ink};
  padding: 84px 56px 72px;
  padding-inline: max(56px, calc((100% - var(--page)) / 2 + 56px));
  color: ${colors.ink};

  @media (max-width: 980px) {
    padding: 56px 24px 48px;
  }
`

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 3px solid ${colors.ink};
  background: ${colors.paper};

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`

const Step = styled.div`
  padding: 26px 26px 30px;
  border-right: 3px solid ${colors.ink};

  &:last-child {
    border-right: 0;
  }

  @media (max-width: 760px) {
    border-right: 0;
    border-bottom: 3px solid ${colors.ink};

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

const Steps = () => (
  <Section>
    <Container>
      <Head>
        <h2><Zer0Text>{stepsHeadline}</Zer0Text></h2>
        <p>{stepsLead}</p>
      </Head>
      <Row>
        {steps.map((s, i) => (
          <Step key={s.title}>
            <span className="n">{i + 1}</span>
            <h3><Zer0Text>{s.title}</Zer0Text></h3>
            <p>{s.body}</p>
          </Step>
        ))}
      </Row>
    </Container>
  </Section>
)

export default Steps
