import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { Chip, Button, FieldGroup, InputControl, TextareaControl } from '../components/ui'
import { Zer0Text } from '../components/brand'
import { useContactForm } from '../hooks/useContactForm'
import { useNewsletterForm } from '../hooks/useNewsletterForm'
import { NewsletterBox } from '../components/sections/FieldNotes'
import { SEO } from '../components/seo'
import config from '../config'
import { useLocale } from '../context/LocaleContext'

/**
 * Contact page
 *
 * Two-column: the project enquiry sheet on the left, three boxes on
 * the right (plain email, "what happens next" steps, newsletter).
 * Enquiry state is owned by `useContactForm`. Subscribe state
 * is owned by `useNewsletterForm` and passed into the box.
 *
 * All copy reads from the locale dictionary via `useLocale()`:
 * page chrome (`contactPage`), the chip group options
 * (`projectTypes`, `budgets`), field labels + placeholders
 * (`fields`, `placeholders`), the "what happens next" list
 * (`contactWhatHappens`), and the newsletter box framing
 * (`fieldNotes.contactBox`).
 */

const Page = styled.main`
  min-height: 100vh;
  background: ${colors.paper};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 48px;
  width: 100%;
  max-width: var(--page);
  margin-inline: auto;
  padding: 64px 56px 84px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    padding: 40px 24px 56px;
  }
`

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
    color: ${colors.ink};
  }

  > p {
    margin: 0 0 22px;
    color: ${colors.ink};
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
  color: ${colors.ink};
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
  border: 3px solid ${colors.ink};
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
      border-top: 3px dotted ${(p) => (p.bg === colors.ink ? colors.paper : colors.ink)};

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

// Same card treatment as the project-enquiry Sheet (ticket
// background, 3px black border, hard offset shadow) so the
// success state reads as "the form, filled out" rather than a
// detached page-level message.
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

const ChipButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
`

const ErrorText = styled.p`
  color: ${colors.error};
  font-family: var(--mono);
  font-size: 14px;
  margin-top: 0;
`

export default function Contact() {
  const c = useContactForm()
  const newsletter = useNewsletterForm()
  const {
    contactPage,
    contactWhatHappens,
    fieldNotes,
    fields,
    placeholders,
    projectTypes,
    budgets,
  } = useLocale()

  return (
    <Page>
      <SEO
        title={contactPage.seoTitle}
        description={contactPage.seoDescription}
        path="/contact"
      />
      <Navbar />
      <PageHeader
        title={contactPage.title}
        lead={contactPage.lead}
        imageVariant="bannerAlt"
      />
      <Grid>
        {c.submitted ? (
          <Thank>
            <h2><Zer0Text>{contactPage.thankTitle}</Zer0Text></h2>
            <p>
              {contactPage.thankBefore}<strong>{config.brand.email}</strong>{contactPage.thankAfter}
            </p>
          </Thank>
        ) : (
          <Sheet onSubmit={c.handleSubmit}>
            <h3><Zer0Text>{contactPage.enquiryTitle}</Zer0Text></h3>
            <p>{contactPage.enquiryLead}</p>

            <Two>
              <FieldGroup label={<Zer0Text>{fields.yourName}</Zer0Text>} error={c.fieldErrors.name}>
                <InputControl
                  type="text"
                  name="name"
                  placeholder={placeholders.fullName}
                  value={c.formData.name}
                  onChange={c.handleChange}
                  disabled={c.submitting}
                  required
                />
              </FieldGroup>
              <FieldGroup label={fields.email} error={c.fieldErrors.email}>
                <InputControl
                  type="email"
                  name="email"
                  placeholder={placeholders.email}
                  value={c.formData.email}
                  onChange={c.handleChange}
                  disabled={c.submitting}
                  required
                />
              </FieldGroup>
            </Two>

            <FieldGroup label={<Zer0Text>{fields.company}</Zer0Text>} error={c.fieldErrors.company}>
              <InputControl
                type="text"
                name="company"
                placeholder={placeholders.optional}
                value={c.formData.company}
                onChange={c.handleChange}
                disabled={c.submitting}
              />
            </FieldGroup>

            <Lab><Zer0Text>{contactPage.whatAreYouBuilding}</Zer0Text></Lab>
            <Chips>
              {projectTypes.map((p) => (
                <ChipButton
                  key={p.value}
                  type="button"
                  onClick={() => c.handleChip('projectType', p.value)}
                >
                  <Chip on={c.formData.projectType === p.value}>{p.label}</Chip>
                </ChipButton>
              ))}
            </Chips>

            <Lab><Zer0Text>{contactPage.roughBudget}</Zer0Text></Lab>
            <Chips>
              {budgets.map((b) => (
                <ChipButton
                  key={b.value}
                  type="button"
                  onClick={() => c.handleChip('budget', b.value)}
                >
                  <Chip on={c.formData.budget === b.value}>{b.label}</Chip>
                </ChipButton>
              ))}
            </Chips>

            <FieldGroup label={<Zer0Text>{fields.message}</Zer0Text>} error={c.fieldErrors.message}>
              <TextareaControl
                name="message"
                placeholder={placeholders.messageContact}
                value={c.formData.message}
                onChange={c.handleChange}
                disabled={c.submitting}
                required
              />
            </FieldGroup>

            {c.error && <ErrorText>{c.error}</ErrorText>}

            <Button type="submit" disabled={c.submitting} variant="gold">
              {c.submitting ? <Zer0Text>{contactPage.sending}</Zer0Text> : <Zer0Text>{contactPage.send}</Zer0Text>}
            </Button>
          </Sheet>
        )}
        <Side>
          <Box bg={colors.ink} fg={colors.paper}>
            <h3><Zer0Text>{contactPage.preferEmailTitle}</Zer0Text></h3>
            <p>{contactPage.preferEmailBody}</p>
            <Mail>{config.brand.email}</Mail>
          </Box>
          <Box fg={colors.ink}>
            <h3><Zer0Text>{contactPage.whatNextTitle}</Zer0Text></h3>
            <ol>
              {contactWhatHappens.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Box>
          <NewsletterBox
            header={fieldNotes.contactBox.header}
            sub={fieldNotes.contactBox.sub}
            email={newsletter.email}
            onChange={newsletter.handleChange}
            onSubmit={newsletter.handleSubmit}
            submitting={newsletter.submitting}
            status={newsletter.status}
            errorMessage={newsletter.errorMessage}
          />
        </Side>
      </Grid>
      <Footer />
    </Page>
  )
}
