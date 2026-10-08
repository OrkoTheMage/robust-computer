import styled from '@emotion/styled'
import { mobile } from '../../styles/breakpoints'

/**
 * Container
 *
 * Page-width wrapper. Same on every page so layout is consistent.
 */

const Container = styled.div`
  width: 100%;
  max-width: ${(p) => p.maxWidth || '1360px'};
  margin: 0 auto;
  padding: 0 24px;

  ${mobile} {
    padding: 0 18px;
  }
`

export default Container
