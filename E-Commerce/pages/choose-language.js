import Link from 'next/link'
import React from 'react'
import { connect } from 'react-redux'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants.js'
import { PageView } from '../actions/facebookActions'

class ChooseLanguage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      activeCountry: null,
    }

    this.renderSingleCountry = this.renderSingleCountry.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  setCountry = data => () => {
    if (this.state.activeCountry != data.id)
      this.setState({ activeCountry: data.id })
    else this.setState({ activeCountry: null })
  }

  renderSubLanguages(country, data, index) {
    return (
      <div key={index}>
        <Link
          href={`/${country.name.toLowerCase()}-${data.name.toLowerCase()}`}>
          <a className='country-options-a'>{data.full_name}</a>
        </Link>
      </div>
    )
  }

  renderSingleCountry(country, index) {
    return (
      <div key={index} className={`col-md-3 border-language-item`}>
        <div
          className={` pointer language-item-new ${
            this.state.activeCountry == country.id ? 'active' : ''
          }`}
          onClick={this.setCountry(country)}>
          <div>
            <p className='no-margin'>{country.name}</p>
          </div>
          <a className=''>{country.full_name}</a>
          {country.langs.length > 0 &&
          this.state.activeCountry == country.id ? (
            <i
              name='lang-t'
              className='fa fa-angle-up item-chev'
              aria-hidden='true'></i>
          ) : (
            ''
          )}
          {country.langs.length > 0 &&
          this.state.activeCountry != country.id ? (
            <i
              name='lang-t'
              className='fa fa-angle-down item-chev'
              aria-hidden='true'></i>
          ) : (
            ''
          )}
        </div>
        {country.langs.length > 0 ? (
          <div
            className={`country-options ${
              this.state.activeCountry == country.id ? '' : 'closed'
            }`}>
            {country.langs.map(this.renderSubLanguages.bind(this, country))}
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }

  render() {
    const {
      language,
      lang,
      country,
      countries,
      langConfig,
      sticky_note,
    } = this.props

    return (
      <Layout
        sticky_note={sticky_note}
        isCheckout={true}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        newHeader={true}>
        <div className='main_wrap'>
          <div className='container-fluid home-section-1'>
            <div className='container'>
              <div className='lang-container-h'>
                <h1 className='lang-heading'>
                  {language.choose_language.data.c_title.value}
                </h1>
                <p className='lang-p mt-5'>
                  {language.choose_language.data.c_p.value}
                </p>
                <Link href={`/${lang}-${country}`}>
                  <button className='btn btn-primary btn-main'>
                    {language.choose_language.data.c_button.value}
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className='container-fluid lang-sect'>
            <div className='container'>
              <div className='lang-container'>
                <h2>{language.choose_language.data.c_title1.value} </h2>
                <p className='gray-text medium-size top-margin-33'>
                  {language.choose_language.data.c_sub_title.value}
                </p>
                <div className='languages'>
                  <div className='row'>
                    {countries && countries.map(this.renderSingleCountry)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

ChooseLanguage.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/choose_language`,
  })

  return data
}

const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    routes: props.language.routes,
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    countries: props.initData.countries,
    langConfig: props.all_routes,
    found_country: props.found_country,
    sticky_note: props.initData.sticky_note,
  }
}

export default connect(mapStateToProps)(ChooseLanguage)
