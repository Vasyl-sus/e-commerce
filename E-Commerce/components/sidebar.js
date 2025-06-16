import React from 'react'
import Link from 'next/link'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { openLanguages } from '../actions/mainActions.js'
import {
  blogRoute,
  ambasadorsRoute,
  kontaktPage,
  productsRoute,
} from '../constants/constants'

class Sidebar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: {
        name: 'SLOVENIA',
        value: 'SLOVENIA',
        label: 'SLOVENIA',
        flag: '/static/images/slo.png',
      },
      openLangs: false,
    }

    this.close = this.close.bind(this)
    this.openLangs = this.openLangs.bind(this)
  }

  openLangs() {
    this.props.openLanguages(!this.props.isLanguagesOpen)
  }

  openMenu() {
    this.setState({ selected: !this.state.selected })
  }

  changeCountry(event) {
    this.setState({ selected: event })
  }

  close() {
    this.props.toggleSidebar()
  }

  closeModal = () => {
    this.setState({ openLangs: false })
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.handleClickOutside)
    window.addEventListener('touchstart', this.handleClickOutside)
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handleClickOutside)
    window.removeEventListener('touchstart', this.handleClickOutside)
  }

  setWrapperRef = node => {
    this.wrapperRef1 = node
  }

  handleClickOutside = event => {
    if (this.wrapperRef1 && !this.wrapperRef1.contains(event.target)) {
      if (
        this.props.sidebarOpen &&
        event.srcElement.dataset.pointer != 'lang-c'
      ) {
        this.props.toggleSidebar(false)
      }
    }
  }

  render() {
    const { language, lang, country, routes, countries } = this.props

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

    let cc = countries.find(c => {
      return c.name.toLowerCase() === country.toLowerCase()
    })
    return (
      <div ref={this.setWrapperRef} className='sidebar'>
        <div className='container'>
          <div className='pt-4 pr-3 text-right'>
            <img
              src='/static/images/times.svg'
              className='sidebar-x'
              onClick={this.close}
              alt='times image'
            />
          </div>
          <div className='text-left links-wrap pl-4'>
            <div className='mb-3'>
              <Link
                href={productsLink.page}
                as={`/${lang}-${country}/${productsLink.route}`}>
                <a className='link'>{language.header.data.nav_1.value}</a>
              </Link>
            </div>
            <div className='mb-3'>
              <Link
                href={ambasadorsLink.page}
                as={`/${lang}-${country}/${ambasadorsLink.route}`}>
                <a className='link'>{language.header.data.nav_2.value}</a>
              </Link>
            </div>
            <div className='mb-3'>
              <Link
                href={blogLink.page}
                as={`/${lang}-${country}/${blogLink.route}`}>
                <a className='link'>{language.header.data.nav_3.value}</a>
              </Link>
            </div>
            <div className='mb-3'>
              <Link
                href={contactLink.page}
                as={`/${lang}-${country}/${contactLink.route}`}>
                <a className='link'>{language.header.data.nav_4.value}</a>
              </Link>
            </div>
          </div>
          <div className='numb-wrap d-block mt-5'>
            <div className='waves-wrap d-flex align-items-center'>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16.32 36.4'>
                <defs>
                  <style>{`.cls-1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:1.5px;}`}</style>
                </defs>
                <title>phone-waves</title>
                <g id='Layer_2' data-name='Layer 2'>
                  <g id='page_2' data-name='page 2'>
                    <path
                      className='cls-1'
                      d='M4.83,36.07A41.17,41.17,0,0,1,4.83.33'
                    />
                    <path
                      className='cls-1'
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
          <div
            name='lang-t'
            onClick={this.openLangs}
            className='d-flex justify-content-between sidebar-lang'>
            <div name='lang-t-flag'>
              <img
                data-pointer='lang-t'
                className='lang-flag'
                src={`/static/images/flags/${country}.svg`}
                alt='Choose country'
              />
            </div>
            <p className='lang-t-country'>{cc.full_name}</p>
            <div name='lang-t-arrow'>
              <img
                name='Language down arrow'
                alt='Down arrow'
                className='down'
                width='20'
                src='/static/images/down-arrow.svg'
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Sidebar.propTypes = {}

const mapDispatchToProps = dispatch => {
  return {
    openLanguages: bindActionCreators(openLanguages, dispatch),
  }
}
const mapStateToProps = state => {
  return {
    cart: state.cart.cart,
    isLanguagesOpen: state.main.isLanguagesOpen,
    therapies: state.cart.therapies,
    currency: state.cart.currency,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
