import React from "react";
import PropTypes from "prop-types";

class OtoWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOption: null
    };

  }

  componentDidMount(){

  };

  addToCart = (row) => () => {
    const { selectedOption } = this.state;
    let foundProduct = null;
    if (selectedOption && selectedOption.accId === row.id) {
      foundProduct = row.options.find(o => {
        return o.id === selectedOption.optionId
      })
    }

    let product;

    if (foundProduct) {
      product = foundProduct;
    } else {
      product = row.options && row.options[0] || {};
    }

    row.product_id = product.id;
    row.product_name = product.name

    this.props.addToCart(row)
  }

  changeOption = (id) => (event) => {
    this.setState({selectedOption: {accId: id, optionId: event.target.value}})
  }

  render() {
    const { language, data, disc, currency } = this.props;

    var price = data.reduced_price || data.total_price;
    var discount = Math.round(price * (disc/100));
    var discount_price = price - discount;
    return (
      <div className="col-md-6 col-lg-3 acc-wrap align-self-end">
        <div dangerouslySetInnerHTML={{__html: data.additional_text}}></div>
        <div className="ac-image-w" style={{backgroundImage: `url(${data.img_link || data.link})`}}>
        </div>
        <div className="ac-text-wrap">
          <p className="rose">{data.name}</p>
          <div className="mb-4 text-center">
            {data.options && data.options.length > 1 && <select onChange={this.changeOption(data.id)} className="custom-select">
              {data.options.map((o, index) => {
                return (
                  <option value={o.id} key={index}>{o.name}</option>
                )
              })}
            </select>}
          </div>
          <p className="precrtana">{(data.reduced_price && Math.round(data.reduced_price)) || (data.total_price && Math.round(data.total_price))} {currency.symbol}</p>
          <p className="cena"> {Math.round(discount_price)} {currency.symbol}</p>
          <button onClick={this.addToCart(data)} className="btn btn-primary btn-cart-small">
            <img alt="image" className="cart-image" src="/static/images/add-to-cart.svg" />
            {language.checkout.data.accbuy.value}
          </button>
        </div>
      </div>
    );
  }
}

OtoWrap.propTypes = {
  data: PropTypes.object.isRequired,
  addToCart: PropTypes.func.isRequired
};

export default OtoWrap;
