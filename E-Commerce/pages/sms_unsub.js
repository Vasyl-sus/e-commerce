import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { unsubscribeInfoBip } from '../actions/mainActions'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import UnsubForm from '../components/unsubForm'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class SmsUnsubPage extends React.Component {
  constructor(props) {
    super(props)

    this._unsubscribeInfoBip = this._unsubscribeInfoBip.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  _unsubscribeInfoBip(telephone) {
    this.props.unsubscribeInfoBip(telephone)
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
      unsubscribe_result,
    } = this.props
    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        countries={countries}
        page='sms_unsub'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='container-fluid'>
          <div className='container page-container'>
            <h1 className='main-page-title'>
              {language.sms_unsub.data.mainTitle.value}
            </h1>
            <div className='page-title-border'></div>
          </div>
          <div className='container page-wrap'>
            <div className='row'>
              <div className='col-12 desc-p'>
                <p className='text-center mb-2'>
                  {language.sms_unsub.data.descriptionOne.value}
                </p>
                <p className='text-center mb-4'>
                  {language.sms_unsub.data.descriptionTwo.value}
                </p>
                <UnsubForm
                  unsubscribe_result={unsubscribe_result}
                  country={country}
                  unsubscribeInfoBip={this._unsubscribeInfoBip}
                  language={language}
                />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

SmsUnsubPage.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return {
    unsubscribeInfoBip: bindActionCreators(unsubscribeInfoBip, dispatch),
  }
}
const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    unsubscribe_result: state.main.unsubscribe_result,
    routes: props.language.routes,
    currency: props.initData.currency,
    countries: props.initData.countries,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SmsUnsubPage)
