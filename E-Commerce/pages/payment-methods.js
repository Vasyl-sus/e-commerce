import React from 'react'
import { connect } from 'react-redux'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class PaymentMethods extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.renderSingleTerm = this.renderSingleTerm.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  subscribe(email) {
    this.props.subscribe({ email })
  }

  renderSingleTerm(row, index) {
    return (
      <div key={index} className='row mt-5'>
        <div className='col-md-12 post-wrap'>
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
        page='payment'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}>
        <div className='container s-top-m'>
          <h1 className='blog-post-title'>
            {language.payment.data.h1t1.value}
          </h1>
          <div className='border blog-p-t-border'></div>
        </div>
        <div className='container blog-post-wrap pt-5'>
          <div className='row'>
            <div className='col-md-12 post-wrap'>
              <p className='desc-p'>{language.payment.data.h1_text1t1.value}</p>
            </div>
          </div>
          {language.payment.data.datas.map(this.renderSingleTerm)}
        </div>
        <div className='pb-5'></div>
      </Layout>
    )
  }
}

PaymentMethods.getInitialProps = async function (context) {
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
    accessories: props.initData.accessories,
    routes: props.language.routes,
    countries: props.initData.countries,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps)(PaymentMethods)
