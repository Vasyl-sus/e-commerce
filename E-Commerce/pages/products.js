import React from 'react'
import { connect } from 'react-redux'
import AccessoriesWrapStandard from '../components/accessories-wrap-standard'
import HomeTherapy from '../components/home-therapy'
import Layout from '../components/layout'
import { addToDataLayer } from '../components/services'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL} from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'
import { PageView as GA4PageView, ViewItemList } from '../actions/googleAnalyticsActions'

class Products extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

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
    
    let therapies = [...this.props.therapies, ...this.props.accessories]
    let therapies1 = therapies.map((c, index) => {
      return {
        id: c.id,
        name: c.name,
        price: c.total_price || c.reduced_price,
        brand: 'Lux-Cosmetics',
        category: c.category,
        position: index,
        quantity: 1,
      }
    })

    let therapiesGA4 = therapies.map((c, index) => {
      return {
        item_id: c.id,
        item_name: c.name,
        price: c.total_price || c.reduced_price,
        item_brand: 'Lux-Cosmetics',
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
      list_name: 'Products list',
      currency: this.props.currency.code
    });
  }

  renderSingleTherapy(row, index) {
    return (
      <HomeTherapy
        module_location='Products list'
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
      categories = [],
      currency,
      countries,
      sticky_note,
      locale,
      fixed,
      all_routes,
    } = this.props
    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        countries={countries}
        page='products'
        routes={routes}
        langConfig={langConfig}
        sticky_note={sticky_note}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='container page-container'>
          <h1 className='main-page-title'>
            {language.header.data.nav_1.value}
          </h1>
          <div className='page-title-border'></div>
        </div>
        <div className='container page-title-desc'>
          <p className='description'>{language.header.data.ph1.value}</p>
          <div className='row'>{categories.map(this.renderSingleTherapy)}</div>
        </div>
        <div className='container'>
          <div className='home-b border'></div>
        </div>
        <AccessoriesWrapStandard
          fixed={fixed}
          module_location='Products list'
          lang={lang}
          country={country}
          language={language}
          accessories={accessories}
          currency={currency}
        />
        <div className='pb-5'></div>
      </Layout>
    )
  }
}

Products.getInitialProps = async function (context) {
  try{
    const data = await getInitConfig({
      context,
      link: `${ROOT_URL}/lang/langconfig`,
    })
    return data


  }
  catch (e){
    console.error(e)
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
    fixed: state.main.fixed,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps)(Products)
