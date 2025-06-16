import React from 'react'
import { Field, reduxForm } from 'redux-form'
import Delivery from './deliveryWrap.js'
import { COUNTRY_NUMBERS } from '../constants/constants'
import PhoneInput from 'react-phone-number-input/input'
import {
  isValidPhoneNumber,
  formatPhoneNumberIntl,
} from 'react-phone-number-input'
import PaymentWrap from './PaymentWrap'

class CheckoutForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      poziven: {}
    }

    this.changeCheck = this.changeCheck.bind(this)
    this.submit = this.submit.bind(this)
    this.blurInput = this.blurInput.bind(this)
    this.rendrSingleDelivery = this.rendrSingleDelivery.bind(this)
    this.rendrSinglePayment = this.rendrSinglePayment.bind(this)
    this.selectDeliveryMethod = this.selectDeliveryMethod.bind(this)
    this.selectPaymentMethod = this.selectPaymentMethod.bind(this)
  }

  componentDidMount() {
    let poziven = COUNTRY_NUMBERS.find(c => {
      return c.country === this.props.country.toUpperCase()
    })
    this.setState({ poziven })
  }

  changeCheck(checkBoxValue) {
    this.setState({ checkBoxValue })
  }

  submit(data) {}

  blurInput(data) {}

  selectDeliveryMethod(id) {
    this.props.setDelivery(id)
  }

  selectPaymentMethod(id) {
    this.props.setPayment(id)
  }

  rendrSingleDelivery(row, index) {
    return (
      <Delivery
        language={this.props.language}
        currency={this.props.currency}
        cart={this.props.cart}
        customer={this.props.customer}
        selectMethod={this.selectDeliveryMethod}
        key={index}
        data={row}
      />
    )
  }

  rendrSinglePayment(row, index) {
    return (
      <PaymentWrap
        customer={this.props.customer}
        selectMethod={this.selectPaymentMethod}
        key={index}
        data={row}
      />
    )
  }

  checkNum = num => {
    var x = num
    if (x.substring(0, 1) == '0') x = x.slice(1)
    num = x

    return num
  }

  render() {
    const {
      handleSubmit,
      country,
      language,
      delivery_methods,
      payment_methods,
    } = this.props

    const { poziven } = this.state
    return (
      <form
          onSubmit={handleSubmit(this.submit)}
          className='checkout-form-wrap'
      >
        <div className='inputs'>
          <div className='title-ch-w'>
            <p className='title'>{language.checkout.data.chead1.value}</p>
          </div>
          <Field
            name='shipping_email'
            language={language}
            label={language.checkout.data.cinput2.value}
            errorText={language.checkout.data.errorText.value}
            placeholder={language.checkout.data.pinput3.value}
            type='email'
            component={renderEmailField}
          />
          <div className='row align-items-center o-in'>
            <label className='label col-4'>
              {language.checkout.data.cinput1.value}
            </label>
            <div className='d-flex col-7 pl-0 pr-0 justify-content-between'>
              <Field
                onBlur={this.blurInput}
                name='shipping_first_name'
                errorText={language.checkout.data.errorText.value}
                placeholder={language.checkout.data.pinput1.value}
                nameclass='double-input'
                type='text'
                component={renderHalfField}
              />
              <Field
                name='shipping_last_name'
                nameclass='double-input'
                errorText={language.checkout.data.errorText.value}
                type='text'
                placeholder={language.checkout.data.pinput2.value}
                component={renderHalfField}
              />
            </div>
          </div>
          <Field
            name='shipping_address'
            type='text'
            label={language.checkout.data.cinput3.value}
            errorText={language.checkout.data.errorText.value}
            placeholder={language.checkout.data.pinput4.value}
            component={renderField}
          />
          <div className='row align-items-center o-in'>
            <label className='label col-4'>
              {language.checkout.data.cinput4.value}
            </label>
            <div className='d-flex col-7 pl-0 pr-0 justify-content-between'>
              <Field
                name='shipping_postcode'
                nameclass='double-input'
                type='text'
                errorText={language.checkout.data.errorText.value}
                placeholder={language.checkout.data.pinput5.value}
                component={renderHalfField}
              />
              <Field
                name='shipping_city'
                nameclass='double-input'
                type='text'
                errorText={language.checkout.data.errorText.value}
                placeholder={language.checkout.data.pinput6.value}
                component={renderHalfField}
              />
            </div>
          </div>
          <Field
            name='shipping_telephone'
            poziven={poziven.num}
            errorText={language.checkout.data.errorText.value}
            placeholder={language.checkout.data.pinput7.value}
            label={language.checkout.data.cinput5.value}
            language={language}
            country={country.toUpperCase()}
            type='text'
            component={renderTelField1}
          />
        </div>
        <div className='inputs addresses mt-3'>
          <div className='title-ch-w'>
            <p className='title'>{language.checkout.data.chead2.value}</p>
          </div>
          {delivery_methods.map(this.rendrSingleDelivery)}
        </div>

        <div className='inputs addresses mt-3'>
          <div className='title-ch-w'>
            <p className='title'>{language.checkout.data.chead3.value}</p>
          </div>
          {payment_methods.map(this.rendrSinglePayment)}
        </div>
      </form>
    )
  }
}

