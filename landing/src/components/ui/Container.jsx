/**
 * Container
 *
 * Page-width wrapper. Same on every page so layout is consistent.
 */

import styled from '@emotion/styled'

const Container = styled.div`
  width: 100%;
  max-width: ${(p) => p.maxWidth || '1360px'};
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 760px) {
    padding: 0 18px;
  }
`

export default Container
