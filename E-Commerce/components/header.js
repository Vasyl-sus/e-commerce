import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import Link from 'next/link'
import { connect } from 'react-redux'
import { openLanguages } from '../actions/mainActions.js'

import {
  homePageRoute,
  blogRoute,
  ambasadorsRoute,
  kontaktPage,
  productsRoute,
  cartPage,
} from '../constants/constants'

class Header extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
    this.openSidebar = this.openSidebar.bind(this)
    this.openLangs = this.openLangs.bind(this)
  }

  componentDidMount() {}

  openLangs() {
    this.props.openLanguages(!this.props.isLanguagesOpen)
  }

  openSidebar() {
    this.props.toggleSidebar()
  }

  render() {
    const { language, lang, country, cart, routes } = this.props
    var accL = 0
    var thC = 0

    const arrAccessories = Array.isArray(cart.accessories) ? cart.accessories : [];

    let c = [...arrAccessories, ...cart.therapies]

    c.forEach(cc => {
      accL += cc.quantity
    })

    let cartLink = (routes &&
      routes.find(r => {
        return r.page == cartPage
      })) || { route: '' }

    var homeLink = (routes &&
      routes.find(r => {
        return r.page == homePageRoute
      })) || { route: '' }
    var blogLink = (routes &&
      routes.find(r => {
        return r.page == blogRoute
      })) || { route: '' }
    var ambasadorsLink = (routes &&
      routes.find(r => {
        return r.page == ambasadorsRoute
      })) || { route: '' }
    var productsLink = (routes &&
      routes.find(r => {
        return r.page == productsRoute
      })) || { route: '' }
    var contactLink = (routes &&
      routes.find(r => {
        return r.page == kontaktPage
      })) || { route: '' }

    return (
      <header
        className={`${
          this.props.shrink ? '' : 'start-header'
        } container-fluid`}>
        <div className='row header-menu'>
          <div className='header-menu-inner d-flex flex-row align-items-center align-content-center'>
            <div className='logo-box'>
              <Link
                href={homeLink.page}
                as={`/${lang}-${country}/${homeLink.route}`}>
                <a>
                  <img
                    alt='Lux Cosmetics logo'
                    className='logo pointer'
                    src='/static/images/logo-white.svg'
                  />
                </a>
              </Link>
            </div>
            <nav className='navbar navbar-expand-lg navbar-lux pod-header-wrap mr-auto'>
              <div
                className='collapse navbar-collapse'
                id='navbarSupportedContent'>
                <ul className='navbar-nav'>
                  <li className='nav-item active'>
                    <Link
                      href={productsLink.page}
                      as={`/${lang}-${country}/${productsLink.route}`}>
                      <a className='nav-link'>
                        {language.header.data.nav_1.value}
                        <span className='sr-only'>(current)</span>
                      </a>
                    </Link>
                  </li>
                  <li className='nav-item'>
                    <Link
                      href={ambasadorsLink.page}
                      as={`/${lang}-${country}/${ambasadorsLink.route}`}>
                      <a className='nav-link'>
                        {language.header.data.nav_2.value}
                        <span className='sr-only'>(current)</span>
                      </a>
                    </Link>
                  </li>
                  <li className='nav-item'>
                    <Link
                      href={blogLink.page}
                      as={`/${lang}-${country}/${blogLink.route}`}>
                      <a className='nav-link'>
                        {language.header.data.nav_3.value}
                        <span className='sr-only'>(current)</span>
                      </a>
                    </Link>
                  </li>
                  <li className='nav-item'>
                    <Link
                      href={contactLink.page}
                      as={`/${lang}-${country}/${contactLink.route}`}>
                      <a className='nav-link'>
                        {language.header.data.nav_4.value}
                        <span className='sr-only'>(current)</span>
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
            <div className='numb-wrap d-none d-md-block'>
              <div className='waves-wrap d-flex align-items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 16.32 36.4'>
                  <defs>
                    <style>{`.cls-phone-head{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:1.5px;}`}</style>
                  </defs>
                  <title>phone-waves</title>
                  <g id='Layer_2' data-name='Layer 2'>
                    <g id='page_2' data-name='page 2'>
                      <path
                        className='cls-phone-head'
                        d='M4.83,36.07A41.17,41.17,0,0,1,4.83.33'
                      />
                      <path
                        className='cls-phone-head'
                        d='M15.64,30.87a29.22,29.22,0,0,1,0-25.34'
                      />
                    </g>
                  </g>
                </svg>
                <a href={`tel: ${language.header.data.telnum.value}`}>
                  {language.header.data.telnum.value}
                </a>
              </div>
            </div>
            <div data-pointer='lang-c' className='pointer country-div'>
              <div
                data-pointer='lang-c'
                onClick={this.openLangs}
                className='d-none d-lg-flex'>
                <div data-pointer='lang-c'>
                  <img
                    data-pointer='lang-c'
                    className='lang-flag'
                    src={`/static/images/flags/${country}.svg`}
                    alt='Choose country'
                  />
                </div>
                <div data-pointer='lang-c'>
                  <img
                    data-pointer='lang-c'
                    className='down down-arrow'
                    width='20'
                    src='/static/images/down-arrow.svg'
                    alt='down arrov'
                  />
                </div>
              </div>
              <div className='d-flex d-lg-none align-items-center'>
                <Link
                  href={cartLink.page}
                  as={`/${lang}-${country}/${cartLink.route}`}>
                  <div
                    className={`${
                      accL > 0 || thC > 0
                        ? 'd-lg-none d-flex align-items-center px-4 pink-cart-resp active-cart'
                        : 'd-lg-none d-flex align-items-center px-4 pink-cart-resp'
                    }`}>
                    <img
                      alt='cart image'
                      className='pointer cart-image'
                      src='/static/images/cart-header.svg'
                    />
                    <span className='pointer cart-num'>{accL + thC}</span>
                  </div>
                </Link>
                <div
                  data-pointer='lang-c'
                  className='d-lg-none d-flex align-items-center header-menu-small'>
                  <img
                    data-pointer='lang-c'
                    alt='menu image'
                    width='20'
                    height='20'
                    onClick={this.openSidebar}
                    src='/static/images/menu-three-horizontal-lines-symbol.svg'
                    className=''
                  />
                  <span data-pointer='lang-c' onClick={this.openSidebar}>
                    MENU
                  </span>
                </div>
              </div>
            </div>
            <Link
              href={cartLink.page}
              as={`/${lang}-${country}/${cartLink.route}`}>
              <div
                className={`pointer ${
                  accL > 0 || thC > 0
                    ? 'rose-part d-none d-lg-flex align-items-center active-cart'
                    : 'rose-part d-none d-lg-flex align-items-center'
                }`}>
                <img
                  alt='image'
                  className='pointer cart-image'
                  src='/static/images/cart-header.svg'
                />
                <span className='pointer cart-num'>{accL + thC}</span>
              </div>
            </Link>
          </div>
        </div>
      </header>
    )
  }
}

Header.propTypes = {
  cart: PropTypes.object.isRequired,
}

const mapDispatchToProps = dispatch => {
  return {
    openLanguages: bindActionCreators(openLanguages, dispatch),
  }
}
const mapStateToProps = state => {
  return {
    isLanguagesOpen: state.main.isLanguagesOpen,
    currency: state.cart.currency,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
