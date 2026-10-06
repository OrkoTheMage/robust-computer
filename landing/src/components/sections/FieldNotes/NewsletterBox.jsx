/**
 * FieldNotes/NewsletterBox
 *
 * Small "subscribe to Field Notes" widget. Reused on the
 * Contact page's right sidebar and on the `/field-notes`
 * index page. The form state is owned by `useNewsletterForm`;
 * the box just renders the bindings.
 *
 * `header` and `sub` are required — every call site should
 * pass them from `data/copy.js` so the two boxes stay in
 * sync on the only thing they differ on (the framing).
 * The form itself (email input + subscribe button + status
 * caption) is fixed.
 *
 * `bg` and `fg` set the surface + foreground colors so the
 * box can sit on either a gold (Contact) or a paper
 * (/field-notes) surface. Defaults match the Contact page's
 * gold card.
 */

import styled from '@emotion/styled'
import { colors } from '../../../styles/colors'
import { Button, FieldGroup, InputControl, Zer0Text } from '../../ui'
import { useNewsletterForm } from '../../../hooks/useNewsletterForm'

const Box = styled.div`
  border: 3px solid ${colors.ink};
  padding: 26px;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};

  h3 {
    font-family: var(--display);
    font-weight: 800;
    font-size: 20px;
    margin: 0 0 8px;
    text-transform: uppercase;
  }

  p {
    margin: 0 0 14px;
  }
`

const FieldNote = styled.small`
  display: block;
  margin-top: 12px;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${(p) => p.$fg};
`

const NewsletterBox = ({ header, sub, bg = colors.gold, fg = colors.ink }) => {
  const n = useNewsletterForm()
  return (
    <Box $bg={bg} $fg={fg}>
      <h3><Zer0Text>{header}</Zer0Text></h3>
      <p>{sub}</p>
      <form onSubmit={n.handleSubmit} style={{ marginBottom: 12 }}>
        <FieldGroup label="Email address">
          <InputControl
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            value={n.email}
            onChange={n.handleChange}
            disabled={n.submitting}
          />
        </FieldGroup>
      </form>
      <Button
        type="button"
        variant="alt"
        onClick={n.handleSubmit}
        disabled={n.submitting}
      >
        {n.submitting ? <Zer0Text>Sending…</Zer0Text> : <Zer0Text>Subscribe</Zer0Text>}
      </Button>
      <FieldNote $fg={fg}>
        {n.status === 'success'
          ? <Zer0Text>Thanks — check your inbox.</Zer0Text>
          : n.status === 'already'
          ? <Zer0Text>Already on the list. No new email sent.</Zer0Text>
          : n.status === 'error'
          ? <Zer0Text>{n.errorMessage || 'Something went wrong. Try again in a moment.'}</Zer0Text>
          : <Zer0Text>Optional. No spam.</Zer0Text>}
      </FieldNote>
    </Box>
  )
}

export default NewsletterBox
