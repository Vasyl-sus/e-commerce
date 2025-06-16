import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { submitInfoData, verifyCallback } from '../actions/mainActions'
import AskUsForm from '../components/ask-us-form.js'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class Contact extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  verifyCallback = data => {
    this.props.verifyCallback(data)
  }

  submitInfoData = data => {
    this.props.submitInfoData(data)
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
      enableSendMessage,
      isSent,
      locale,
      all_routes,
    } = this.props

    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        countries={countries}
        page='contact'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}>
        <div className='container page-container'>
          <h1 className='main-page-title'>
            {language.contact.data.text1au.value}
          </h1>
          <div className='page-title-border'></div>
        </div>
        <div className='container page-title-desc'>
          <p
            className='description contact-description'
            dangerouslySetInnerHTML={{
              __html: language.contact.data.text2au.value,
            }}></p>
        </div>
        <div className='container page-wrap mt-5'>
          <div className='row align-items-center contact-form-block'>
            <div className='d-none d-md-block col-md-6 contact-image-block'>
              <img
                src='/static/images/contact-image.svg'
                className='contact-page-image'></img>
            </div>
            <div className={`${isSent ? 'd-none' : 'col-12 col-md-6'}`}>
              <h2>{language.contact.data.textsendmsg.value}</h2>
              <AskUsForm
                submitInfoData={this.submitInfoData}
                enableSendMessage={enableSendMessage}
                verifyCallback={this.verifyCallback}
                language={language}
              />
            </div>
            {isSent && (
              <div className='col-md-6 page-title-desc'>
                <p className='description contact-description'>
                  {language.contact.data.text2au1.value}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className='pb-5'></div>
      </Layout>
    )
  }
}

Contact.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      verifyCallback: data => verifyCallback(data),
      submitInfoData: data => submitInfoData(data),
    },
    dispatch,
  )
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
    enableSendMessage: state.main.enableSendMessage,
    sticky_note: props.initData.sticky_note,
    isSent: state.main.isSent,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Contact)
