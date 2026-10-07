import styled from '@emotion/styled'
import { colors } from '../../../styles/colors'
import { Link } from 'react-router-dom'
import { Button, InputControl, FieldGroup } from '../../ui'
import { Zer0Text } from '../../brand'
import { useLocale } from '../../../context/LocaleContext'

/**
 * FieldNotes/Band
 *
 * Newsletter band on the home page. Black on the left
 * (headline + one-liner), gold bordered form on the right.
 * The form is owned by a page-level hook — this section
 * just renders the bindings.
 *
 * The small line under the form shows the latest issue
 * title, linked through to the post. The page passes that
 * issue in so this section does not fetch it itself.
 *
 * Sibling of `NewsletterBox.jsx` in this same directory —
 * the Band is the large two-column home-page module, the
 * Box is the small reusable subscribe widget used on the
 * Contact sidebar and on the new /field-notes index page.
 */

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

// Subscribe uses the standard <Button variant="gold"> (chunk 13).
// Earlier this section styled a `styled(Button)` override with the
// same colors; collapsing it onto the primitive keeps the audit's
// "no custom overrides" rule honest.

const FieldNotes = ({ email, onChange, onSubmit, submitting, status, errorMessage, latest }) => {
  const { fieldNotes, subscribeStatus, fields } = useLocale()
  return (
    <Band>
      <div>
        <h2><Zer0Text>{fieldNotes.headline}</Zer0Text></h2>
        <p>{fieldNotes.lead}</p>
      </div>
      <Form onSubmit={onSubmit}>
        <div style={{ marginBottom: 0 }}>
          <FieldGroup label={fields.emailAddress}>
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
              <Button type="submit" variant="gold" disabled={submitting}>
                {submitting ? <Zer0Text>{subscribeStatus.sending}</Zer0Text> : <Zer0Text>{subscribeStatus.subscribe}</Zer0Text>}
              </Button>
            </Row>
          </FieldGroup>
        </div>
        <small>
          {status === 'success'
            ? <Zer0Text>{subscribeStatus.success}</Zer0Text>
            : status === 'already'
            ? <Zer0Text>{subscribeStatus.already}</Zer0Text>
            : status === 'error'
            ? <Zer0Text>{errorMessage || subscribeStatus.error}</Zer0Text>
            : latest
              ? (
                <>
                  <Zer0Text>{subscribeStatus.latestPrefix}</Zer0Text>
                  {latest.to
                    ? <Link to={latest.to}><Zer0Text>{latest.title}</Zer0Text></Link>
                    : <Zer0Text>{latest.title}</Zer0Text>}
                  <Zer0Text>{subscribeStatus.latestSuffix}</Zer0Text>
                </>
              )
              : <Zer0Text>{subscribeStatus.latestEmpty}</Zer0Text>}
        </small>
      </Form>
    </Band>
  )
}

export default FieldNotes
