/**
 * Terms of Service
 *
 * Placeholder copy. Replace each section with text reviewed by a
 * lawyer before launch. Bracketed `[...]` markers flag the spots
 * that need real values (jurisdiction, governing law, etc.)
 * instead of plausible defaults.
 */

import styled from '@emotion/styled'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const Page = styled.main`
  min-height: 100vh;
  background: var(--paper);
`

const Body = styled.section`
  max-width: 760px;
  margin: 0 auto;
  padding: 56px 24px 96px;
  color: #000;
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
  color: #5d5744;
  margin: 0 0 32px;
`

const Terms = () => {
  useDocumentTitle('Terms')
  return (
  <Page>
    <Navbar />
    <PageHeader
      title="Terms of Service"
      lead="The ground rules for using this site and working with us."
      badgeVariant="badgeCut"
    />
    <Body>
      <Meta>Effective [date to be set on launch]</Meta>

      <p>
        These Terms of Service ("Terms") govern your use of the
        [Robust Computer] website and any services we agree to
        provide you under a separate written agreement. By using the
        site or contacting us through the enquiry form, you agree to
        these Terms.
      </p>

      <h2>Using this site</h2>
      <p>
        You agree to use the site for lawful purposes only. You must
        not attempt to disrupt the site, probe it for vulnerabilities,
        or scrape it without our written permission.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The design, copy, illustrations, code and other content on
        this site are owned by [Robust Computer] or our licensors and
        are protected by copyright and other applicable laws. You may
        view and link to the site for personal or internal business
        reference. You may not reproduce, redistribute, or create
        derivative works without our written permission.
      </p>

      <h2>Engagements and work product</h2>
      <p>
        Any project we agree to do for you is governed by a separate
        written agreement (a proposal, statement of work, or master
        services agreement) that supersedes these Terms where they
        conflict.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The site and its content are provided "as is" without
        warranties of any kind, express or implied. We do not warrant
        that the site will be uninterrupted, error-free, or free of
        harmful components.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, [Robust Computer] is
        not liable for any indirect, incidental, special, or
        consequential damages arising from your use of the site.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of [jurisdiction — e.g.
        "the State of California, United States" or "England and
        Wales"], without regard to its conflict-of-laws provisions.
      </p>

      <h2>Changes to these Terms</h2>
      <p>
        If we make material changes, we will post the updated Terms
        on this page with a new effective date. Continued use of the
        site after the effective date constitutes acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms can be sent to
        [hello@robustcomputer.example].
      </p>
    </Body>
    <Footer />
  </Page>
  )
}

export default Terms
