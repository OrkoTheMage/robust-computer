/**
 * FieldNotes/Band
 *
 * Newsletter band on the home page. Black on the left
 * (headline + one-liner), gold bordered form on the right.
 * The form is owned by a page-level hook — this section
 * just renders the bindings.
 *
 * The small line under the form shows the latest issue
 * title from `data/fieldNotes.js`, linked through to the
 * post. Shared with the Hero ticket via
 * `hooks/useLatestRss.js`.
 *
 * Sibling of `NewsletterBox.jsx` in this same directory —
 * the Band is the large two-column home-page module, the
 * Box is the small reusable subscribe widget used on the
 * Contact sidebar and on the new /field-notes index page.
 */

import styled from '@emotion/styled'
import { colors } from '../../../styles/colors'
import { Link } from 'react-router-dom'
import { Button, InputControl, FieldGroup, Zer0Text } from '../../ui'
import { useLatestRss } from '../../../hooks/useLatestRss'
import { fieldNotes } from '../../../data/copy'

const Band = styled.section`
  background: ${colors.ink};
  color: ${colors.paper};
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
    color: ${colors.paper};
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
  background: ${colors.ticket};
  color: ${colors.ink};
  border: 3px solid ${colors.gold};
  padding: 26px;
  box-shadow: 8px 8px 0 ${colors.gold};

  small {
    display: block;
    margin-top: 12px;
    font-family: var(--mono);
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${colors.ink};
  }

  /* The "latest issue" line is a real link through to the post.
     Keep the text-decoration on always (1px transparent) so the
     box height doesn't shift on hover. */
  small a {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-decoration-thickness: 3px;
    text-underline-offset: 2px;
    transition: text-decoration-color 180ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  small a:hover,
  small a:focus-visible {
    text-decoration-color: currentColor;
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
  background: ${colors.gold};
  color: ${colors.ink};
  box-shadow: 6px 6px 0 ${colors.paper};
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
`

const FieldNotes = ({ email, onChange, onSubmit, submitting, status, errorMessage }) => {
  const latest = useLatestRss()
  return (
    <Band>
      <div>
        <h2><Zer0Text>{fieldNotes.headline}</Zer0Text></h2>
        <p>{fieldNotes.lead}</p>
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
            : status === 'already'
            ? <Zer0Text>Already on the list. No new email sent.</Zer0Text>
            : status === 'error'
            ? <Zer0Text>{errorMessage || 'Something went wrong. Try again in a moment.'}</Zer0Text>
            : latest
              ? (
                <>
                  <Zer0Text>Latest issue: </Zer0Text>
                  {latest.to
                    ? <Link to={latest.to}><Zer0Text>{latest.title}</Zer0Text></Link>
                    : <Zer0Text>{latest.title}</Zer0Text>}
                  <Zer0Text>, read online.</Zer0Text>
                </>
              )
              : <Zer0Text>Latest issue: placeholder title, read online.</Zer0Text>}
        </small>
      </Form>
    </Band>
  )
}

export default FieldNotes
