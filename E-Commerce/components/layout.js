import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Head from 'next/head'
import Router from 'next/router'
import { bindActionCreators } from 'redux'
import Loading from './loading.js'
import Header from './header.js'
import Footer from './footer.js'
import Sidebar from './sidebar.js'
import CheckoutHeader from './checkout-header'
import CheckoutFooter from './checkout-footer'
import LanguagePicker from './language-picker'
import { ROOT_URL } from '../constants/constants'
import StickyBar from './sticky_bar'

import { setLanguage } from '../actions/mainActions.js'
import { getCart } from '../actions/cartActions.js'

class Layout extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      sidebarOpen: false,
      respHeadShrink: false,
      sticky: {},
    }
    this.handleScroll = this.handleScroll.bind(this)
  }

  toggleSidebar() {
    this.setState({ sidebarOpen: !this.state.sidebarOpen })
  }

  componentDidMount() {
    let { currency, delivery_methods, payment_methods } = this.props
    this.props.getCart(currency, delivery_methods, payment_methods)

    window.addEventListener('scroll', this.handleScroll)
    if (
      window.scrollY > 200 &&
      window.innerWidth < 1025 &&
      !this.state.respHeadShrink
    )
      this.setState({ respHeadShrink: true })

    let sticky = localStorage.getItem('sticky')

    if (!sticky) {
      if (this.props.sticky_note) {
        sticky = this.props.sticky_note
        sticky.show = true
      } else {
        sticky = { show: false }
      }
      localStorage.setItem('sticky', JSON.stringify(sticky))
    } else {
      sticky = JSON.parse(sticky)
      if (this.props.sticky_note) {
        if (this.props.sticky_note.id !== sticky.id) {
          sticky = this.props.sticky_note
          sticky.show = true
          localStorage.setItem('sticky', JSON.stringify(sticky))
        }
      } else {
        sticky = { show: false }
      }
    }

    this.setState({ sticky })
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll(event) {
    if (
      window.scrollY > 200 &&
      window.innerWidth < 1025 &&
      !this.state.respHeadShrink
    )
      this.setState({ respHeadShrink: true })
    else if (
      window.scrollY <= 200 &&
      window.innerWidth < 1025 &&
      this.state.respHeadShrink
    )
      this.setState({ respHeadShrink: false })
  }

  closeSticky = () => {
    let sticky = this.state.sticky
    sticky.show = false
    localStorage.setItem('sticky', JSON.stringify(sticky))
    this.setState({ sticky })
  }

  setLanguage = (country, lang) => {
    this.props.setLanguage(country, lang, Router)
  }

  render() {
    const {
      language,
      lang,
      country,
      blogDet,
      cart,
      isCheckout,
      routes,
      cssClassName = '',
      page,
      therapiesMeta,
      countries,
      accessoryMeta,
      ambasadorsMeta,
      categoryMetas,
      sticky_note,
      locale,
      isLanguagesOpen,
      all_routes,
      product_page,
    } = this.props

    var link
    if (product_page) {
      link = (routes &&
        routes.find(r => {
          return (
            r.lang === `${lang}-${country}` && r.real_page === `${product_page}`
          )
        })) || { route: '' }
    } else {
      link = (routes &&
        routes.find(r => {
          return r.page == '/' + page && r.lang === `${lang}-${country}`
        })) || { route: '' }
    }
    var enLink

    if (product_page) {
      enLink = all_routes.find(r => {
        return (
          r.page == '/' + page &&
          r.lang === `en-gb` &&
          r.real_page === `${product_page}`
        )
      }) || { route: '' }
    } else {
      enLink = all_routes.find(r => {
        return r.page == '/' + page && r.lang === `en-gb`
      }) || { route: '' }
    }

    const metas = language.meta_data.data
    var enBlog = null
    const metaData = {}
    if (
      !blogDet &&
      page != 'product-page' &&
      page != 'accessory_page' &&
      page != 'ambasadors' &&
      page != 'blog-category'
    ) {
      metaData.title = metas[0] && metas[0].value
      metaData.description = metas[1] && metas[1].value
      metaData.keywords = metas[2] && metas[2].value
      metaData.image = `${ROOT_URL}/static/images/logo-box.jpg`
      metaData.url = `${ROOT_URL}/${lang}-${country}/${link.route}`
    } else if (!blogDet && page == 'product-page' && therapiesMeta) {
      metaData.title = therapiesMeta.display_name
      metaData.description = therapiesMeta.description
      metaData.keywords = ''
      metaData.image = therapiesMeta.image
      metaData.url = `${ROOT_URL}/${lang}-${country}/${therapiesMeta.link_name}`
    } else if (!blogDet && page == 'accessory_page' && accessoryMeta) {
      metaData.title = accessoryMeta.name
      metaData.description = accessoryMeta.description
      metaData.keywords = ''
      metaData.image =
        accessoryMeta.profile_image && accessoryMeta.profile_image.link
      metaData.url = `${ROOT_URL}/${lang}-${country}/accessories/${accessoryMeta.category}`
    } else if (!blogDet && page == 'ambasadors' && ambasadorsMeta) {
      metaData.title = ambasadorsMeta.title
      metaData.description = ambasadorsMeta.description
      metaData.keywords = ''
      metaData.image = ambasadorsMeta.image
      metaData.url = ambasadorsMeta.url
    } else if (!blogDet && page == 'blog-category' && categoryMetas) {
      metaData.title = categoryMetas.meta_title
      metaData.description = categoryMetas.meta_description
      metaData.keywords = ''
      metaData.url = categoryMetas.sef_link
    } else if (blogDet) {
      metaData.title = `${blogDet.title} - E-Commerce Cosmetics`
      metaData.description = blogDet.meta_description
      metaData.keywords = blogDet.tags.join()
      metaData.image =
        blogDet.profile_image &&
        blogDet.profile_image[0] &&
        blogDet.profile_image[0].link
      metaData.url = `${ROOT_URL}/${lang}-${country}/blog/${blogDet.url}`
      enBlog = blogDet.linked_posts.find(b => {
        return b.hreflang === 'en-gb'
      })
    }
    var altRoutes = all_routes.filter(r => {
      return r.page == `/${page}`
    }) || { lang: '', route: '' }

    var pRoutes = null
    if (product_page)
      pRoutes = all_routes.filter(r => {
        return r.real_page == `${product_page}`
      })
    return (
      <div
        className={`base-wrap ${cssClassName} ${
          this.state.sidebarOpen ? 'pull-left' : ''
        } ${isLanguagesOpen && 'disable-scroll'}`}>
        <div
          className={`full-black ${
            isLanguagesOpen ? 'language-picker-opacity' : 'd-none'
          }`}></div>
        <Head>
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
          />
          <meta property='fb:app_id' content='505499869979128' />
          <title>{metaData.title}</title>
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          <meta name='title' content={metaData.title} />
          <meta name='description' content={metaData.description} />
          <meta name='keywords' content={metaData.keywords} />
          <meta property='og:title' content={metaData.title} />
          <meta property='og:type' content='website' />
          <meta property='og:image' content={metaData.image} />
          <meta property='og:url' content={metaData.url} />
          <meta property='og:description' content={metaData.description} />
          <link
            rel='apple-touch-icon'
            sizes='180x180'
            href='/apple-touch-icon.png?v=69PAXw9A2A'
          />
          <link
            rel='icon'
            type='image/png'
            sizes='32x32'
            href='/favicon-32x32.png?v=69PAXw9A2A'
          />
          <link
            rel='icon'
            type='image/png'
            sizes='16x16'
            href='/favicon-16x16.png?v=69PAXw9A2A'
          />
          <link rel='manifest' href='/site.webmanifest?v=69PAXw9A2A' />
          <link
            rel='mask-icon'
            href='/safari-pinned-tab.svg?v=69PAXw9A2A'
            color='#5bbad5'
          />
          <link rel='shortcut icon' href='/favicon.ico?v=69PAXw9A2A' />
          <meta name='msapplication-TileColor' content='#ffffff' />
          <meta name='theme-color' content='#ffffff' />
          {blogDet && (
            <React.Fragment>
              {blogDet.linked_posts.map(l => {
                return (
                  <link
                    rel='alternate'
                    key={Math.random()}
                    href={l.link}
                    hrefLang={`${l.hreflang}`}
                  />
                )
              })}
              <link
                rel='alternate'
                key={Math.random()}
                href={`${ROOT_URL}/${lang}-${country}/blog/${blogDet.url}`}
                hrefLang={`${lang}-${country}`}
              />
            </React.Fragment>
          )}
          {product_page
            ? pRoutes.map(l => {
                return (
                  <link
                    rel='alternate'
                    key={Math.random()}
                    href={`${ROOT_URL}/${l.lang}/${l.route}`}
                    hrefLang={`${l.lang}`}
                  />
                )
              })
            : altRoutes.map(l => {
                return (
                  <link
                    rel='alternate'
                    key={Math.random()}
                    href={`${ROOT_URL}/${l.lang}/${l.route}`}
                    hrefLang={`${l.lang}`}
                  />
                )
              })}
          {!blogDet && (
            <link
              rel='alternate'
              href={`${ROOT_URL}/en-gb/${enLink.route}`}
              hrefLang={`x-default`}
            />
          )}

          {blogDet && enBlog && (
            <link
              rel='alternate'
              href={`${enBlog.link}`}
              hrefLang={`x-default`}
            />
          )}

          {blogDet &&
            blogDet.language &&
            blogDet.language.toLowerCase() === 'en' && (
              <link
                rel='alternate'
                href={`${ROOT_URL}/en-gb/blog/${blogDet.url}`}
                hrefLang={`x-default`}
              />
            )}

          {blogDet ? (
            <link
              rel='canonical'
              href={`${ROOT_URL}/${lang}-${country}/blog/${blogDet.url}`}
            />
          ) : (
            <link
              rel='canonical'
              href={`${ROOT_URL}/${lang}-${country}/${link.route}`}
            />
          )}
          <link rel='stylesheet' href='/static/css/flipclock.css' />
        </Head>
        <Loading type='all' />
        {!isCheckout ? (
          <Header
            shrink={this.state.respHeadShrink}
            routes={routes}
            cart={cart}
            toggleSidebar={this.toggleSidebar.bind(this)}
            language={language}
            lang={lang}
            country={country}
          />
        ) : (
          <CheckoutHeader
            routes={routes}
            language={language}
            lang={lang}
            country={country}
          />
        )}

        <div
          className={`child-base-wrap ${
            sticky_note &&
            this.state.sticky &&
            this.state.sticky.show &&
            `down-wrap-padding`
          }`}>
          <div className='overlay'></div>
          {this.props.children}
        </div>
        {this.state.sidebarOpen && (
          <Sidebar
            sidebarOpen={this.state.sidebarOpen}
            routes={routes}
            countries={countries}
            toggleSidebar={this.toggleSidebar.bind(this)}
            language={language}
            lang={lang}
            country={country}
          />
        )}
        {!isCheckout ? (
          <Footer
            page={page}
            language={language}
            routes={routes}
            lang={lang}
            country={country}
          />
        ) : (
          <CheckoutFooter
            page={page}
            language={language}
            routes={routes}
            lang={lang}
            country={country}
          />
        )}

        <LanguagePicker
          therapiesMeta={therapiesMeta}
          page={page}
          setLanguage={this.setLanguage}
          all_routes={all_routes}
          locale={locale}
          countries={countries}
          routes={routes}
          language={language}
          country={country}
          lang={lang}
        />
        {!isCheckout ? (
          <StickyBar
            country={country}
            lang={lang}
            closeSticky={this.closeSticky}
            show={this.state.sticky.show}
            sticky_note={sticky_note}
          />
        ) : (
          ''
        )}
      </div>
    )
  }
}

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

const mapDispatchToProps = dispatch => {
  return {
    setLanguage: bindActionCreators(setLanguage, dispatch),
    getCart: bindActionCreators(getCart, dispatch),
  }
}
const mapStateToProps = state => {
  return {
    cart: state.cart.cart,
    isLanguagesOpen: state.main.isLanguagesOpen,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout)
