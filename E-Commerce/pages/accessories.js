import React from 'react'
import { bindActionCreators } from 'redux'
import { initStore } from '../store'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import HomeTherapy from '../components/home-therapy'
import { addToDataLayer } from '../components/services'
import AccessoriesWrap from '../components/accessories-wrap'
import { ROOT_URL } from '../constants/constants.js'
import { PageView } from '../actions/facebookActions'
import { PageView as GA4PageView, ViewItemList } from '../actions/googleAnalyticsActions'

import { addToCart, openCartModal } from '../actions/cartActions.js'
import { connect } from 'react-redux'
import { getInitConfig } from '../utils/helpers/getInitConfig'

class Accesories extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.addToCart = this.addToCart.bind(this)
    this.renderSingleTherapy = this.renderSingleTherapy.bind(this)
  }

  componentDidMount() {
    // Send to Facebook
    PageView(window.location.href);
    // Send to Google Analytics
    GA4PageView({
      url: window.location.href,
      title: document.title
    });
    
    let therapies1 = this.props.accessories.map((c, index) => {
      return {
        id: c.id,
        name: c.name,
        price: c.reduced_price,
        brand: 'E-Commerce',
        category: c.category,
        position: index,
        quantity: 1,
      }
    })
    let therapiesGA4 = this.props.accessories.map((c, index) => {
      return {
        item_id: c.id,
        item_name: c.name,
        price: c.reduced_price,
        item_brand: 'E-Commerce',
        item_category: c.category,
        index: index,
        quantity: 1,
        item_list_name: 'Products list'
      }
    })
    if (this.props.currency.code == 'FT') this.props.currency.code = 'HUF'
    
    // Client-side tracking
    addToDataLayer(
      'EEproductImpression',
      { therapies: therapies1, currencycode: this.props.currency.code, therapiesGA4: therapiesGA4 },
      'Products list',
    )
    
    // Server-side GA4 tracking
    ViewItemList({
      item: therapiesGA4,
      list_name: 'Accessories list',
      currency: this.props.currency.code
    });
  }

  addToCart(id) {
    this.props.addToCart({ therapy_id: id, new_quantity: 1 })
    this.props.openCartModal()
  }

  renderSingleTherapy(row, index) {
    return (
      <HomeTherapy
        module_location='Accessories list'
        therapies={this.props.therapies}
        currency={this.props.currency}
        lang={this.props.lang}
        country={this.props.country}
        data={row}
        key={index}
      />
    )
  }

  render() {
    const {
      language,
      routes,
      lang,
      country,
      langConfig,
      accessories,
      currency,
      countries,
      sticky_note,
      locale,
      all_routes,
    } = this.props
    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        countries={countries}
        page='products'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <AccessoriesWrap
          module_location='Accessories list'
          showDetails={false}
          lang={lang}
          country={country}
          language={language}
          addToCart={this.addToCart}
          accessories={accessories}
          currency={currency}
        />
        <div className='pb-5'></div>
      </Layout>
    )
  }
}

Accesories.getInitialProps = async (context) => {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/accessories`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: bindActionCreators(addToCart, dispatch),
    openCartModal: bindActionCreators(openCartModal, dispatch),
  }
}
const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    therapies: props.initData.therapies,
    page_route: props.page_route,
    accessories: props.initData.accessories,
    routes: props.language.routes,
    categories: props.initData.categories,
    currency: props.initData.currency,
    countries: props.initData.countries,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Accesories)
