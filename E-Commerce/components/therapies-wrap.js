import React from "react";
import ProductRadio from "./product-radio";

class TherapiesWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: 1,
      selectedRow: null
    };

    this.renderSingleTherapy = this.renderSingleTherapy.bind(this)

  }

  addToCart = (row) => () => {
    this.props.addToCart(row)
    dataLayer.push({
      'event': 'eventTracking',
      'eventCategory' : 'Product Page',
      'eventAction': 'click',
      'eventLabel': 'Footer - ' + row.name
    });
  }

  selectTherapy = (row, index) => () => {
    this.setState({selectedIndex: index, selectedRow: row})
  }

  renderSingleTherapy(row, index, therapies) {
    const { mlang, language, fixed } = this.props
    return (
      <div key={index} className={`col-md-4 ${this.state.selectedIndex == index ? 'active' : ''} therapy-w-p`}>
        <div onClick={this.selectTherapy(row, index)} className={`therapy-w-w ${this.state.selectedIndex == index ? 'active' : ''} pointer`}>
          <div className="img-wrap"><img alt="image" className="" src={row.display_image && row.display_image.link} /></div>
          {row.second_bonus && <p dangerouslySetInnerHTML={{__html: row.second_bonus}} className="bonus-tag"></p>}
          <div className="data-wrap">
          <p dangerouslySetInnerHTML={{__html: row.therapy_name}} className="p-title"></p>
          {row.bonus && <p dangerouslySetInnerHTML={{__html: row.bonus}} className="dis-text"></p>}
          <div className="price-wrap">
            <p className="price-regular"><del>{row.inflated_price.toFixed(fixed)} {this.props.currency.symbol}</del></p>
            <p className="price">{row.total_price.toFixed(fixed)} {this.props.currency.symbol}</p>
            {row.product_quantity > 1 && <p className="price-per-pcs">{(row.total_price / row.product_quantity).toFixed(fixed)} {this.props.currency.symbol} / {row.product_name}</p>}
          </div>
          </div>
        </div>
        <button onClick={this.addToCart(row)} className={`d-none-small btn btn-primary btn-cart-big mt-25`}>
          <img alt="image" className="cart-image" src="/static/images/add-to-cart.svg" />
          {mlang.data.addtocart.value}
        </button>
      </div>
    )
  }

  render() {
    const { mlang, language, therapies, options, selectedKind, handleSelectKind } = this.props;
    const filteredTherapies = therapies?.filter(f => {
      if (!selectedKind) {
        return true;
      }
      return f.name?.toLowerCase()?.includes(selectedKind?.toLowerCase())
    }) || {}

    var splited = [];
    return (
      <div className="container-fluid p-therapies-wrap">
        <div className="container">
          <h2 className="title">{language?.data.pptht.value}</h2>
          <div className="row d-block text-center product-radio-bottom">
            <ProductRadio
              options={options}
              selectedOption={selectedKind}
              onChange={handleSelectKind}
              language={mlang}
            />
          </div>
          <div className="row align-items-start">
            {filteredTherapies?.map(this.renderSingleTherapy)}
            <div className="col-12 d-md-none ">
              <button onClick={this.addToCart(this.state.selectedRow)} className={`btn btn-primary btn-cart-big mt-25`}>
                <img alt="image" className="cart-image" src="/static/images/add-to-cart.svg" />
                {mlang.data.addtocart.value}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TherapiesWrap.propTypes = {
};

export default TherapiesWrap;
