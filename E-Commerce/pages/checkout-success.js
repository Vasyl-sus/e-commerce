import axios from 'axios'
import Link from 'next/link'
import Router from 'next/router'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addOtoToCart, addToCart, getOtos } from '../actions/cartActions.js'
import Counter from '../components/custom-counter'
import FlipClock from '../components/flipClock2.js'
import Layout from '../components/layout'
import OtoWrap from '../components/oto-wrap'
import { parseLanguageModules } from '../components/services.js'
import { LOADING, ROOT_URL, successPageRoute } from '../constants/constants'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class CheckoutSuccess extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isOver: false,
      otoSuccess: 2,
      complete: false,
    }

    this.renderOto = this.renderOto.bind(this)
    this.addToCart = this.addToCart.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
    if (!this.props.query?.oto_id) this.props.getOtos(this.props.query?.id)
    if (this.props.query?.success) {
      this.setState({ otoSuccess: 1 })
    }

    let exd =
      new Date(this.props.expire_date).getTime() - new Date().getTime() || 0
    exd = (exd % 60000) / 100
    if (exd < 0) {
      this.completeCountDown()
    }
  }

  addToCart(data) {
    let type = data.oto_accessory_id ? 'accessory' : 'therapy'
    var obj = {
      order_id: this.props.order_info.id,
      oto_id: this.props.otos.id,
      item_id: data.id,
      item_type: type,
      product_id: data.product_id,
    }

    ;(async () => {
      const resAddOto = await this.props.addOtoToCart(obj)

      this.props.setLoading(true)
      this.props.paymentCode === 'stripe' &&
        (await axios.post(`${ROOT_URL}/stripe/intent-upsell`, resAddOto))
      this.props.setLoading(false)

      var successLink = (this.props.routes &&
        this.props.routes.find(r => {
          return r.page == successPageRoute
        })) || { route: '' }
      var path = `/${this.props.lang}-${this.props.country}/${successLink.route}?order_id=${this.props.order_info.id}&oto_id=${this.props.otos.id}&success=1`

      Router.push(path)
    })()
  }

  renderer({ hours, minutes, seconds, completed }) {
    if (completed) {
      if (this.state.isOver == false) this.setState({ isOver: true })
      // Render a completed state
      return (
        <h2 className='text-center mt-4 rose'>
          {this.props.language.checkout_oto.data.cp.value}
        </h2>
      )
    } else {
      // Render a countdown
      return <Counter hours={hours} minutes={minutes} seconds={seconds} />
    }
  }

  renderOto(data, index) {
    return (
      <OtoWrap
        key={index}
        disc={this.props.otos.discount}
        language={this.props.language}
        addToCart={this.addToCart}
        data={data}
        currency={this.props.currency}
      />
    )
  }

  completeCountDown = () => {
    this.setState({ complete: true })
  }

  render() {
    const {
      language,
      routes,
      lang,
      country,
      langConfig,
      expire_date,
      otos,
      currency,
      sticky_note,
      locale,
      countries,
      all_routes,
    } = this.props
    let exd = new Date(expire_date).getTime() - new Date().getTime() || 0
    exd = (exd % 60000) / 100
    exd = exd < 0 ? 0 : exd
    return (
      <Layout
        all_routes={all_routes}
        countries={countries}
        locale={locale}
        sticky_note={sticky_note}
        page='checkout-success'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='container'>
          <h1 className='blog-post-title mt-5'>
            {language.checkout.data.uont.value}
          </h1>
          <div className='border blog-p-t-border'></div>
          {this.props.order_info &&
            this.props.order_info.oto == 0 &&
            !expire_date && (
              <div
                className='text-center desc-p mt-5'
                dangerouslySetInnerHTML={{
                  __html: language.checkout.data.uont1.value,
                }}></div>
            )}
          {this.props.order_info &&
            this.props.order_info.oto == 0 &&
            expire_date && (
              <div>
                <div
                  className='text-center mt-5 desc-p success-content'
                  dangerouslySetInnerHTML={{
                    __html: (otos && otos.additional_text) || '',
                  }}></div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: language.checkout_oto.data.peppp.value,
                  }}></div>
                <p className='text-center title-oto-count'>
                  {language.checkout_oto.data.dktp.value}
                </p>
                {!this.state.complete ? (
                  <FlipClock
                    time={exd}
                    onStop={this.completeCountDown}
                    clockFace='MinuteCounter'
                  />
                ) : (
                  <h2 className='text-center mt-4 rose'>
                    {' '}
                    {this.props.language.checkout_oto.data.cp.value}
                  </h2>
                )}
                <div
                  className={`row my-5 py-5 justify-content-center ${
                    this.state.complete ? 'faded-oto' : ''
                  }`}>
                  {otos && otos.therapies && otos.therapies.map(this.renderOto)}
                  {otos &&
                    otos.accessories &&
                    otos.accessories.map(this.renderOto)}
                </div>
              </div>
            )}
          {this.state.otoSuccess === 1 && (
            <div
              className='text-center desc-p mt-5'
              dangerouslySetInnerHTML={{
                __html: language.checkout.data.uont2.value,
              }}></div>
          )}
          <div className='text-center'>
            <Link href={'/home'} as={`/${lang}-${country}`}>
              <button className='btn btn-primary btn-main'>
                {language.checkout.data.c_button.value}
              </button>
            </Link>
          </div>
        </div>
        <div className='pb-5'></div>
      </Layout>
    )
  }
}

CheckoutSuccess.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })
  return data
}

const mapDispatchToProps = dispatch => {
  return {
    getOtos: bindActionCreators(getOtos, dispatch),
    addToCart: bindActionCreators(addToCart, dispatch),
    addOtoToCart: bindActionCreators(addOtoToCart, dispatch),
    setLoading: isLoading => dispatch({ type: LOADING, payload: isLoading }),
  }
}
const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    routes: props.language.routes,
    otos: state.cart.otos,
    paymentCode: state.cart.customer.payment_method_code,
    order_info: state.cart.order_info,
    countries: props.initData.countries,
    expire_date: state.cart.expire_date,
    isOto: state.cart.isOto,
    currency: props.initData.currency,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutSuccess)
