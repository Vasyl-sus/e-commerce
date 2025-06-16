import React from 'react'
import Stripe from '../Stripe'

const PaymentStripeWrap = ({ selectMethod, customer, data }) => {
  return (
    <Payment
      customer={customer}
      data={data}
      selectMethod={selectMethod}
      additionalProps={
        <Stripe isActive={customer.payment_method_id === data.id} />
      }
    />
  )
}

const Payment = ({ selectMethod, customer, data, additionalProps }) => {
  return (
    <React.Fragment>
    <div
      onClick={selectMethod}
      className={`row box-w ${
        customer.payment_method_id == data.id ? 'active' : ''
      }`}>
      <div className='col-2 pl-0 pr-0'>
        <div className='deliveryPicW'>
          {data.post_image && (
            <img className='w-100' alt='img' src={data.post_image.link} />
          )}
        </div>
      </div>
      <div className='col-8 d-flex align-items-center justify-content-start'>
        <p className='delivery-text'>{data.display_title}</p>
      </div>    </div>
    <div className={`row box-w payment-info ${
      customer.payment_method_id == data.id ? 'd-block' : 'hidden'
    }`}>
      <div className="col-12">
        {additionalProps}
      </div>
    </div>
    </React.Fragment>
  )
}

class PaymentWrap extends React.Component {
  constructor(props) {
    super(props)

    this.selectMethod = this.selectMethod.bind(this)
  }

  selectMethod() {
    this.props.selectMethod(this.props.data.id)
  }

  render() {
    const { data, customer } = this.props
    if (this.props.data.code === 'stripe') {
      return (
        <PaymentStripeWrap
          selectMethod={this.selectMethod}
          customer={customer}
          data={data}
        />
      )
    }

    return (
      <Payment
        customer={customer}
        data={data}
        selectMethod={this.selectMethod}
      />
    )
  }
}

export default PaymentWrap
