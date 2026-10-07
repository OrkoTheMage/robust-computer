import styled from '@emotion/styled'
import { colors } from '../../../styles/colors'
import { Button, FieldGroup, InputControl } from '../../ui'
import { Zer0Text } from '../../brand'
import { useLocale } from '../../../context/LocaleContext'

/**
 * FieldNotes/NewsletterBox
 *
 * Small "subscribe to Field Notes" widget. Reused on the
 * Contact page's right sidebar and on the `/field-notes`
 * index page. The form state is owned by `useNewsletterForm`;
 * the box just renders the bindings.
 *
 * `header` and `sub` are required — every call site should
 * pass them from the i18n dictionary so the two boxes stay in
 * sync on the only thing they differ on (the framing).
 * The form itself (email input + subscribe button + status
 * caption) is fixed.
 *
 * `bg` and `fg` set the surface + foreground colors so the
 * box can sit on either a gold (Contact) or a paper
 * (/field-notes) surface. Defaults match the Contact page's
 * gold card.
 */

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

const NewsletterBox = ({
  header,
  sub,
  bg = colors.gold,
  fg = colors.ink,
  email,
  onChange,
  onSubmit,
  submitting,
  status,
  errorMessage,
}) => {
  const { subscribeStatus, fields } = useLocale()
  return (
    <Box $bg={bg} $fg={fg}>
      <h3><Zer0Text>{header}</Zer0Text></h3>
      <p>{sub}</p>
      <form onSubmit={onSubmit}>
        <FieldGroup label={fields.emailAddress}>
          <InputControl
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={onChange}
            disabled={submitting}
          />
        </FieldGroup>
      </form>
      <Button
        type="button"
        variant="alt"
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? <Zer0Text>{subscribeStatus.sending}</Zer0Text> : <Zer0Text>{subscribeStatus.subscribe}</Zer0Text>}
      </Button>
      <FieldNote $fg={fg}>
        {status === 'success'
          ? <Zer0Text>{subscribeStatus.success}</Zer0Text>
          : status === 'already'
          ? <Zer0Text>{subscribeStatus.already}</Zer0Text>
          : status === 'error'
          ? <Zer0Text>{errorMessage || subscribeStatus.error}</Zer0Text>
          : <Zer0Text>{subscribeStatus.optional}</Zer0Text>}
      </FieldNote>
    </Box>
  )
}

export default NewsletterBox
