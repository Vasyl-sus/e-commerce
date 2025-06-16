import groupBy from 'lodash/groupBy'
import React from 'react'
import { connect } from 'react-redux'
import Layout from '../components/layout'
import PlusMinus from '../components/plus-minus'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class Faq extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      groupedDatas: {},
      categoryNames: [],
    }
  }

  componentDidMount() {
    PageView(window.location.href);
    const { language } = this.props
    let datas = language.faq.data.datas
    let groupedDatas = groupBy(datas, 'category')
    let categoryNames = []
    for (let cat in groupedDatas) {
      categoryNames.push({ category: cat, active: false })
    }
    this.setState({ groupedDatas, categoryNames })
  }

  renderSingleDatas = (row, index) => {
    return (
      <div className='faq-question' key={index}>
        <React.Fragment>
          <p className='title'>{row.name}</p>
        </React.Fragment>
        <div
          className='desc-p'
          dangerouslySetInnerHTML={{ __html: row.value }}></div>
      </div>
    )
  }

  toggleSign = toggledCategory => () => {
    let categories = this.state.categoryNames
    let category = categories.find(c => {
      return c.category === toggledCategory.category
    })
    category.active = !category.active
    this.setState({ categoryNames: categories })
  }

  renderSingleFaq = (row, index) => {
    const { groupedDatas } = this.state
    let datas = groupedDatas[row.category]
    return (
      <div key={index} className='row'>
        <div className='col-md-12 page-wrap faq-section'>
          <React.Fragment>
            <div className='d-flex faq-title-block'>
              <PlusMinus
                toggled={row.active}
                toggleSign={this.toggleSign(row)}
              />
              <p onClick={this.toggleSign(row)} className='ml-3 title pointer'>
                {row.category}
              </p>
            </div>
          </React.Fragment>
          {row.active && datas.map(this.renderSingleDatas)}
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

    const { categoryNames } = this.state

    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        countries={countries}
        page='faq'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}>
        <div className='container page-container'>
          <h1 className='main-page-title'>
            {language.faq.data.text1faq.value}
          </h1>
          <div className='page-title-border'></div>
        </div>
        <div className='container page-wrap'>
          {language.faq.data.text2faq.value != '' && (
            <React.Fragment>
              <div className='row'>
                <div className='col-md-12'>
                  <p className='desc-p'>{language.faq.data.text2faq.value}</p>
                </div>
              </div>
            </React.Fragment>
          )}
          {categoryNames.map(this.renderSingleFaq)}
        </div>
        <div className='pb-5'></div>
      </Layout>
    )
  }
}

Faq.getInitialProps = async function (context) {
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

export default connect(mapStateToProps)(Faq)
