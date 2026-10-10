import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { SEO } from '../components/seo'
import { useLocale } from '../context/LocaleContext'
import { substituteBrand } from '../utils/substituteBrand'

/**
 * Terms of Service
 *
 * Placeholder copy. Replace each section with text reviewed
 * by a lawyer before launch. The page body comes from the
 * i18n dictionaries (`termsBody`); the chrome (title, lead,
 * section titles) comes from the same `useLocale()` call.
 * Brand name and inbox are read from `data/brand.js` and
 * substituted at render time, so a brand reskin is a
 * one-file edit.
 *
 * Bracketed `[...]` markers that aren't `[BRAND_NAME]` or
 * `[BRAND_EMAIL]` flag the spots that still need real
 * values (jurisdiction, governing law, etc.) instead of
 * plausible defaults. Do not invent those here — the user
 * still has to fill them in.
 */

const Page = styled.main`
  max-width: var(--max);
  margin-inline: auto;
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

const Terms = () => {
  const { termsBody, termsSections, termsPage } = useLocale()
  return (
    <Page>
      <SEO
        title={termsPage.seoTitle}
        description={termsPage.seoDescription}
        path="/terms"
      />
      <Navbar />
      <PageHeader
        title={termsPage.title}
        lead={termsPage.lead}
        imageVariant="bannerAlt"
      />
      <Body>
        <Meta>{substituteBrand(termsBody.effective)}</Meta>

        <p>{substituteBrand(termsBody.intro)}</p>

        <h2>{termsBody.usingHeading}</h2>
        <p>{termsBody.usingBody}</p>

        <h2>{termsSections[0]}</h2>
        <p>{substituteBrand(termsBody.ipBody)}</p>

        <h2>{termsSections[1]}</h2>
        <p>{termsBody.workBody}</p>

        <h2>{termsBody.disclaimersHeading}</h2>
        <p>{termsBody.disclaimersBody}</p>

        <h2>{termsSections[2]}</h2>
        <p>{substituteBrand(termsBody.liabilityBody)}</p>

        <h2>{termsBody.governingHeading}</h2>
        <p>{substituteBrand(termsBody.governingBody)}</p>

        <h2>{termsSections[3]}</h2>
        <p>{termsBody.changesOutro}</p>

        <h2>{termsBody.contactHeading}</h2>
        <p>{substituteBrand(termsBody.contactBody)}</p>
      </Body>
      <Footer />
    </Page>
  )
}

export default Terms
