import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { subscribe } from '../actions/mainActions'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class HowToBuy extends React.Component {
  constructor(props) {
    super(props)

    this.subscribe = this.subscribe.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  subscribe(email) {
    this.props.subscribe({ email })
  }

  renderSingleTerm = (row, index) => {
    return (
      <div key={index} className='row mt-5'>
        <div className='col-md-12'>
          <div className='border-b-p'></div>
          <p className='title'>{row.name}</p>

          <div
            className='desc-p'
            dangerouslySetInnerHTML={{ __html: row.value }}></div>
        </div>
      </div>
    )
  }

  render() {
    const {
      language,
      routes,
      lang,
      country,
      langConfig,
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
        page='how_to_buy'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='container page-container'>
          <h1 className='main-page-title'>
            {language.how_to_buy.data.text1hb2.value}
          </h1>
          <div className='page-title-border'></div>
        </div>
        <div className='container page-wrap'>
          <div
            className='desc-p'
            dangerouslySetInnerHTML={{
              __html: language.how_to_buy.data.text2hb2.value,
            }}></div>
        </div>
      </Layout>
    )
  }
}

HowToBuy.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return {
    subscribe: bindActionCreators(subscribe, dispatch),
  }
}
const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    subscribe_result: state.main.subscribe_result,
    accessories: props.initData.accessories,
    routes: props.language.routes,
    currency: props.initData.currency,
    countries: props.initData.countries,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HowToBuy)
