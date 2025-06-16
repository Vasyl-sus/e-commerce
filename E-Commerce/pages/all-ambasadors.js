import React from 'react'
import Layout from '../components/layout'
import { ROOT_URL } from '../constants/constants.js'
import { parseLanguageModules } from '../components/services.js'
import ProductTestimonials from '../components/product-testimonials'
import Link from 'next/link'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { connect } from 'react-redux'
import { PageView } from '../actions/facebookActions'

class AllAmbasadors extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
    this.renderSingleBlock = this.renderSingleBlock.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  renderSingleBlock(row, index) {
    const { lang, country, testimonials } = this.props
    var t = []

    t = testimonials.filter(t => {
      return t.category == row.name
    })

    return (
      <div key={index} className={`${row.css_class_name} w-test-w`}>
        <Link href={`/${lang}-${country}/${row.link_name}`}>
          <div className='half-image row pointer'>
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

        <ProductTestimonials
          lang={lang}
          country={country}
          linked={true}
          header={true}
          language={{ data: { ppttt: { value: '' }, ppttnt: { value: '' } } }}
          testimonials={t}
        />
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
        page='all-ambasadors'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='container page-container'>
          <h1 className='main-page-title'>
            {language.ambasadors.data.ahead1.value}
          </h1>
          <div className='page-title-border'></div>
        </div>
        <div className='container page-title-desc'>
          <p className='description'>
            {language.ambasadors.data.asubhead1.value}
          </p>
          {categories.map(this.renderSingleBlock)}
        </div>
      </Layout>
    )
  }
}

AllAmbasadors.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/testimonials`,
  })

  return data
}

const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    testimonials: props.initData.testimonials,
    routes: props.language.routes,
    categories: props.initData.categories,
    currency: props.initData.currency,
    countries: props.initData.countries,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps)(AllAmbasadors)
