/**
 * Navbar
 *
 * Sticky, brand-led nav. Active link gets the underline. The CTA
 * button on the right is the "start a project" call.
 */

import styled from '@emotion/styled'
import { NavLink, Link } from 'react-router-dom'
import { Button, Logo } from '../ui'

const Bar = styled.nav`
  background: var(--desk);
  border-bottom: 3px solid #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 56px;
  position: sticky;
  top: 0;
  z-index: 30;

  @media (max-width: 980px) {
    padding: 14px 24px;
  }
`

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
`

const BrandWord = styled.span`
  font-family: var(--display);
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.005em;
  text-transform: uppercase;
  line-height: 1;
  color: #000;

  @media (max-width: 760px) {
    display: none;
  }
`

const Links = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;

  @media (max-width: 760px) {
    gap: 18px;
  }
`

const NavA = styled(NavLink)`
  font-family: var(--mono);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.04em;
  text-decoration: none;
  padding: 4px 0;
  border-bottom: 3px solid transparent;
  color: #000;

  &.active {
    border-bottom-color: #000;
  }
`

const CTA = styled(Button)`
  padding: 10px 18px;
  font-size: 14px;
  box-shadow: 4px 4px 0 var(--gold);
`

const Navbar = () => (
  <Bar>
    <Brand to="/">
      <Logo variant="icon" h={58} />
      <BrandWord>ROBUST COMPUTER</BrandWord>
    </Brand>
    <Links>
      <NavA to="/about">AB0UT</NavA>
      <NavA to="/contact">C0NTACT</NavA>
      <CTA as={Link} to="/contact">
        START A PR0JECT
      </CTA>
    </Links>
  </Bar>
)

export default Navbar
