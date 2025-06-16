import React from 'react'
import { bindActionCreators } from 'redux'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'

import TopImageWrap from '../components/top-image-wrap.js'
import HomeTherapy from '../components/home-therapy'
import Subscribe from '../components/subscribe'
import TestimonialsWrap from '../components/testimonials-wrap'
import BlogWrap from '../components/blog-wrap'
import AccessoriesWrap from '../components/accessories-wrap'
import InstaWrap from '../components/insta-wrap'
import CartModal from '../components/cart_modal'
import { ROOT_URL } from '../constants/constants.js'
import { PageView } from '../actions/facebookActions'
import { PageView as GA4PageView } from '../actions/googleAnalyticsActions'

import { addToCart, openCartModal } from '../actions/cartActions.js'
import { subscribe } from '../actions/mainActions'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { connect } from 'react-redux'

class Home extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.renderSingleTherapy = this.renderSingleTherapy.bind(this)
    this.addToCart = this.addToCart.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.closeCartModal = this.closeCartModal.bind(this)
  }

  componentDidMount() {
    // Send to Facebook
    PageView(window.location.href);
    // Send to Google Analytics
    GA4PageView({
      url: window.location.href,
      title: document.title
    });
  }

  subscribe(email) {
    this.props.subscribe({ email })
  }

  renderSingleTherapy(row, index) {
    return (
      <HomeTherapy
        module_location='Homepage product list'
        therapies={this.props.therapies}
        currency={this.props.currency}
        lang={this.props.lang}
        country={this.props.country}
        data={row}
        key={index}
      />
    )
  }

  addToCart(id) {
    this.props.addToCart({ therapy_id: id, new_quantity: 1 })
    this.props.openCartModal()
  }

  closeCartModal() {
    this.props.closeCartModal()
  }

  render() {
    const {
      language,
      lang,
      country,
      langConfig,
      blogposts,
      accessories,
      testimonials,
      billboard,
      subscribe_result,
      ig_feeds,
      routes,
      currency,
      categories = [],
      countries,
      open_cart_modal,
      cart,
      addedTherapy,
      sticky_note,
      locale,
      fixed,
      all_routes,
    } = this.props

    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        countries={countries}
        page='home'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='container-fluid bilboard'>
          <div className='row'>
            <TopImageWrap
              language={language}
              lang={lang}
              billboard={billboard}
            />
          </div>
        </div>
        <div className='container bill-border-container'>
          <h1 className='text-center home-main-title'>
            {language.home_top.data.nh1.value}
          </h1>
          <div className='bill-border'></div>
          <p className='text-center home-main-subtitle'>
            {language.home_top.data.nh2.value}
          </p>
        </div>
        <div className='container therapies-wrap'>
          <div className='row justify-content-center'>
            {categories.map(this.renderSingleTherapy)}
          </div>
          <div className='home-border'></div>
        </div>
        <div className='container subscribe-home'>
          <Subscribe
            language={language}
            subscribe_result={subscribe_result}
            subscribe={this.subscribe}
            type='home'
          />
        </div>
        <div className='testimonials-wrap'>
          <TestimonialsWrap testimonials={testimonials} />
        </div>
        <BlogWrap
          language={language}
          lang={lang}
          country={country}
          blogposts={blogposts}
        />
        <AccessoriesWrap
          fixed={fixed}
          module_location='Homepage product list'
          language={language}
          lang={lang}
          country={country}
          addToCart={this.addToCart}
          accessories={accessories}
          currency={currency}
        />
        <InstaWrap
          addToCart={this.addToCart}
          country={country}
          lang={lang}
          currency={currency}
          language={language}
          ig_feeds={ig_feeds}
        />
        <CartModal
          fixed={fixed}
          addedTherapy={addedTherapy}
          addToCart={this.addToCart}
          closeCartModal={this.closeCartModal}
          routes={routes}
          cartModal={open_cart_modal}
          cart={cart}
          language={language}
          lang={lang}
          country={country}
          currency={currency}
        />
      </Layout>
    )
  }
}

Home.getInitialProps = async function (context) {

  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: bindActionCreators(addToCart, dispatch),
    openCartModal: bindActionCreators(openCartModal, dispatch),
    subscribe: bindActionCreators(subscribe, dispatch),
    closeCartModal: bindActionCreators(subscribe, dispatch),
  }
}
const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    therapies: props.initData.therapies,
    blogposts: props.initData.blogposts,
    accessories: props.initData.accessories,
    testimonials: props.initData.testimonials,
    billboard: props.initData.billboard,
    currency: props.initData.currency,
    subscribe_result: state.main.subscribe_result,
    ig_feeds: props.initData.ig_feeds,
    routes: props.language.routes,
    categories: props.initData.categories,
    open_cart_modal: state.cart.open_cart_modal,
    countries: props.initData.countries,
    cart: state.cart.cart,
    addedTherapy: state.cart.addedTherapy,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    fixed: state.main.fixed,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
