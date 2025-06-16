import React from "react";
import PropTypes from "prop-types";
import AliceCarousel from 'react-alice-carousel';
import Link from 'next/link';
import { addToDataLayer } from './services';
import { ROOT_URL } from "../constants/constants";

class AccessoriesWrapStandard extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      index: 0,
      acc: this.props.accessories.filter(row => row.status === 1).map((row, index) => {
        return (
        <Link
          key={index}
          href={`/accessory-page`}
          as={`/${this.props.lang}-${this.props.country}/accessories/${row.seo_link}`}
        >
          <div onClick={this.addToCart(row)} className="acc-wrap col-6 col-md-3">
            <div className="ac-image-w" style={{backgroundImage: `url(${row.profile_image && row.profile_image.link})`}}>
            </div>
            <div className="ac-text-wrap">
              <p className="rose">{row.name}</p>
              <p className="black">{row.description}</p>
              {this.props.showDetails && <p className="precrtana">{row.regular_price.toFixed(this.props.fixed)} {this.props.currency.symbol}</p>}
              {this.props.showDetails && <p className="cena">{row.reduced_price.toFixed(fixed)} {this.props.currency.symbol}</p>}
              <button className="btn btn-primary btn-cart-small d-flex justify-content-center">
                {this.props.language.home_bottom.data.accbuy.value}
              </button>
            </div>
          </div>
        </Link>
      )})
    };

    this.renderSingleAcc = this.renderSingleAcc.bind(this)
  }

  onSlideChange(e) {
    console.debug('Item`s position during a change: ', e.item)
    console.debug('Slide`s position during a change: ', e.slide)
  }

  onSlideChanged(e) {
    console.debug('Item`s position after changes: ', e.item)
    console.debug('Slide`s position after changes: ', e.slide)
  }

  addToCart = (data) => () => {
    let therapies = this.props.accessories.filter(a => {
      return a.id == data.id
    });
    therapies = therapies.map((t, index) => {
      return {
        id: t.id,
        name: t.name,
        price: t.reduced_price,
        brand: 'Lux-Cosmetics',
        category: t.category,
        position: index
      }
    })
    let therapiesGA4 = this.props.accessories.filter(a => {
      return a.id == data.id
    });
    therapiesGA4 = therapiesGA4.map((t, index) => {
      return {
        item_id: t.id,
        item_name: t.name,
        price: t.reduced_price,
        item_brand: 'Lux-Cosmetics',
        item_category: t.category,
        index: index,
        item_list_name: this.props.module_location
      }
    })
    let currencycode = this.props.currency.code

    let obj = {
      therapies,
      therapiesGA4,
      currencycode
    }
    addToDataLayer("EEproductClick", obj, this.props.module_location)
    dataLayer.push({
      'event': 'eventTracking',
      'eventCategory' : this.props.module_location,
      'eventAction': 'click',
      'eventLabel': data.name
    });
    //Router.push(`${ROOT_URL}/${this.props.lang}-${this.props.country}/accessories/${data.seo_link}`)
  }

  renderSingleAcc(row, index) {
    const { language, currency, showDetails=true, fixed } = this.props;

    return (
      <Link key={index} href={`${ROOT_URL}/${this.props.lang}-${this.props.country}/accessories/${row.seo_link}`}>
        <div onClick={this.addToCart(row)} className="acc-wrap align-self-end">
          <div className="ac-image-w" style={{backgroundImage: `url(${row.profile_image && row.profile_image.link})`}}>
          </div>
          <div className="ac-text-wrap">
            <p className="rose">{row.name}</p>
            <p className="black">{row.description}</p>
            {showDetails && <p className="precrtana">{row.regular_price.toFixed(fixed)} {currency.symbol}</p>}
            {showDetails && <p className="cena">{row.reduced_price.toFixed(fixed)} {currency.symbol}</p>}
            <button className="btn btn-primary btn-cart-small d-flex justify-content-center">
              {language.home_bottom.data.accbuy.value}
            </button>
          </div>
        </div>
      </Link>
    )
  }

  pageHandler = (slideCount) => {
    let itemIndex = 0;
    itemIndex = slideCount
    this.Carousel._slideToItem(itemIndex);
  }

  render() {
    const { language } = this.props;

    return (
      <React.Fragment>
      <div className="container accessories-wrap">
        <h2 className="main-page-title">{language.home_bottom.data.acctitle.value}</h2>
        <div className="page-title-border"></div>
      </div>
      <div className="container page-title-desc">
        <p className="description">{language.home_bottom.data.accsubtitle.value}</p>
        <div className="row list-acc">
          {this.state.acc}
        </div>
      </div>
      </React.Fragment>
    );
  }
}

AccessoriesWrapStandard.propTypes = {
  accessories: PropTypes.array.isRequired
};

export default AccessoriesWrapStandard;
