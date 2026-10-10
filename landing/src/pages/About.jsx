import styled from '@emotion/styled'
import { colors } from '../styles/colors'
import Navbar from '../components/sections/Navbar'
import PageHeader from '../components/sections/PageHeader'
import Developer from '../components/sections/Developer'
import CTABand from '../components/sections/CTABand'
import Footer from '../components/sections/Footer'
import { SEO } from '../components/seo'
import { developerPreviews } from '../data/developerPreviews.jsx'
import { useLocale } from '../context/LocaleContext'

/**
 * About page
 *
 * "Meet the Team." One section per developer, alternating
 * sides. Closing CTA band before the footer.
 */

const Page = styled.main`
  max-width: var(--max);
  margin-inline: auto;
  min-height: 100vh;
  background: ${colors.paper};
`

export default function About() {
  const { developers, aboutPage } = useLocale()
  return (
    <Page>
      <SEO
        title={aboutPage.seoTitle}
        description={aboutPage.seoDescription}
        path="/about"
      />
      <Navbar />
      <PageHeader
        title={aboutPage.title}
        lead={aboutPage.lead}
        imageVariant="bannerAlt"
      />

      {developers.map((dev, i) => (
        <Developer
          key={dev.name + i}
          dev={dev}
          preview={developerPreviews[i] || developerPreviews[0]}
          reversed={i % 2 === 1}
        />
      ))}
      <CTABand />
      <Footer />
    </Page>
  )
}
