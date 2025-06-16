import React from 'react'
import Link from 'next/link'
import { homePageRoute } from '../constants/constants'

class CheckoutHeader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
    this.openSidebar = this.openSidebar.bind(this)
  }

  componentDidMount() {}

  openSidebar() {
    this.props.toggleSidebar()
  }

  render() {
    const { language, lang, country, routes } = this.props

    var homeLink = (routes &&
      routes.find(r => {
        return r.page == homePageRoute
      })) || { route: '' }
    return (
      <header className='container-fluid ch-header'>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-6'>
              <Link
                href={homeLink.page}
                as={`/${lang}-${country}/${homeLink.route}`}>
                <a>
                  <img
                    alt='E-Commerce Cosmetics'
                    className='logo pointer checkout-logo'
                    src='/static/images/logo-black.svg'
                  />
                </a>
              </Link>
            </div>
            <div className='col-6'>
              <div className='waves-wrap-b d-flex'>
                <img
                  alt='image'
                  className='waves-img'
                  src='/static/images/phone-waves-black.svg'
                />
                <a href={`tel:${language.header.data.telnum.value}`}>
                  {language.header.data.telnum.value}
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
    )
  }
}

CheckoutHeader.propTypes = {}

export default CheckoutHeader
