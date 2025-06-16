import React from 'react'

class Payment extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
    this.selectMethod = this.selectMethod.bind(this)
  }

  selectMethod() {
    this.props.selectMethod(this.props.data.id)
  }

  render() {
    const { data, customer } = this.props

    return (
      <div
        onClick={this.selectMethod}
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
        <div className='col-9 pl-5 pl-md-0 d-flex align-items-center justify-content-start'>
          <p className='delivery-text'>{data.display_title}</p>
        </div>
        <div className='col-1'></div>
      </div>
    )
  }
}

Payment.propTypes = {}

export default Payment
