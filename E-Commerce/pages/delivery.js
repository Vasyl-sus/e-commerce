import React from 'react'
import { connect } from 'react-redux'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class Delivery extends React.Component {
  constructor(props) {
    super(props)

    this.renderSingleTerm = this.renderSingleTerm.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  renderSingleTerm(row, index) {
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
        page='delivery'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}>
        <div className='container page-container'>
          <h1 className='main-page-title'>
            {language.delivery.data.h1t1.value}
          </h1>
          <div className='page-title-border'></div>
        </div>
        <div className='container page-wrap'>
          {language.delivery.data.h1_text1t1.value != '' && (
            <React.Fragment>
              <div className='row'>
                <div className='col-md-12'>
                  <p className='desc-p'>
                    {language.delivery.data.h1_text1t1.value}
                  </p>
                </div>
              </div>
            </React.Fragment>
          )}
          {language.delivery.data.datas.map(this.renderSingleTerm)}
        </div>
        <div className='pb-5'></div>
      </Layout>
    )
  }
}

Delivery.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  return data
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
    countries: props.initData.countries,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps)(Delivery)
