/**
 * Field
 *
 * Form field with label, input/textarea, and inline error slot.
 * Pure visual — the page owns the value + change handler.
 */

import styled from '@emotion/styled'

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
  color: ${(p) => (p.onInk ? 'var(--paper)' : '#000')};
`

const Input = styled.input`
  width: 100%;
  border: 3px solid ${(p) => (p.onInk ? 'var(--paper)' : '#000')};
  background: ${(p) => (p.onInk ? 'var(--tie)' : '#fff8')};
  color: ${(p) => (p.onInk ? 'var(--paper)' : '#000')};
  padding: 11px 14px;
  font-size: 17px;
  min-height: 50px;
  font-family: var(--mono);

  &::placeholder {
    color: ${(p) => (p.onInk ? '#7a7260' : '#6b6450')};
  }
`

const Textarea = styled.textarea`
  width: 100%;
  border: 3px solid ${(p) => (p.onInk ? 'var(--paper)' : '#000')};
  background: ${(p) => (p.onInk ? 'var(--tie)' : '#fff8')};
  color: ${(p) => (p.onInk ? 'var(--paper)' : '#000')};
  padding: 11px 14px;
  font-size: 17px;
  min-height: 150px;
  font-family: var(--mono);
  resize: vertical;

  &::placeholder {
    color: ${(p) => (p.onInk ? '#7a7260' : '#6b6450')};
  }
`

const Error = styled.div`
  margin-top: 6px;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: #b00020;
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
