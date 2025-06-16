import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { subscribe } from '../actions/mainActions'
import HomeTherapy from '../components/home-therapy'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'

class EasterPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
    this.renderSingleTherapy = this.renderSingleTherapy.bind(this)
    this.subscribe = this.subscribe.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  renderSingleTherapy(row, index) {
    return (
      <HomeTherapy
        module_location='Homepage product list'
        therapies={this.props.therapies}
        currency={this.props.currency}
        lang={this.props.lang}
        country={this.props.country}
        data={row}
        key={index}
      />
    )
  }

  subscribe(email) {
    this.props.subscribe({ email })
  }

  render() {
    const {
      language,
      routes,
      lang,
      country,
      langConfig,
      categories = [],
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
        page='easter'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='container-fluid easter-page'>
          <div className='container page-container'>
            <div className='row'>
              <div className='col-12'>
                <img
                  className='top-image img-fluid image-easter'
                  id='easterImage'
                  alt=''
                  src={language.easter.data.mainImage.value}
                />
              </div>
            </div>
            <div className='row'>
              <div className='col-12'>
                <div
                  className='easter-content'
                  dangerouslySetInnerHTML={{
                    __html: language.easter.data.mainContent.value,
                  }}></div>
              </div>
            </div>
          </div>
          <div className='container therapies-wrap'>
            <div className='row justify-content-center'>
              {categories.map(this.renderSingleTherapy)}
            </div>
            <div className='home-border'></div>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          $(document).ready(function(){
            var image_new = '${language.easter.data.secondImage.value}';
            $('#easterImage').on('click', function() {
              console.log("Klikam");
              $(this).attr('src', image_new);
          });
          });
        `,
          }}
        />
      </Layout>
    )
  }
}

EasterPage.getInitialProps = async function (context) {
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
    therapies: props.initData.therapies,
    categories: props.initData.categories,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    fixed: state.main.fixed,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EasterPage)