CheckoutForm.propTypes = {}

const validate = values => {
  const errors = {}

  if (!values.shipping_first_name) {
    errors.shipping_first_name = true
  }

  if (!values.shipping_last_name) {
    errors.shipping_last_name = true
  }

  if (!values.shipping_address) {
    errors.shipping_address = true
  }

  if (!values.shipping_email) {
    errors.shipping_email = true
  } else if (
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      values.shipping_email,
    ) == false
  ) {
    errors.shipping_email = true
  }

  if (!values.shipping_postcode) {
    errors.shipping_postcode = true
  }

  if (!values.shipping_city) {
    errors.shipping_city = true
  }

  if (!values.shipping_telephone) {
    errors.shipping_telephone = true
  } else {
    errors.shipping_telephone = !isValidPhoneNumber(values.shipping_telephone)
  }

  return errors
}

const asyncValidate = async (values, dispatch , props) => {

  var therapiesKlaviyo = props?.cart?.therapies.map((c, index) => {
    return {
      ProductID: c.category,
      ProductName: c.product_name,
      Quantity: c.quantity,
      ItemPrice: c.price,
      RowTotal: c.price * c.quantity,
      ImageURL: c.display_image && c.display_image.link,
      Brand: "E-Commerce",
      Categories: c.category,
    }
  })
  props.createInitialOrder({dataForm: values, country: props?.country, cart: props?.cart, therapiesKlaviyo, url: window.location.href})
}

const renderField = ({
  input,
  placeholder,
  disabled,
  type,
  errorText,
  label,
  meta: { touched, error },
}) => (
  <div className='row align-items-center o-in'>
    <p className='col-4 text-right label'>{label}</p>
    <input
      {...input}
      disabled={disabled}
      placeholder={touched && error ? errorText : placeholder}
      className={`col-7 input ${touched && error && 'red-border'}`}
      type={type}
    />
  </div>
)

const renderEmailField = ({
  input,
  placeholder,
  disabled,
  language,
  type,
  errorText,
  label,
  meta: { touched, error },
}) => (
  <React.Fragment>
    <div className='row align-items-center'>
      <p className='col-4 text-right label'>{label}</p>
      <div className='col-7 pl-0 pr-0'>
        <input
          {...input}
          disabled={disabled}
          placeholder={touched && error ? errorText : placeholder}
          className={`input w-100 ${touched && error && 'red-border'}`}
          type={type}
        />
      </div>
    </div>
    <div className='row align-items-center'>
      <div className='col-7 offset-4 pl-0 pr-0'>
        {touched && error && (
          <p className='error-text'>{language.checkout.data.emailerr.value}</p>
        )}
      </div>
    </div>
  </React.Fragment>
)

const renderHalfField = ({
  input,
  nameclass,
  onBlur,
  placeholder,
  disabled,
  type,
  errorText,
  label,
  meta: { touched, error },
}) => {
  return (
    <input
      disabled={disabled}
      {...input}
      onBlur={input.onBlur}
      placeholder={touched && error ? errorText : placeholder}
      className={`input pl-4 ${nameclass} ${touched && error && 'red-border'}`}
      type={type}
    />
  )
}

const renderTelField1 = ({
  input,
  poziven,
  language,
  placeholder,
  country,
  disabled,
  type,
  errorText,
  errorText1,
  label,
  meta: { touched, error },
}) => {
  return (
    <div>
      <div className='row align-items-center o-in'>
        <p className='col-4 text-right label'>{label}</p>
        <label
          htmlFor='num-value'
          className={`static-value ${touched && error && 'plus-bottom'}`}>
          +{poziven}
        </label>
        <div className='col-7 pl-0 pr-0'>
          <PhoneInput
            {...input}
            defaultCountry={country}
            international={false}
            placeholder={touched && error ? errorText : ''}
            className={`tel-input ${touched && error && 'red-border'}`}
            onChange={value => {
              if (value === undefined) value = ''

              input.onChange(value)
            }}
            onBlur={e => {
              e.persist()

              let phoneNumValue = `${e.target.value}`

              if (!phoneNumValue.startsWith(poziven)) {
                phoneNumValue = `+${poziven}${phoneNumValue}`
              }

              const formattedNum = formatPhoneNumberIntl(
                phoneNumValue,
              ).replaceAll(' ', '')
              input.onBlur(formattedNum)
            }}
            value={input.value}
          />
        </div>
      </div>
      <div className='row align-items-center'>
        <div className='col-7 offset-4 pl-0 pr-0'>
          {touched && error && (
            <p className='error-text'>
              {language.checkout.data.phoneerr.value}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default reduxForm({
  form: 'CheckoutForm',
  validate,
  enableReinitialize: true,
  asyncValidate,
  asyncBlurFields: ['shipping_email', 'shipping_first_name', 'shipping_last_name', 'shipping_address', 'shipping_postcode', 'shipping_city', 'shipping_telephone'],
  asyncChangeFields: ['shipping_email', 'shipping_first_name', 'shipping_last_name', 'shipping_address', 'shipping_postcode', 'shipping_city', 'shipping_telephone'],
  shouldAsyncValidate: (params) => {
    return params.trigger === 'blur' && params.syncValidationPasses;
  }
})(CheckoutForm)
