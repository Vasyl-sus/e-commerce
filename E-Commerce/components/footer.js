import React from 'react'
import { bindActionCreators } from 'redux'
import Link from 'next/link'
import { connect } from 'react-redux'
import Subscribe from './subscribe'
import { subscribe } from '../actions/mainActions'

import {
  homePageRoute,
  kontaktPage,
  oNasPage,
  ppPage,
  zpPage,
  deliveryPage,
  returnsPage,
  htbPage,
  faqPage,
  testersPage,
} from '../constants/constants'

class Footer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.subscribe = this.subscribe.bind(this)
  }

  renderFooterElements(el, index) {
    return <a className='sub-links'>{el.value}</a>
  }

  subscribe(email) {
    this.props.subscribe({ email })
  }

  render() {
    const {
      page,
      language,
      lang,
      country,
      subscribe_result,
      routes,
    } = this.props
    var kontaktRoute = (routes &&
      routes.find(r => {
        return r.page == kontaktPage
      })) || { route: '' }
    var productPages = (routes &&
      routes.filter(r => {
        return r.page == '/product-page'
      })) || { route: '' }
    var oNasLink = (routes &&
      routes.find(r => {
        return r.page == oNasPage
      })) || { route: '' }
    var ppLink = (routes &&
      routes.find(r => {
        return r.page == ppPage
      })) || { route: '' }
    var homeLink = (routes &&
      routes.find(r => {
        return r.page == homePageRoute
      })) || { route: '' }

    var zpLink = (routes &&
      routes.find(r => {
        return r.page == zpPage
      })) || { route: '' }

    var deliveryLink = (routes &&
      routes.find(r => {
        return r.page == deliveryPage
      })) || { route: '' }
    var returnsLink = (routes &&
      routes.find(r => {
        return r.page == returnsPage
      })) || { route: '' }
    let htbLink = (routes &&
      routes.find(r => {
        return r.page == htbPage
      })) || { route: '' }
    let faqLink = (routes &&
      routes.find(r => {
        return r.page == faqPage
      })) || { route: '' }
    let testersLink = (routes &&
      routes.find(r => {
        return r.page == testersPage
      })) || { route: '' }

    return (
      <footer className='footer'>
        {page != 'cart' && page != 'checkout' && page != 'checkout-success' && (
          <div className='footer-icons'>
            <div className='container'>
              <div className='row'>
                <div className='col-6 col-md-3 d-flex flex-column align-items-center footer-icon-block'>
                  <img alt='image' src={language.main.data.adv3imagedark.value} />
                  <div className='text-center'>
                    <p className='main'>{language.main.data.adv3title.value}</p>
                    <p className='desc'>{language.main.data.adv3text.value}</p>
                  </div>
                </div>
                <div className='col-6 col-md-3 d-flex flex-column align-items-center footer-icon-block'>
                  <img alt='image' src={language.main.data.adv1imagedark.value} />
                  <div className='text-center'>
                    <p className='main'>{language.main.data.adv1title.value}</p>
                    <p className='desc'>{language.main.data.adv1text.value}</p>
                  </div>
                </div>
                <div className='col-6 col-md-3 d-flex flex-column align-items-center footer-icon-block'>
                  <img alt='image' src={language.main.data.adv2imagedark.value} />
                  <div className='text-center'>
                    <p className='main'>{language.main.data.adv2title.value}</p>
                    <p className='desc'>{language.main.data.adv2text.value}</p>
                  </div>
                </div>
                <div className='col-6 col-md-3 d-flex flex-column align-items-center footer-icon-block'>
                  <img alt='image' src={language.main.data.adv5imagedark.value} />
                  <div className='text-center'>
                    <p className='main'>{language.main.data.adv5title.value}</p>
                    <p className='desc'>{language.main.data.adv5text.value}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className='container-fluid footer-bottom'>
          <div className='container'>
            <div className='row'>
              <div className='col-12 d-flex align-items-center justify-content-start'>
                <div className='footer-logo'>
                  <Link
                    href={homeLink.page}
                    as={`/${lang}-${country}/${homeLink.route}`}>
                    <a>
                      <img
                        alt='Lux-Cosmetics logo'
                        className='logo pointer'
                        src='/static/images/logo-white.svg'
                      />
                    </a>
                  </Link>
                </div>
                <div className='numb-wrap'>
                  <div className='waves-wrap d-flex align-items-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 16.32 36.4'>
                      <defs>
                        <style>{`.cls-number{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:1.5px;}`}</style>
                      </defs>
                      <title>phone-waves</title>
                      <g id='Layer_2' data-name='Layer 2'>
                        <g id='page_2' data-name='page 2'>
                          <path
                            className='cls-number'
                            d='M4.83,36.07A41.17,41.17,0,0,1,4.83.33'
                          />
                          <path
                            className='cls-number'
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
                <div className='social-content d-flex align-items-center justify-content-center social-content ml-auto'>
                  <div className='d-flex social-foot fb-link'>
                    <a
                      href='https://www.facebook.com/E-Commerce/'
                      target='_blank'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 39.83 39.84'>
                        <defs>
                          <style>{`.cls-fb{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}`}</style>
                        </defs>
                        <title>footer-facebook</title>
                        <g id='Layer_2' data-name='Layer 2'>
                          <g id='page1'>
                            <g id='footer'>
                              <path
                                className='cls-fb'
                                d='M39.08,35A4.1,4.1,0,0,1,35,39.09H27.7V23.94h5.14l.77-5.82H27.7V14.44a3.35,3.35,0,0,1,.52-2,3,3,0,0,1,2.31-.77h3.08V6.49a30.87,30.87,0,0,0-4.45-.26,7.36,7.36,0,0,0-5.44,2,7.57,7.57,0,0,0-2,5.6v4.28H16.49v5.82h5.22V39.09H4.86A4,4,0,0,1,2,37.89,4,4,0,0,1,.75,35V4.86A4,4,0,0,1,2,2,4,4,0,0,1,4.86.75H35A3.92,3.92,0,0,1,37.88,2a4,4,0,0,1,1.2,2.91Z'
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </a>
                  </div>
                  <div className='d-flex social-foot ig-link'>
                    <a
                      href='https://www.instagram.com/E-Commerce/'
                      target='_blank'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 39.41 38.72'>
                        <defs>
                          <style>{`.cls-ig{fill:#f9ec31;}.cls-2{fill:#fff;}`}</style>
                        </defs>
                        <title>footer-instagram</title>
                        <g id='Layer_2' data-name='Layer 2'>
                          <g id='page1'>
                            <g id='footer'>
                              <path
                                className='cls-2'
                                d='M20.84,1.5c2.48,0,4.43,0,5.8.09a19.29,19.29,0,0,1,5.25.79,7.49,7.49,0,0,1,4.44,4.44,19.22,19.22,0,0,1,.79,5.25c.06,1.3.09,3.2.09,5.8v3c0,2.55,0,4.45-.09,5.8a20.53,20.53,0,0,1-.78,5.24l0,0a7.82,7.82,0,0,1-4.4,4.41,19.35,19.35,0,0,1-5.28.8c-1.33.06-3.28.1-5.8.1h-3c-2.45,0-4.4,0-5.79-.1a20.23,20.23,0,0,1-5.24-.78,7.89,7.89,0,0,1-4.45-4.42,20.13,20.13,0,0,1-.8-5.27c-.06-1.36-.09-3.26-.09-5.81v-3c0-2.54,0-4.44.09-5.8a19.22,19.22,0,0,1,.79-5.25A7.5,7.5,0,0,1,6.82,2.39a19.8,19.8,0,0,1,5.25-.8c1.37-.06,3.32-.09,5.8-.09h3m0-1.5h-3C15.39,0,13.41,0,12,.1A20.74,20.74,0,0,0,6.32,1,9,9,0,0,0,1,6.28,20.06,20.06,0,0,0,.1,12C0,13.37,0,15.29,0,17.87v3c0,2.58,0,4.51.1,5.88A21.31,21.31,0,0,0,1,32.42v0l0,0a9.29,9.29,0,0,0,5.27,5.23h.06a21.35,21.35,0,0,0,5.65.87c1.46.06,3.43.1,5.88.1h3c2.52,0,4.49,0,5.87-.1a20.28,20.28,0,0,0,5.73-.89l0,0h0a9.28,9.28,0,0,0,5.22-5.24v0l0,0a21.29,21.29,0,0,0,.87-5.66c.06-1.38.09-3.3.09-5.88v-3c0-2.64,0-4.56-.09-5.87a19.91,19.91,0,0,0-.89-5.71A8.9,8.9,0,0,0,32.43,1,19.82,19.82,0,0,0,26.72.1C25.3,0,23.33,0,20.84,0Z'
                              />
                              <path
                                className='cls-2'
                                d='M31.73,7a1.75,1.75,0,0,0-2.48,0,1.83,1.83,0,0,0-.31.42,1.76,1.76,0,1,0,3.31.78A1.78,1.78,0,0,0,31.73,7Z'
                              />
                              <path
                                className='cls-2'
                                d='M19.35,11.63a7.73,7.73,0,0,1,0,15.46h0a7.74,7.74,0,0,1-6.49-11.94,7.84,7.84,0,0,1,1-1.27,7.72,7.72,0,0,1,5.46-2.25m0-1.5a9.16,9.16,0,0,0-6.52,2.69,9.51,9.51,0,0,0-1.23,1.52A9.23,9.23,0,0,0,14.32,27.1a9.23,9.23,0,0,0,14.26-7.75,9.24,9.24,0,0,0-9.23-9.22Z'
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </a>
                  </div>
                  <div className='d-flex social-foot yt-link'>
                    <a href='https://www.youtube.com/E-Commerce' target='_blank'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 41.22 29.42'>
                        <defs>
                          <style>{`.cls-yt{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}`}</style>
                        </defs>
                        <title>Asset 3</title>
                        <g id='Layer_2' data-name='Layer 2'>
                          <g id='Layer_1-2' data-name='Layer 1'>
                            <g id='page1'>
                              <g id='footer'>
                                <path
                                  className='cls-yt'
                                  d='M39.67,5.11a32.69,32.69,0,0,1,.73,6l.07,3.64-.07,3.63a33.58,33.58,0,0,1-.73,6,5.16,5.16,0,0,1-3.57,3.49,50.72,50.72,0,0,1-8.87.73l-6.62.07L14,28.61a50.72,50.72,0,0,1-8.87-.73,5.16,5.16,0,0,1-3.57-3.49,33.58,33.58,0,0,1-.73-6L.75,14.72c0-1.07,0-2.28.07-3.64a32.69,32.69,0,0,1,.73-6A5.1,5.1,0,0,1,5.12,1.55,51.74,51.74,0,0,1,14,.82L20.61.75l6.62.07a51.71,51.71,0,0,1,8.87.73A5.09,5.09,0,0,1,39.67,5.11ZM16.54,20.68l10.4-6-10.4-5.9Z'
                                />
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className='row email-footer'>
              <div className='col-12'>
                <Subscribe
                  language={language}
                  subscribe_result={subscribe_result}
                  subscribe={this.subscribe}
                  type='footer'
                />
              </div>
            </div>
            <div className='row'>
              <div className='footer-border'></div>
            </div>
          </div>
        </div>
        <div className='container'>
          <div className='row first'>
            <div className='col-12 col-md-6 lux-products text-center text-md-left'>
              <h4>{language.footer.data.icfsh41.value}</h4>
              <ul className="foot-l" dangerouslySetInnerHTML={{
                __html: language?.footer?.data?.product_links?.value,
              }}>
              </ul>
            </div>
            <div className='col-6 col-md-3'>
              <h4>{language.footer.data.icfsh42.value}</h4>
              <ul className='foot-l-1'>
                <li className=''>
                  <Link
                    href={'/about-us'}
                    as={`/${lang}-${country}/${oNasLink.route}`}>
                    <a>{language.footer.data.tt1.value}</a>
                  </Link>
                </li>
                <li className='red'>
                  <Link
                    href={kontaktRoute.page}
                    as={`/${lang}-${country}/${kontaktRoute.route}`}>
                    <a>{language.footer.data.tt2.value}</a>
                  </Link>
                </li>
                <li className='red'>
                  <Link href={`/blog`} as={`/${lang}-${country}/blog`}>
                    <a>{language.footer.data.tt10.value}</a>
                  </Link>
                </li>
                <li className='red'>
                  <Link
                    href={faqLink.page}
                    as={`/${lang}-${country}/${faqLink.route}`}>
                    <a>{language.footer.data.tt12.value}</a>
                  </Link>
                </li>
                <li className='red'>
                  <Link
                    href={zpLink.page}
                    as={`/${lang}-${country}/${zpLink.route}`}>
                    <a>{language.footer.data.tt3.value}</a>
                  </Link>
                </li>
                <li className='red'>
                  <Link
                    href={ppLink.page}
                    as={`/${lang}-${country}/${ppLink.route}`}>
                    <a>{language.footer.data.tt5.value}</a>
                  </Link>
                </li>
              </ul>
            </div>
            <div className='col-6 col-md-3'>
              <h4>{language.footer.data.icfsh44.value}</h4>
              <ul className='foot-l-1'>
                <li className='red'>
                  <Link
                    href={htbLink.page}
                    as={`/${lang}-${country}/${htbLink.route}`}>
                    <a>{language.footer.data.icfsa1.value}</a>
                  </Link>
                </li>
                <li className='red'>
                  <Link
                    href={deliveryLink.page}
                    as={`/${lang}-${country}/${deliveryLink.route}`}>
                    <a>{language.footer.data.tt6.value}</a>
                  </Link>
                </li>
                <li className='red'>
                  <Link
                    href={testersLink.page}
                    as={`/${lang}-${country}/${testersLink.route}`}>
                    <a>{language.footer.data.tt13.value}</a>
                  </Link>
                </li>
                <li className='red'>
                  <Link
                    href={returnsLink.page}
                    as={`/${lang}-${country}/${returnsLink.route}`}>
                    <a>{language.footer.data.tt8.value}</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className='row'>
            <div className='footer-border'></div>
          </div>
          <div className='col-12 text-center rights'>
            <div
              dangerouslySetInnerHTML={{
                __html: language.footer.data.rights.value,
              }}></div>
          </div>
        </div>
      </footer>
    )
  }
}

Footer.propTypes = {}

const mapDispatchToProps = dispatch => {
  return {
    subscribe: bindActionCreators(subscribe, dispatch),
  }
}
const mapStateToProps = state => {
  return {
    subscribe_result: state.main.subscribe_result,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Footer)
