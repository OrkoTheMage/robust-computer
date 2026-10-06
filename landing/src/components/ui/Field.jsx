/**
 * Field
 *
 * Form field with label, input/textarea, and inline error slot.
 * Pure visual — the page owns the value + change handler.
 */

import styled from '@emotion/styled'
import { colors } from '../../styles/colors'

const Wrap = styled.label`
  display: block;
  margin-bottom: 16px;
`

const Label = styled.span`
  display: block;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
  text-transform: uppercase;
  color: ${(p) => (p.onInk ? colors.paper : colors.ink)};
`

const Input = styled.input`
  width: 100%;
  border: 3px solid ${(p) => (p.onInk ? colors.paper : colors.ink)};
  background: ${(p) => (p.onInk ? colors.tie : colors.inputBg)};
  color: ${(p) => (p.onInk ? colors.paper : colors.ink)};
  padding: 11px 14px;
  font-size: 17px;
  min-height: 50px;
  font-family: var(--mono);

  &::placeholder {
    color: ${(p) => (p.onInk ? colors.placeholderOnInk : colors.placeholderLight)};
  }
`

const Textarea = styled.textarea`
  width: 100%;
  border: 3px solid ${(p) => (p.onInk ? colors.paper : colors.ink)};
  background: ${(p) => (p.onInk ? colors.tie : colors.inputBg)};
  color: ${(p) => (p.onInk ? colors.paper : colors.ink)};
  padding: 11px 14px;
  font-size: 17px;
  min-height: 150px;
  font-family: var(--mono);
  resize: vertical;

  &::placeholder {
    color: ${(p) => (p.onInk ? colors.placeholderOnInk : colors.placeholderLight)};
  }
`

const Error = styled.div`
  margin-top: 6px;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: ${colors.error};
`

export const FieldGroup = ({ label, error, children }) => (
  <Wrap>
    <Label>{label}</Label>
    {children}
    {error ? <Error>{error}</Error> : null}
  </Wrap>
)

export const InputControl = (props) => <Input {...props} />
export const TextareaControl = (props) => <Textarea {...props} />
