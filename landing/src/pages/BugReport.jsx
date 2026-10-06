/**
 * BugReport
 *
 * /bugreport — anonymous-friendly bug report form. Same visual
 * language as the project enquiry form (gold PageHeader, ticket
 * Sheet, form fields styled like the on-site <Input>): it's a
 * "contact form variant" that emails the team via the bug-report
 * pipeline instead of the enquiry one.
 *
 * Reporter's name + email are optional. The three repro fields
 * (what you were doing / what you expected / what happened) are
 * required.
 */

import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { Button, FieldGroup, InputControl, TextareaControl, Zer0Text } from '../components/ui'
import { SEO } from '../components/seo'
import { useBugReportForm } from '../hooks/useBugReportForm'
import { bugReportLead } from '../data/copy'

const Page = styled.main`
  min-height: 100vh;
  background: ${colors.paper};
`

const Grid = styled.div`
  width: 100%;
  max-width: calc(var(--page) * 0.75);
  margin-inline: auto;
  padding: 64px 56px 84px;
  align-items: start;

  @media (max-width: 980px) {
    padding: 40px 24px 56px;
  }
`

// Same Sheet visual as the Contact enquiry form so every "form"
// on the site reads as the same card type.
const Sheet = styled.form`
  border: 3px solid ${colors.ink};
  background: ${colors.ticket};
  padding: 30px 34px 34px;
  box-shadow: 8px 8px 0 ${colors.ink};
  color: ${colors.ink};

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

// Success card. Same shape as the Contact page's "Enquiry sent"
// card (border, hard shadow, text-align, h2 + p) so every form
// success state on the site reads as the same object.
const Thank = styled.div`
  border: 3px solid ${colors.ink};
  background: ${colors.ticket};
  padding: 60px 34px;
  box-shadow: 8px 8px 0 ${colors.ink};
  color: ${colors.ink};
  text-align: center;

  h2 {
    font-family: var(--display);
    font-weight: 800;
    font-size: clamp(36px, 5vw, 56px);
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

// Two-up row matching the Contact form's Name/Email pattern.
const Two = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

const ReportForm = () => {
  const b = useBugReportForm()
  if (b.submitted) {
    return (
      <Thank>
        <h2><Zer0Text>Report sent</Zer0Text></h2>
        <p>
          Thanks — the report is in the team&apos;s queue. If you left
          an email, we&apos;ll follow up there.
        </p>
      </Thank>
    )
  }

  return (
    <Sheet onSubmit={b.handleSubmit}>
      <h3><Zer0Text>Report a bug</Zer0Text></h3>
      <p>Anonymous-friendly. Only the three repro fields are required.</p>

      <Two>
        <FieldGroup label="Your name" error={b.fieldErrors.name}>
          <InputControl
            type="text"
            name="name"
            placeholder="Full name"
            value={b.formData.name}
            onChange={b.handleChange}
            disabled={b.submitting}
          />
        </FieldGroup>
        <FieldGroup label="Email" error={b.fieldErrors.email}>
          <InputControl
            type="email"
            name="email"
            placeholder="you@company.com"
            value={b.formData.email}
            onChange={b.handleChange}
            disabled={b.submitting}
          />
        </FieldGroup>
      </Two>

      <FieldGroup label="What were you doing?" error={b.fieldErrors.whatWereYouDoing}>
        <TextareaControl
          name="whatWereYouDoing"
          placeholder="Steps to reproduce — the page, the click, the input."
          value={b.formData.whatWereYouDoing}
          onChange={b.handleChange}
          disabled={b.submitting}
          required
        />
      </FieldGroup>

      <FieldGroup label="What did you expect?" error={b.fieldErrors.whatExpected}>
        <TextareaControl
          name="whatExpected"
          placeholder="What should have happened."
          value={b.formData.whatExpected}
          onChange={b.handleChange}
          disabled={b.submitting}
          required
        />
      </FieldGroup>

      <FieldGroup label="What actually happened?" error={b.fieldErrors.whatHappened}>
        <TextareaControl
          name="whatHappened"
          placeholder="The actual behavior — error messages, broken layout, etc."
          value={b.formData.whatHappened}
          onChange={b.handleChange}
          disabled={b.submitting}
          required
        />
      </FieldGroup>

      <FieldGroup label="Browser + device" error={b.fieldErrors.browserDevice}>
        <InputControl
          type="text"
          name="browserDevice"
          placeholder="e.g. Chrome 119 on macOS 14, iPhone 15 Safari"
          value={b.formData.browserDevice}
          onChange={b.handleChange}
          disabled={b.submitting}
        />
      </FieldGroup>

      {b.error && (
        <p style={{ color: colors.error, fontFamily: 'var(--mono)', fontSize: 14, marginTop: 0 }}>
          {b.error}
        </p>
      )}

      <Button type="submit" disabled={b.submitting} variant="gold" style={{ marginTop: 6 }}>
        {b.submitting ? <Zer0Text>Sending…</Zer0Text> : <Zer0Text>Send report</Zer0Text>}
      </Button>
    </Sheet>
  )
}

export default function BugReport() {
  return (
    <Page>
      <SEO
        title="Report a bug"
        description="File a bug report — tell us what broke, what you expected, and what actually happened."
        path="/bugreport"
      />
      <Navbar />
      <PageHeader
        title="Report a bug"
        lead={bugReportLead}
        imageVariant="bannerAlt"
      />
      <Grid>
        <ReportForm />
      </Grid>
      <Footer />
    </Page>
  )
}
