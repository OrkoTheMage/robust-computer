import styled from '@emotion/styled'
import { colors } from '../../../styles/colors'
import { mobile } from '../../../styles/breakpoints'
import { Link } from 'react-router-dom'
import { Button, InputControl, FieldGroup } from '../../ui'
import { Zer0Text } from '../../brand'
import { useLocale } from '../../../context/LocaleContext'

/**
 * Issue/Highlight
 *
 * Newsletter band on the home page (lives at the
 * `sections/Issue/` directory — the multi-post UI
 * namespace; 
 * Black on  the left (headline + one-liner), gold bordered form
 * on the right. The form is owned by a page-level hook —
 * this section just renders the bindings.
 *
 * The small line under the form shows the latest issue
 * title, linked through to the post. The page passes
 * that post in via the `latest` prop (built from
 * `getLatestPost()` in `data/feed.js`) so this section
 * does not fetch it itself.
 *
 * Sibling of `Issue/Subscribe.jsx` in this same directory
 * — the Highlight is the large two-column home-page
 * module, the Subscribe is the small reusable widget
 * used on the Contact sidebar and on the News index
 * archive.
 */

const Band = styled.section`
  max-width: var(--max);
  margin-inline: auto;
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

  ${mobile} {
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

  ${mobile} {
    flex-direction: column;
  }
`

const IssueHighlight = ({ email, onChange, onSubmit, submitting, status, errorMessage, latest }) => {
  const { feed, subscribeStatus, fields } = useLocale()
  return (
    <Band>
      <div>
        <h2><Zer0Text>{feed.headline}</Zer0Text></h2>
        <p>{feed.lead}</p>
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

export default IssueHighlight
