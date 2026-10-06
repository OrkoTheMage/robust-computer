import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { SEO } from '../components/seo'
import { privacySections, privacyPage } from '../data/copy'

/**
 * Privacy Policy
 *
 * Placeholder copy. Replace each section with text reviewed by a
 * lawyer before launch. Bracketed `[...]` markers flag the spots
 * that need real values (company name, jurisdiction, retention
 * period, etc.) instead of plausible defaults.
 */

const Page = styled.main`
  min-height: 100vh;
  background: ${colors.paper};
`

const Body = styled.section`
  max-width: 760px;
  margin: 0 auto;
  padding: 56px 24px 96px;
  color: ${colors.ink};
  font-size: 17px;
  line-height: 1.65;

  h2 {
    font-family: var(--display);
    font-weight: 800;
    font-size: 26px;
    line-height: 1.1;
    text-transform: uppercase;
    margin: 48px 0 14px;
    letter-spacing: -0.005em;
  }

  p {
    margin: 0 0 16px;
  }

  p:last-child {
    margin-bottom: 0;
  }

  ul {
    margin: 0 0 16px;
    padding-left: 24px;
  }

  li {
    margin-bottom: 6px;
  }
`

const Meta = styled.p`
  font-family: var(--mono);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${colors.deskSoft};
  margin: 0 0 32px;
`

const Privacy = () => {
  return (
  <Page>
    <SEO
      title={privacyPage.seoTitle}
      description={privacyPage.seoDescription}
      path="/privacy"
    />
    <Navbar />
    <PageHeader
      title={privacyPage.title}
      lead={privacyPage.lead}
      imageVariant="bannerAlt"
    />
    <Body>
      <Meta>Effective [date to be set on launch]</Meta>

      <p>
        This Privacy Policy explains how [Robust Computer] ("we", "us",
        "our") collects, uses, and shares information about you when
        you use our website or contact us through the form on the
        Contact page.
      </p>

      <h2>What we collect</h2>
      <p>
        When you submit the project enquiry form, we collect the
        information you provide: your name, email address, optional
        company or project name, what you are building, your rough
        budget, and your message. We also record the IP address and
        user agent string from the request, for spam prevention and
        abuse handling.
      </p>

      <h2>What we do with it</h2>
      <p>
        We use the information you submit to reply to your enquiry
        and, if it turns into a project, to communicate with you about
        it. We do not sell or rent your information to third parties.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Enquiries are stored in a [MongoDB] database operated by us.
        The server that hosts this database is located in [region —
        e.g. "the United States" or "the EU"]. Email notifications
        about new enquiries are sent through [your SMTP provider —
        e.g. Mailgun, Postmark, AWS SES].
      </p>

      <h2>How long we keep it</h2>
      <p>
        We retain enquiry records for [retention period — e.g. "two
        years from the date of submission"] so we can refer back to
        them if you start a project later. You can ask us to delete
        your record at any time.
      </p>

      <h2>{privacySections[0]}</h2>
      <p>
        We do not currently set any tracking cookies or use
        third-party analytics on this site. If this changes, we will
        update this policy and ask for your consent where required.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to:
      </p>
      <ul>
        <li>Request a copy of the personal data we hold about you</li>
        <li>Ask us to correct inaccurate data</li>
        <li>Ask us to delete your data</li>
        <li>
          Object to or restrict certain processing (e.g. for
          EU/UK residents under GDPR)
        </li>
      </ul>
      <p>
        To exercise any of these rights, email us at
        [hello@robust.computer] and we will respond within
        [30 days / the period required by your jurisdiction].
      </p>

      <h2>{privacySections[1]}</h2>
      <p>
        If we make material changes, we will post the updated policy
        on this page with a new effective date.
      </p>
    </Body>
    <Footer />
  </Page>
  )
}

export default Privacy
