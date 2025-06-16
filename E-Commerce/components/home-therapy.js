import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { addToDataLayer } from './services'

class HomeTherapy extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.redirectToProductPage = this.redirectToProductPage.bind(this)
  }

  redirectToProductPage() {
    const { data, module_location } = this.props
    let therapies = this.props.therapies.filter(t => {
      return t.category === data.name
    })
    therapies = therapies.map((t, index) => {
      return {
        id: t.id,
        name: t.name,
        price: t.total_price,
        brand: 'Lux-Cosmetics',
        category: t.category,
        position: index,
      }
    })
    let therapiesGA4 = this.props.therapies.filter(t => {
      return t.category === data.name
    })
    therapiesGA4 = therapiesGA4.map((t, index) => {
      return {
        item_id: t.id,
        item_name: t.name,
        price: t.total_price,
        item_brand: 'Lux-Cosmetics',
        item_category: t.category,
        index: index,
        item_list_name: module_location
      }
    })
    let currencycode = this.props.currency.code

    let obj = {
      therapies,
      therapiesGA4,
      currencycode,
    }
    addToDataLayer('EEproductClick', obj, module_location)
    dataLayer.push({
      event: 'eventTracking',
      eventCategory: module_location,
      eventAction: 'click',
      eventLabel: data.name,
    })
    //Router.push(`/${lang}-${country}/${data.link_name}`)
  }

  render() {
    const { lang, country, data } = this.props
    return (
      <Link href={`/product-page`} as={`/${lang}-${country}/${data.link_name}`}>
        <div
          onClick={this.redirectToProductPage}
          className={`${data.css_class_name} pointer col-lg-4 col-md-6 home-therapy-wrap`}>
          <div
            style={{
              backgroundImage: `url(${
                data.pattern_image && data.pattern_image.link
              })`,
            }}
            className='top'>
            <p className='title'>
              {data.display_name}
              <span className='arrow-therapy'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 40.59 40.59'>
                  <defs>
                    <style>{`.cls-1{fill:none;stroke:#fc5c9c;stroke-miterlimit:10;stroke-width:1.5px;}`}</style>
                  </defs>
                  <title>arrow-right</title>
                  <g id='Layer_23' data-name='Layer 2'>
                    <g id='page12'>
                      <g id='PRODUKT_4d' data-name='PRODUKT 4d'>
                        <circle
                          className='cls-1'
                          cx='20.29'
                          cy='20.29'
                          r='19.54'
                          transform='translate(-8.41 20.29) rotate(-45)'
                        />
                        <polyline
                          className='cls-1'
                          points='18.93 10.37 28.86 20.29 18.93 30.22'
                        />
                        <line
                          className='cls-1'
                          x1='9.22'
                          y1='20.1'
                          x2='28.86'
                          y2='20.1'
                        />
                      </g>
                    </g>
                  </g>
                </svg>
              </span>
            </p>
            <div className='therapy-below'>
              <div className='border-desc'></div>
              <p className='description'>{data.description}</p>
            </div>
          </div>
          <div
            style={{
              backgroundImage: `url("${
                data.background_image && data.background_image.link
              }")`,
            }}
            className='bottom'>
            <img
              alt='image'
              className='w-100'
              src={data.profile_image && data.profile_image.link}
            />
          </div>
        </div>
      </Link>
    )
  }
}

HomeTherapy.propTypes = {
  data: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
}

export default HomeTherapy
