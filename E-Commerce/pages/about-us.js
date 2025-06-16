import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { subscribe } from '../actions/mainActions'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class AboutUs extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

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
        <div className='col-md-12 page-wrap'>
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
        page='about-us'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='container page-container'>
          <h1 className='main-page-title'>
            {language.about_us.data.text1au2.value}
          </h1>
          <div className='page-title-border'></div>
        </div>
        <div className='container page-wrap'>
          {language.about_us.data.text2au2.value != '' && (
            <React.Fragment>
              <div className='row'>
                <div className='col-md-12'>
                  <p className='desc-p'>
                    {language.about_us.data.text2au2.value}
                  </p>
                </div>
              </div>
            </React.Fragment>
          )}
          {language.about_us.data.datas.map(this.renderSingleTerm)}
        </div>
        <div className='pb-5'></div>
      </Layout>
    )
  }
}

AboutUs.getInitialProps = async function (context) {
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

export default connect(mapStateToProps, mapDispatchToProps)(AboutUs)
