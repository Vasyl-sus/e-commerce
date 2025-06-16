import React from "react";

class DeliveryWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
    this.selectMethod = this.selectMethod.bind(this)
  }

  selectMethod() {
    this.props.selectMethod(this.props.data.id)
  }

  render() {
    const { language, data, customer, cart, currency } = this.props;
    return (
      <div onClick={this.selectMethod} className={`row box-w ${customer.delivery_method_id == data.id ? 'active' : ''}`}>
        <div className="col-2 pl-0 pr-0">
          <div className="deliveryPicW">
            {data.post_image && <img className="w-100" alt="img" src={data.post_image.link} />}
          </div>
        </div>
        <div className="col-9 pl-5 pl-md-0 pr-0 d-flex align-items-center">
          <div className="d-flex w-100 justify-content-between">
            <p className="delivery-text">{data.display_code}</p>
            {/* <p className="delivery-text">1-2 dni</p> */}
            <p className="delivery-text pr-0">
            {cart.shipping_fee > 0 ? data.price : language.checkout.data.bchd.value}
             {cart.shipping_fee > 0 ? ' ' + currency.symbol : ''}
            </p>
          </div>
        </div>
        <div className="col-1"></div>
      </div>
    );
  }
}

export default (DeliveryWrap);
