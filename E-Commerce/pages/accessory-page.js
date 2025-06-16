import React from 'react'
import { bindActionCreators } from 'redux'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import AccessoryInfoWrap from '../components/accessory-info-wrap'
import CartModal from '../components/cart_modal'
import { addToDataLayer } from '../components/services'
import { ROOT_URL } from '../constants/constants.js'
import { PageView, ViewContent } from '../actions/facebookActions'

import { addToCart, openCartModal } from '../actions/cartActions.js'
import { connect } from 'react-redux'
import { getInitConfig } from '../utils/helpers/getInitConfig'

class AccPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.closeCartModal = this.closeCartModal.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
    const { accessory, currency } = this.props
    let options = accessory?.options?.map((c, index) => {
      return {
        id: c.id,
        name: c.name,
        price: accessory.reduced_price,
        brand: 'E-Commerce',
        category: c.category,
        position: index,
        quantity: 1,
      }
    })
    let options2 = accessory?.options?.map((c, index) => {
      return {
        item_id: c.id,
        item_name: c.name,
        price: accessory.reduced_price,
        item_brand: 'E-Commerce',
        item_category: c.category,
        index: index,
        quantity: 1,
      }
    })
    if (currency.code == 'FT') currency.code = 'HUF'
    const viewContentData = {
      url: window.location.href,
      currency: currency.code,
      item: options,
    }
    ViewContent(viewContentData);
    addToDataLayer('EEProductDetail', {
      therapies: options,
      therapiesGA4: options2,
      currencycode: this.props.currency.code,
    })

  }

  addToCart = (therapy, product) => {
    this.props.addToCart(
      { therapy, new_quantity: 1, product },
      this.props.currency,
    )
    this.props.openCartModal()
  }

  closeCartModal() {
    this.props.closeCartModal()
  }

  render() {
    const {
      language,
      routes,
      lang,
      country,
      langConfig,
      accessory,
      all_routes,
      currency,
      countries,
      open_cart_modal,
      cart,
      addedTherapy,
      addedProduct,
      locale,
      sticky_note,
      fixed,
    } = this.props
    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        countries={countries}
        accessoryMeta={accessory}
        page='accessory_page'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <AccessoryInfoWrap
          fixed={fixed}
          language={language}
          country={country}
          addToCart={this.addToCart}
          accessory={accessory}
          currency={currency}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: `
          {
            "@context": "http://schema.org",
            "@type": "Product",
            "name": "${accessory.name}",
            "description": "",
            "image": "${
              accessory.profile_image && accessory.profile_image.link
            }",
            "brand": "E-Commerce Cosmetics",
            "offers": {
              "@type": "Offer",
              "availability": "http://schema.org/InStock",
              "price": "${accessory.reduced_price}",
              "priceCurrency": "${currency?.code ? currency?.code : 'EUR'}"
            }
          }
        `,
          }}
        />
        <CartModal
          fixed={fixed}
          addedProduct={addedProduct}
          addedTherapy={addedTherapy}
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

AccPage.getInitialProps = async function (context) {
  let q = context.query

  var data
  const initData = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/accessories/${q.acc_category}`,
  })

  return initData
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: bindActionCreators(addToCart, dispatch),
    openCartModal: bindActionCreators(openCartModal, dispatch),
    closeCartModal: bindActionCreators(openCartModal, dispatch),
  }
}
const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    accessory: props.accessory,
    page_route: props.page_route,
    routes: props.language.routes,
    currency: props.initData.currency,
    open_cart_modal: state.cart.open_cart_modal,
    countries: props.initData.countries,
    cart: state.cart.cart,
    addedTherapy: state.cart.addedTherapy,
    addedProduct: state.cart.addedProduct,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    fixed: state.main.fixed,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccPage)
