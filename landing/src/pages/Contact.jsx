/**
 * Contact page
 *
 * Two-column: the project enquiry sheet on the left, three boxes on
 * the right (plain email, "what happens next" steps, newsletter).
 * The form state is owned by `useContactForm`; the newsletter box
 * reuses the FieldNotes hook.
 */

import styled from '@emotion/styled'
import { useState } from 'react'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { Chip, Button, FieldGroup, InputControl, TextareaControl } from '../components/ui'
import { useContactForm, PROJECT_TYPES, BUDGETS } from '../hooks/useContactForm'
import { useNewsletterForm } from '../hooks/useNewsletterForm'
import config from '../config'

const Page = styled.main`
  min-height: 100vh;
  background: var(--paper);
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 48px;
  padding: 64px 56px 84px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    padding: 40px 24px 56px;
  }
`

const Sheet = styled.form`
  border: 3px solid #000;
  background: var(--ticket);
  padding: 30px 34px 34px;
  box-shadow: 8px 8px 0 #000;

  h3 {
    font-family: var(--display);
    font-weight: 800;
    font-size: 24px;
    margin: 0 0 4px;
    text-transform: uppercase;
  }

  > p {
    margin: 0 0 22px;
  }
`

const Two = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

const Lab = styled.div`
  font-family: var(--mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.05em;
  margin: 0 0 8px;
  text-transform: uppercase;
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Box = styled.div`
  border: 3px solid #000;
  padding: 26px;
  background: ${(p) => p.bg};
  color: ${(p) => p.fg};

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

  ol {
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: step;

    li {
      counter-increment: step;
      display: flex;
      gap: 14px;
      padding: 10px 0;
      border-top: 3px dotted ${(p) => (p.bg === '#000' ? 'var(--paper)' : '#000')};

      &:first-child {
        border-top: 0;
      }

      &::before {
        content: counter(step);
        font-family: var(--display);
        font-weight: 800;
        font-size: 30px;
        line-height: 1;
        flex: none;
        width: 26px;
      }
    }
  }
`

const Mail = styled.span`
  display: block;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 16px;
  border: 3px solid currentColor;
  padding: 12px 14px;
  margin-bottom: 12px;
  word-break: break-all;
`

const Thank = styled.div`
  text-align: center;
  padding: 80px 20px;

  h2 {
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(36px, 5vw, 64px);
    line-height: 1;
    text-transform: uppercase;
    margin: 0 0 16px;
  }

  p {
    font-size: 18px;
    max-width: 32em;
    margin: 0 auto;
  }
`

const whatHappens = [
  'We reply within one business day with questions.',
  'A short call to agree scope and timing.',
  'A written proposal with a fixed price.',
]

const ContactForm = () => {
  const c = useContactForm()
  if (c.submitted) {
    return (
      <Thank>
        <h2>Enquiry sent</h2>
        <p>
          Thanks for the details — we&apos;ll reply within one business day
          from a real person at {config.brand.contactEmail}.
        </p>
      </Thank>
    )
  }

  return (
    <Sheet onSubmit={c.handleSubmit}>
      <h3>Pr0ject enquiry</h3>
      <p>Goes straight to the team inbox.</p>

      <Two>
        <FieldGroup label="Your name" error={c.fieldErrors.name}>
          <InputControl
            type="text"
            name="name"
            placeholder="Full name"
            value={c.formData.name}
            onChange={c.handleChange}
            disabled={c.submitting}
            required
          />
        </FieldGroup>
        <FieldGroup label="Email" error={c.fieldErrors.email}>
          <InputControl
            type="email"
            name="email"
            placeholder="you@company.com"
            value={c.formData.email}
            onChange={c.handleChange}
            disabled={c.submitting}
            required
          />
        </FieldGroup>
      </Two>

      <FieldGroup label="Company or project" error={c.fieldErrors.company}>
        <InputControl
          type="text"
          name="company"
          placeholder="Optional"
          value={c.formData.company}
          onChange={c.handleChange}
          disabled={c.submitting}
        />
      </FieldGroup>

      <Lab>What are you building?</Lab>
      <Chips>
        {PROJECT_TYPES.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => c.handleChip('projectType', p.value)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <Chip on={c.formData.projectType === p.value}>{p.label}</Chip>
          </button>
        ))}
      </Chips>

      <Lab>Rough budget</Lab>
      <Chips>
        {BUDGETS.map((b) => (
          <button
            key={b.value}
            type="button"
            onClick={() => c.handleChip('budget', b.value)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <Chip on={c.formData.budget === b.value}>{b.label}</Chip>
          </button>
        ))}
      </Chips>

      <FieldGroup label="Tell us more" error={c.fieldErrors.message}>
        <TextareaControl
          name="message"
          placeholder="What problem should it solve, and who will use it?"
          value={c.formData.message}
          onChange={c.handleChange}
          disabled={c.submitting}
          required
        />
      </FieldGroup>

      {c.error && (
        <p style={{ color: '#b00020', fontFamily: 'var(--mono)', fontSize: 14, marginTop: 0 }}>
          {c.error}
        </p>
      )}

      <Button type="submit" disabled={c.submitting} style={{ marginTop: 6 }}>
        {c.submitting ? 'Sending…' : 'Send enquiry'}
      </Button>
    </Sheet>
  )
}

const NewsletterBox = () => {
  const n = useNewsletterForm()
  return (
    <Box bg="var(--gold)">
      <h3>Field notes</h3>
      <p>One short email a month on building software that lasts.</p>
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
        onClick={n.handleSubmit}
        disabled={n.submitting}
      >
        {n.submitting ? 'Sending…' : 'Subscribe'}
      </Button>
      <p
        style={{
          marginTop: 12,
          fontFamily: 'var(--mono)',
          fontSize: 13,
        }}
      >
        {n.status === 'success'
          ? 'Thanks — check your inbox.'
          : n.status === 'error'
          ? 'Something went wrong. Try again in a moment.'
          : 'Optional. No spam.'}
      </p>
    </Box>
  )
}

export default function Contact() {
  return (
    <Page>
      <Navbar />
      <PageHeader
        title="Start a project"
        lead="Tell us what you are building. A short message is fine, we will ask the right questions after that."
      />
      <Grid>
        <ContactForm />
        <Side>
          <Box bg="#000" fg="var(--paper)">
            <h3>Prefer plain email?</h3>
            <p>Write to us directly and we will reply from a real person.</p>
            <Mail>{config.brand.contactEmail}</Mail>
          </Box>
          <Box>
            <h3>What happens next</h3>
            <ol>
              {whatHappens.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Box>
          <NewsletterBox />
        </Side>
      </Grid>
      <Footer />
    </Page>
  )
}
