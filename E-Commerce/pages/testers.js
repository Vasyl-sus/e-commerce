import Link from 'next/link'
import React from 'react'
import { connect } from 'react-redux'
import Layout from '../components/layout'
import { addToDataLayer } from '../components/services'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class Testers extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
    this.renderSingleBlock = this.renderSingleBlock.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  goToProductPage = data => () => {
    const { currency, therapies } = this.props
    let currencycode = currency.code

    let obj = {
      therapies,
      currencycode,
    }
    addToDataLayer('EEproductClick', obj, 'Products list')
  }

  renderSingleBlock(row, index) {
    var tLang =
      this.props.language.tester_categories.find(l => {
        return l.name == row.name
      }) || {}
    return (
      <div key={index} className={`${row.css_class_name} w-test-w`}>
        <Link
          href={`/${this.props.lang}-${this.props.country}/${row.link_name}`}>
          <div
            onClick={this.goToProductPage(row)}
            className='pointer half-image row'>
            <div
              className={`col-6 left h-100 pr-0`}
              style={{
                backgroundImage: `url(${
                  row.pattern_image && row.pattern_image.link
                })`,
              }}>
              <p>{row.display_name}</p>
            </div>
            <div
              className='col-6 right h-100 pl-0 pr-0'
              style={{
                backgroundImage: `url(${
                  row.background_image && row.background_image.link
                })`,
              }}></div>
          </div>
        </Link>
        {tLang.data &&
          tLang.data.datas.map((dd, i) => {
            return (
              <div key={i} className='testimonial-block-w'>
                <div className='row name-wrap'>
                  <h3>{dd.name}</h3>
                </div>
                <div className='row'>
                  <div className='col-md-4 review-text'>
                    <img className='w-100' alt='image' src={dd.image} />
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: dd.value }}
                    className='col-md-8 review-text'></div>
                </div>
              </div>
            )
          })}
      </div>
    )
  }

  render() {
    const {
      language,
      lang,
      country,
      langConfig,
      routes,
      categories,
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
        page='testers'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}>
        <div className='container page-container'>
          <h1 className='main-page-title'>
            {language.testers.data.ahead11.value}
          </h1>
          <div className='page-title-border'></div>
        </div>
        <div className='container page-title-desc'>
          <p className='description'>
            {language.testers.data.asubhead11.value}
          </p>
          {categories.map(this.renderSingleBlock)}
        </div>
      </Layout>
    )
  }
}

Testers.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  return data
}

const mapStateToProps = (_, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    testimonials: props.initData.testimonials,
    routes: props.language.routes,
    categories: props.initData.categories,
    countries: props.initData.countries,
    therapies: props.initData.therapies,
    currency: props.initData.currency,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps)(Testers)
