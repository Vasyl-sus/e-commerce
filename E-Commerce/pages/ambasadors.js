import React from 'react'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'

import Link from 'next/link'

import InstaGalery from '../components/insta-galery'
import { ambasadorsRoute, ROOT_URL } from '../constants/constants'

import { addToDataLayer } from '../components/services'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { connect } from 'react-redux'
import { PageView } from '../actions/facebookActions'

class Ambasadors extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.renderSingleCategory = this.renderSingleCategory.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  goToProduct = row => () => {
    let therapies = this.props.therapies.filter(t => {
      return t.category === row.pc_name
    })
    therapies = therapies.map((t, index) => {
      return {
        id: t.id,
        name: t.name,
        price: t.total_price,
        brand: 'Lux Cosmetics',
        category: t.category,
        position: index,
      }
    })

    let therapiesGA4 = this.props.therapies.filter(t => {
      return t.category === row.pc_name
    })
    therapiesGA4 = therapiesGA4.map((t, index) => {
      return {
        item_id: t.id,
        item_name: t.name,
        price: t.total_price,
        item_brand: 'Lux Cosmetics',
        item_category: t.category,
        index: index,
        item_list_name: 'Ambasador page'
      }
    })
    let currencycode = this.props.currency.code

    let obj = {
      therapies,
      currencycode,
      therapiesGA4
    }
    addToDataLayer('EEproductClick', obj, 'Ambasador page')
  }

  renderSingleCategory(row, index) {
    var profile = {},
      background = {},
      pattern = {}
    row.images.map(i => {
      if (i.background_img) {
        background = i
      } else if (i.profile_img) {
        profile = i
      } else if (i.pattern_img) {
        pattern = i
      }
    })
    return (
      <Link
        key={index}
        href={`/${this.props.lang}-${this.props.country}/${row.link_name}`}>
        <div
          onClick={this.goToProduct(row)}
          className='pointer row amb-th-wrap'>
          <div
            style={{ backgroundImage: `url(${pattern.link})` }}
            className='col-8 col-md-6 left pr-0'>
            <p className='title'>{row.display_name}</p>
            <div className='border'></div>
            <p className='desc'>{row.translation_description}</p>
          </div>
          <div className='center-image'>
            <img className='' alt='img' src={profile.link} />
          </div>
          <div
            style={{ backgroundImage: `url(${background.link})` }}
            className='col-4 col-md-6 right pl-0'></div>
        </div>
      </Link>
    )
  }

  render() {
    const {
      language,
      lang,
      country,
      langConfig,
      routes,
      testimonial = { images: [], productcategories: [] },
      currency,
      countries,
      sticky_note,
      locale,
      all_routes,
    } = this.props
    var timeline =
      testimonial.images.filter(i => {
        return i.timeline_img === 1
      }) || {}

    var ambasadorsLink = (routes &&
      routes.find(r => {
        return r.page == ambasadorsRoute
      })) || { route: '' }

    var instag =
      testimonial.images.filter(i => {
        return i.instagram_img
      }) || []
    var metaData = {
      title: `${testimonial.full_name} - E-Commerce Cosmetics`,
      description: testimonial.content,
      image: timeline[0] && timeline[0].link,
      url: `${ROOT_URL}/${lang}-${country}/ambassadors/${testimonial.url}`,
    }
    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        countries={countries}
        page='ambasadors'
        ambasadorsMeta={metaData}
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}>
        <div className='container main-page-title'>
          <h1>{testimonial.full_name}</h1>
        </div>
        <div className='container-fluid pr-0 pl-0 text-center'>
          <img
            className='amb-t-i'
            alt='image'
            srcSet={`
                      ${timeline[1] && timeline[1].link} 1x, ${
              timeline[0] && timeline[0].link
            } 2x`}
            src={timeline[0] && timeline[0].link}
          />
        </div>
        <div className='container amb-w-s'>
          <div className='d-flex align-items-start justify-content-center'>
            <img alt='img' className='left-i' src='/static/images/quote.svg' />
            <div
              dangerouslySetInnerHTML={{ __html: testimonial.content }}
              className='big-text break'></div>
            <img className='right-i' alt='img' src='/static/images/quote.svg' />
          </div>
        </div>
        <div className='pr-0 pl-0 insta-g-w'>
          <InstaGalery images={instag} language={language} />
        </div>
        <div className='container social-products-w'>
          <p className='title'>
            {language.ambasadors.data.l1am.value} {testimonial.full_name}{' '}
            {language.ambasadors.data.l2am.value}{' '}
          </p>
          <div className='d-flex justify-content-center soc-wrp'>
            {testimonial.facebook_link && (
              <Link href={testimonial.facebook_link}>
                <a target='_blank'>
                  <img
                    className='soc-i-i pointer'
                    alt='image'
                    src='/static/images/footer-facebook.3.svg'
                  />
                </a>
              </Link>
            )}
            {testimonial.instagram_link && (
              <Link href={testimonial.instagram_link}>
                <a target='_blank'>
                  <img
                    className='soc-i-i pointer'
                    alt='image'
                    src='/static/images/footer-instagram.2.svg'
                  />
                </a>
              </Link>
            )}
          </div>
          {testimonial.productcategories.map(this.renderSingleCategory)}
          <div className='text-center button-w-amb'>
            <Link
              href={ambasadorsLink.page}
              as={`/${lang}-${country}/${ambasadorsLink.route}`}
            >
              <a>
                <button className='mx-auto btn btn-primary amb-b'>
                  {language.ambasadors.data.b1am.value}
                </button>
              </a>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }
}

Ambasadors.getInitialProps = async function (context) {
  const q = context.query

  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/testimonials/${q.testimonial_link}`,
  })

  return data
}

const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    routes: props.language.routes,
    testimonial: props.testimonials,
    currency: props.initData.currency,
    countries: props.initData.countries,
    therapies: props.initData.therapies,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps)(Ambasadors)
