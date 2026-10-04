/**
 * FieldNotes
 *
 * Newsletter band. Black on the left (headline + one-liner), gold
 * bordered form on the right. The form is owned by a page-level
 * hook — this section just renders the bindings it gets.
 */

import styled from '@emotion/styled'
import { Container, Button, InputControl, FieldGroup, Zer0Text } from '../ui'

const Band = styled.section`
  background: #000;
  color: var(--paper);
  padding: 64px 56px;
  padding-inline: max(56px, calc((100% - var(--page)) / 2 + 56px));
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;

  h2 {
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(36px, 4.5vw, 56px);
    line-height: 1;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -0.005em;
    color: var(--paper);
  }

  p {
    margin: 16px 0 0;
    font-size: 18px;
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    padding: 48px 24px;
    gap: 28px;
  }
`

const Form = styled.form`
  background: var(--ticket);
  color: #000;
  border: 3px solid var(--gold);
  padding: 26px;
  box-shadow: 8px 8px 0 var(--gold);

  small {
    display: block;
    margin-top: 12px;
    font-size: 14px;
    color: #5d5744;
  }
`

const Row = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`

const SubscribeBtn = styled(Button)`
  background: var(--gold);
  color: #000;
  box-shadow: 6px 6px 0 var(--paper);
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
`

const FieldNotes = ({ email, onChange, onSubmit, submitting, status }) => (
  <Band>
    <div>
      <h2><Zer0Text>Field notes</Zer0Text></h2>
      <p>
        One short email a month on building software that lasts. Practical,
        no spam, unsubscribe any time.
      </p>
    </div>
    <Form onSubmit={onSubmit}>
      <div style={{ marginBottom: 0 }}>
        <FieldGroup label="Email address">
          <Row>
            <InputControl
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={onChange}
              disabled={submitting}
            />
            <SubscribeBtn type="submit" disabled={submitting}>
              {submitting ? <Zer0Text>Sending…</Zer0Text> : <Zer0Text>Subscribe</Zer0Text>}
            </SubscribeBtn>
          </Row>
        </FieldGroup>
      </div>
      <small>
        {status === 'success'
          ? <Zer0Text>Thanks — check your inbox.</Zer0Text>
          : status === 'error'
          ? <Zer0Text>Something went wrong. Try again in a moment.</Zer0Text>
          : <Zer0Text>Latest issue: placeholder title, read online.</Zer0Text>}
      </small>
    </Form>
  </Band>
)

export default FieldNotes
