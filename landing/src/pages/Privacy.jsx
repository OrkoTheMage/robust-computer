import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Footer from '../components/sections/Footer'
import { SEO } from '../components/seo'
import { useLocale } from '../context/LocaleContext'
import { substituteBrand } from '../utils/substituteBrand'

/**
 * Privacy Policy
 *
 * Placeholder copy. Replace each section with text reviewed
 * by a lawyer before launch. The page body comes from the
 * i18n dictionaries (`privacyBody`); the chrome (title,
 * lead, section titles) comes from the same `useLocale()`
 * call. Brand name and inbox are read from `data/brand.js`
 * and substituted at render time, so a brand reskin is a
 * one-file edit.
 *
 * Bracketed `[...]` markers that aren't `[BRAND_NAME]` or
 * `[BRAND_EMAIL]` flag the spots that still need real
 * values (date, region, retention period, SMTP provider,
 * etc.) instead of plausible defaults. Do not invent those
 * here — the user still has to fill them in.
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

const Privacy = () => {
  const { privacyBody, privacySections, privacyPage } = useLocale()
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
        <Meta>{substituteBrand(privacyBody.effective)}</Meta>

        <p>{substituteBrand(privacyBody.intro)}</p>

        <h2>{privacyBody.collectHeading}</h2>
        <p>{privacyBody.collectBody}</p>

        <h2>{privacyBody.useHeading}</h2>
        <p>{privacyBody.useBody}</p>

        <h2>{privacyBody.whereHeading}</h2>
        <p>{substituteBrand(privacyBody.whereBody)}</p>

        <h2>{privacyBody.retentionHeading}</h2>
        <p>{substituteBrand(privacyBody.retentionBody)}</p>

        <h2>{privacySections[0]}</h2>
        <p>{privacyBody.cookiesBody}</p>

        <h2>{privacyBody.rightsHeading}</h2>
        <p>{privacyBody.rightsBody}</p>
        <ul>
          {privacyBody.rightsList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{substituteBrand(privacyBody.rightsOutro)}</p>

        <h2>{privacySections[1]}</h2>
        <p>{privacyBody.changesOutro}</p>
      </Body>
      <Footer />
    </Page>
  )
}

export default Privacy
