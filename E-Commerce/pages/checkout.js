import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Router from 'next/router'
import { Line } from 'rc-progress'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { isSubmitting, isValid, reset, submit } from 'redux-form'
import {
  addDiscount,
  createOrder,
  removeDiscount,
  removeFromCart,
  setDelivery,
  setPayment,
  createInitialOrder,
  updateInitialOrder,
  getDiscountData,
  addDiscount2,
  openAccessoryModal,
  closeAccessoryModal,
} from '../actions/cartActions'
import CheckoutForm from '../components/checkout-form.js'
import Counter from '../components/custom-counter'
import DiscountForm from '../components/discount-form.js'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import SmoothScrolling from '../components/smoothScroll'
import StripeProvider from '../components/Stripe/StripeProvider'
import { cartPage, ROOT_URL, successPageRoute } from '../constants/constants'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView, InitialCheckout, Purchase } from '../actions/facebookActions'
import { PageView as GA4PageView, BeginCheckout, Purchase as GA4Purchase } from '../actions/googleAnalyticsActions'
import Modal from 'react-modal'
import AccessoryModal from '../components/accessory_modal'


const PUBLIC_KEY = process.env.PUBLIC_KEY_STRIPE

const stripeTestPromise = loadStripe(PUBLIC_KEY)

class Checkout extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isOver: true,
      openMoadal: false,
    }
    this.renderTherapy = this.renderTherapy.bind(this)
    this.submitForm = this.submitForm.bind(this)
    this.setDelivery = this.setDelivery.bind(this)
    this.onSubmitClick = this.onSubmitClick.bind(this)
    this.submitDiscount = this.submitDiscount.bind(this)
    this.setPayment = this.setPayment.bind(this)
  }

  componentDidMount() {
    // Send PageView to Facebook
    PageView(window.location.href);
    // Send PageView to Google Analytics
    GA4PageView({
      url: window.location.href,
      title: document.title
    });
    
    const data = {
      url: window.location.href,
      currency: this.props.currency.code,
      item: Array.prototype.concat(this.props.cart.accessories, this.props.cart.therapies),
    }
    
    // Send InitialCheckout to Facebook
    InitialCheckout(data);
    // Send BeginCheckout to Google Analytics
    BeginCheckout({
      url: window.location.href,
      currency: this.props.currency.code,
      item: Array.prototype.concat(this.props.cart.accessories, this.props.cart.therapies),
    });
  }

  removeTherapy = row => () => {
    var cartLink = (this.props.routes &&
      this.props.routes.find(r => {
        return r.page == cartPage
      })) || { route: '' }
    this.props.removeFromCart(row, this.props.currency, cartLink.route)
  }

  renderTherapy(row, index) {
    const { fixed } = this.props
    return (
      <tr key={index} className='product-tr'>
        <td className='first d-flex align-items-center'>
          <div className='item-name'>
            <p className='big'>{row.name}</p>
            {row.product_name && <p className='small'>- {row.product_name}</p>}
          </div>
          {
            row.isFreeTherapy
            ? null
            : <div
                onClick={this.removeTherapy(row)}
                className='pointer cart-x ml-auto'>
                X
              </div>
          }
        </td>
        <td className='second text-center'>{row.quantity}</td>
        <td className='third text-right'>
          {(row.price * row.quantity).toFixed(fixed)}{' '}
          {this.props.currency.symbol}
        </td>
      </tr>
    )
  }

  onSubmitClick() {
    if (this.props.cart && this.props.cart.discountData && this.props.cart.discountData.date_end && new Date() > new Date(this.props.cart.discountData.date_end)) {
      this.setState({openMoadal: true})
    } else {
      if (!this.props.formEnabled) {
        SmoothScrolling.scrollTo('form-w')
      }
      this.submitFD();
    }
  }
  submitFD() {
    this.props.submitFormData()
  }
  closeModal() {
    this.props.closeAccessoryModal()
  }

  submitDiscount(name) {
    // this.props.addDiscount(name)
    this.props.getDiscountData(name).then((res) => {
      if (res.data.cart.free_accessories_option && res.data.cart.free_accessories_option.length
        && res.data.cart.free_accessories_option.length > 1) {
        this.props.openAccessoryModal(res.data.cart.free_accessories_option, name)
      } else
      if (res.data.cart.free_accessories_options && res.data.cart.free_accessories_options.length
        && res.data.cart.free_accessories_options.length) {
          this.props.addDiscount2(name, res.data.cart.free_accessories_options)
      } else {
        this.props.addDiscount(name)
      }
    }).catch(err => {
      console.log('error', err)
    });
  }

  setDelivery(id) {
    this.props.setDelivery(id)
  }

  async handleStripeSubmit({ createIntent, dataToSend, stripe, getCard }) {
    let intentPayment;
    try {
      intentPayment = await createIntent({ dataToSend })
      const intentSecret = intentPayment.data.payment.clientSecret;
      const status = intentPayment.data.payment.status;

      if (status == 'requires_action') {
        const all = await stripe.confirmCardPayment(intentSecret);
        const error = all?.error;
        const paymentIntent = all?.paymentIntent;
        if (error) return { success: false, paymentIntent, error };

        if (paymentIntent.status === "succeeded") {
          return { success: true, intentPayment };
        }
      }
      return { success: true, intentPayment }
    } catch (error) {
      return { success: false, intentPayment }
    }
  }

  setPayment(id) {
    this.props.setPayment(id)
  }

  getCurrentPayment(id) {
    return (
      this.props.payment_methods.find(p => {
        return p.id == id
      }) || null
    )
  }

  getSubmitObject(data) {
    var obj = data
    obj.shipping_first_name =
      obj.shipping_first_name.toLowerCase().charAt(0).toUpperCase() +
      obj.shipping_first_name.slice(1)
    obj.shipping_last_name =
      obj.shipping_last_name.toLowerCase().charAt(0).toUpperCase() +
      obj.shipping_last_name.slice(1)

    var payment = this.getCurrentPayment(this.props.customer.payment_method_id)

    var delivery =
      this.props.delivery_methods.find(d => {
        return d.id == this.props.customer.delivery_method_id
      }) || null
    obj.payment_method_id = payment && payment.id
    obj.payment_method_code = payment && payment.code
    obj.delivery_method_id = delivery && delivery.id
    obj.delivery_method_code = delivery && delivery.code
    obj.delivery_method_price = delivery && delivery.price
    obj.delivery_method_to_price = delivery && delivery.to_price

    return obj
  }

  async submitForm({ stripe, createIntent, getCard, savePayment, postCardError, setupIntent, savePaymentMethod, createCard, attachPaymentMethod, updateOrder, ...data }) {
    var payment = this.getCurrentPayment(this.props.customer.payment_method_id)
    const obj = this.getSubmitObject(data)
    const withStripe = payment.code === 'stripe'
    let intentPayment;
    const dataToSend = {
      currency: this.props.currency,
      obj,
      order_id2: null,
    }
    let resStripe
    if (withStripe) {
      resStripe = await this.handleStripeSubmit({
        stripe,
        createIntent,
        dataToSend,
        getCard,
      })
      intentPayment = resStripe.intentPayment?.data?.payment;

      if (!resStripe.success) {
        if (resStripe.error) {
          postCardError(resStripe.error.decline_code);
        }
        return
      }
    }
    // obj.oto = this.props.expire ? 1:0;

    let checkDiscount = false
    if (this.props.cart && this.props.cart.discountData && this.props.cart.discountData.name) {
      this.props.getDiscountData(this.props.cart.discountData.name).then((res) => {
        const accessories = this.props.cart.accessories.filter(a => a.isFreeProduct === 1 || a.isFreeAccessory === 1 || a.is_gift === 1)
        const therapies = this.props.cart.therapies.filter(t => t.isFreeTherapy === 1 || t.isGift === 1)
        if (res.data.cart.free_accessories.length !== accessories.length || res.data.cart.free_therapies.length !== therapies.length) {
          checkDiscount = true
        }
        if (checkDiscount === true) {
          checkDiscount = true
        } else {
          for (let i = 0; i < res.data.cart.free_accessories.length; i++) {
            const accessory = accessories.find(a => {
              return a.id === res.data.cart.free_accessories[i].id
            })
            if (!accessory) {
              checkDiscount = true
            }
          }
          for (let i = 0; i < res.data.cart.free_therapies.length; i++) {
            const therapy = therapies.find(a => {
              return a.id === res.data.cart.free_therapies[i].id
            })
            if (!therapy) {
              checkDiscount = true
            }
          }
        }
        if (checkDiscount === true) {
          this.setState({openMoadal: true});
        } else {
          this.checkoutSuccess(dataToSend, intentPayment, withStripe, obj);
        }
      }).catch(err => {
        this.setState({openMoadal: true});
      });
    } else {
      this.checkoutSuccess(dataToSend, intentPayment, withStripe, obj);
    }
  }


  chooseAccessoryOption = (name, accessoryId) => {
    this.props.addDiscount(name, accessoryId);
  }


  async checkoutSuccess(dataToSend, intentPayment, withStripe, obj) {

    const { routes } = this.props
    var successLink = (routes &&
      routes.find(r => {
        return r.page == successPageRoute
      })) || { route: '' }

    var path = `/${this.props.lang}-${this.props.country}/${successLink.route}`

    this.props.createOrder(
      dataToSend.obj,
      Router,
      path,
      dataToSend.currency,
      dataToSend.order_id2
    )
    .then(async(res) => {
      if (res){
        const id = res.id
        const total = res.total
        const order_id2 = res.order_id2

        let sIntent
        if (withStripe) {
          sIntent = await setupIntent(intentPayment.customer);
        }

        if (withStripe) {
          const sIntent = await setupIntent(intentPayment.customer);
          intentPayment.order_id = id;
          intentPayment.total = total;
          intentPayment.order_id2 = order_id2;
          intentPayment.created = new Date().toISOString().slice(0, 19).replace('T', ' ');
          intentPayment.setupIntentId = sIntent && sIntent.data && sIntent.data.sIntent.id;
          const p = await savePayment(intentPayment);
          updateOrder({paymentId: JSON.parse(p.config.data).order.id, data: {description: order_id2 + " :: " + obj.shipping_first_name + " " + obj.shipping_last_name + " :: " + obj.shipping_email + " :: " + this.props.country.toUpperCase(), metadata:{order_id2: order_id2}}})
        }
        const purchaseData = {
          url: window.location.href,
          currency: this.props.currency.code,
          item: Array.prototype.concat(this.props.cart.accessories, this.props.cart.therapies),
          obj,
          price: this.props.cart.total,
        }
        // Send Purchase event to Facebook
        Purchase(purchaseData);
        
        // Send Purchase event to Google Analytics
        GA4Purchase({
          url: window.location.href,
          currency: this.props.currency.code,
          item: Array.prototype.concat(this.props.cart.accessories, this.props.cart.therapies),
          obj,
          price: this.props.cart.total,
          transaction_id: order_id2
        });
        this.setState({openMoadal: false})
        Router.push('/checkout-success',`${path}?id=${id}`, { shallow: true })
      }

    })
  }

  renderer({ hours, minutes, seconds, completed }) {
    if (completed) {
      if (this.state.isOver == false) {
        this.setState({ isOver: true })
        location.reload()
      }

      // Render a completed state
      return <h2 className='text-center mt-4 rose'>Čas je potekel!</h2>
    } else {
      if (this.state.isOver == true) {
        this.setState({ isOver: false })
      }
      // Render a countdown
      return (
        <Counter
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          page='checkout'
        />
      )
    }
  }

  removeDiscount = () => {
    this.props.removeDiscount()
    this.setState({openMoadal: false});
  }

  render() {
    const {
      routes,
      language,
      lang,
      country,
      langConfig,
      cart,
      currency,
      countries,
      formValues,
      customer,
      delivery_methods,
      payment_methods,
      discount_not_found,
      all_routes,
      sticky_note,
      locale,
      fixed,
    } = this.props
    var initial =
      (customer && {
        shipping_telephone: customer.shipping_telephone,
        shipping_address: customer.shipping_address,
        shipping_postcode: customer.shipping_postcode,
        shipping_city: customer.shipping_city,
        shipping_first_name: customer.shipping_first_name,
        shipping_last_name: customer.shipping_last_name,
        shipping_email: customer.shipping_email,
      }) ||
      {}
    let delivery =
      delivery_methods.find(d => {
        return d.id === customer.delivery_method_id
      }) || null
    let razlika = 0
    let od = 0
    if (delivery) {
      razlika =
        ((cart.subtotal - delivery.to_price) / delivery.to_price) * 100 * -1
      od = delivery.to_price - cart.subtotal
    }
    var products = [...cart.therapies, ...cart.accessories]

    return (
      <Layout
        all_routes={all_routes}
        countries={countries}
        locale={locale}
        sticky_note={sticky_note}
        page='checkout'
        routes={routes}
        isCheckout={true}
        langConfig={langConfig}
        language={language}
        delivery_methods={delivery_methods}
        payment_methods={payment_methods}
        lang={lang}
        country={country}
        currency={currency}
      >
        <Modal className="react-modal-style" overlayClassName="react-modal-overlay" isOpen={this.state.openMoadal} onRequestClose={() => {
    this.setState({ openMoadal: false }) }} ariaHideApp={false}>
          <div className='modal-header-gray text-center mb-5'>
            <h4>{language?.checkout?.data?.couponError1?.value}</h4>
          </div>
          <div className="modal-footer-pink text-center">
            <div className='container'>
              <div className='row align-items-center'>
                <div className='col-12'>
                  <button className='btn btn-primary new-btn-to-order'
                    onClick={this.removeDiscount}
                  >
                    {language?.checkout?.data?.couponError2?.value}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        {
          this.props.accessory_modal &&
          <AccessoryModal
            accessoryModal={this.props.accessory_modal}
            closeAccessoryModal={this.props.closeAccessoryModal}
            discountName={this.props.discount_name}
            accessories={this.props.accessory_modal_items}
            submitItem={this.chooseAccessoryOption}
            currency={currency}
            language={language}
          />
        }
        <div className='container checkout-wrap pb-5' id='form-w'>
          <div className='row checkout-row'>
            <Elements stripe={stripeTestPromise}>
              <StripeProvider
                lang={this.props.language.stripeCodes?.data || {}}>
                {({ stripe, createIntent, getCard, savePayment, postCardError, setupIntent, savePaymentMethod, createCard, attachPaymentMethod, updateOrder }) => (
                  <div className='col-md-8 left-row'>
                    <CheckoutForm
                      language={language}
                      currency={currency}
                      customer={customer}
                      cart={cart}
                      country={country}
                      setDelivery={this.setDelivery}
                      setPayment={this.setPayment}
                      delivery_methods={delivery_methods}
                      payment_methods={payment_methods}
                      formValues={formValues}
                      initialValues={initial}
                      onSubmit={data => {
                        this.submitForm({ ...data, stripe, createIntent, getCard, savePayment, postCardError, setupIntent, savePaymentMethod, createCard, attachPaymentMethod, updateOrder })
                      }}
                      createInitialOrder={async(data) => {
                        await this.props.createInitialOrder(data)
                      }}
                    />
                    <div className='blue-checkout-box first'>
                      <button
                        onClick={this.onSubmitClick}
                        className='btn btn-primary btn-checkout'>
                        <img
                          alt='image'
                          className='checkout-image'
                          src='/static/images/light-arrow-right.svg'
                        />
                        {language.checkout.data.cbutton2.value}
                      </button>
                    </div>
                  </div>
                )}
              </StripeProvider>
            </Elements>

            <div className='col-md-4 info-ch-w mt-4 mt-md-0'>
              <p className='title'>{language.checkout.data.chead4.value}</p>
              <table className='ch-table w-100'>
                <thead>
                  <tr>
                    <th>{language.checkout.data.cth1.value}</th>
                    <th className='text-center'>
                      {language.checkout.data.cth2.value}
                    </th>
                    <th className='text-right'>
                      {language.checkout.data.cth3.value}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(this.renderTherapy)}
                  <tr className='last-row border-l'>
                    <td>{language.checkout.data.ctr1.value}</td>
                    <td></td>
                    <td className='text-right'>
                      {cart.subtotal && cart.subtotal.toFixed(fixed)} {currency.symbol}
                    </td>
                  </tr>
                  {cart.discount != 0 && (
                    <tr className='last-row'>
                      <td>
                        {language.checkout.data.ctr2.value} (
                        {cart.discountData.name})
                        <div
                          onClick={this.removeDiscount}
                          className='pointer cart-x ml-auto'>
                          X
                        </div>
                      </td>
                      <td></td>
                      <td className='text-right'>
                        {cart.discount && cart.discount.toFixed(fixed)} {currency.symbol}
                      </td>
                    </tr>
                  )}
                  <tr className='last-row'>
                    <td>{language.checkout.data.ctr3.value}</td>
                    <td></td>
                    <td className='text-right'>
                      {cart.shipping_fee.toFixed(fixed)} {currency.symbol}
                    </td>
                  </tr>
                  <tr className='last-row'>
                    <td>{language.checkout.data.ctr4.value}</td>
                    <td></td>
                    <td className='text-right'>
                      {cart.total && cart.total.toFixed(fixed)} {currency.symbol}
                    </td>
                  </tr>
                </tbody>
              </table>
              {discount_not_found != 1 &&
                (!cart.discount || cart.discount === 0) && (
                  <DiscountForm
                    discount_not_found={discount_not_found}
                    submitF={this.submitDiscount}
                    language={language}
                  />
                )}
              {od > 0 && (
                <div className='pt-4'>
                  {razlika && razlika > 0 && (
                    <Line
                      percent={100 - razlika}
                      strokeWidth='2'
                      strokeColor='#a8cc1a'
                      strokeLinecap='square'
                      trailWidth='2'
                      trailColor='#e3e4e5'
                    />
                  )}
                  <p className='mt-2 pb-text'>
                    {language.checkout.data.pptn.value} {od.toFixed(fixed)}{' '}
                    {currency.symbol} {language.checkout.data.pptn1.value}
                  </p>
                  {/* :
                <p className="mt-2 pb-text">{language.checkout.data.pptn2.value}</p>} */}
                </div>
              )}
              <div className='blue-checkout-box second'>
                <button
                  onClick={this.onSubmitClick}
                  className='btn btn-primary btn-checkout'>
                  <img
                    alt='image'
                    className='checkout-image'
                    src='/static/images/light-arrow-right.svg'
                  />
                  {language.checkout.data.cbutton2.value}
                </button>
              </div>
              <div className='v-n-w'>
                <p className='title'>{language.checkout.data.chead5.value}</p>
                <div className='checkout-icons-wrap pt-4'>
                  <div className='d-flex align-items-center'>
                    <img
                      alt='image'
                      className='footer-image-2'
                      src={language.main.data.adv2imagedark.value}
                    />
                    <div>
                      <p className='main mb-1'>
                        {language.main.data.adv2title.value}
                      </p>
                      <p className='not-main'>
                        {language.main.data.adv2text.value}
                      </p>
                    </div>
                  </div>

                  <div className='d-flex align-items-center'>
                    <img
                      alt='image'
                      className='footer-image-2'
                      src={language.main.data.adv1imagedark.value}
                    />
                    <div>
                      <p className='main mb-1'>
                        {language.main.data.adv1title.value}
                      </p>
                      <p className='not-main'>
                        {language.main.data.adv1text.value}
                      </p>
                    </div>
                  </div>

                  <div className='d-flex align-items-center'>
                    <img
                      alt='image'
                      className='footer-image-2'
                      src={language.main.data.adv3imagedark.value}
                    />
                    <div>
                      <p className='main mb-1'>
                        {language.main.data.adv3title.value}
                      </p>
                      <p className='not-main'>
                        {language.main.data.adv3text.value}
                      </p>
                    </div>
                  </div>

                  <div className='d-flex align-items-center'>
                    <img
                      alt='image'
                      className='footer-image-2'
                      src={language.main.data.adv4imagedark.value}
                    />
                    <div>
                      <p className='main mb-1'>
                        {language.main.data.adv4title.value}
                      </p>
                      <p
                        className='not-main'
                        dangerouslySetInnerHTML={{
                          __html: language.main.data.adv4text.value,
                        }}></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

Checkout.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      submitFormData: () => submit('CheckoutForm'),
      resetFormData: () => reset('CheckoutForm'),
      createOrder: (obj, currency) => createOrder(obj, currency),
      getDiscountData: id => getDiscountData(id),
      setDelivery: id => setDelivery(id),
      removeDiscount: () => removeDiscount(),
      removeFromCart: (id, currency, url) => removeFromCart(id, currency, url),
      addDiscount: (name, accessoryId) => addDiscount(name, accessoryId),
      setPayment: id => setPayment(id),
      createInitialOrder: data => createInitialOrder(data),
      cupdateInitialOrder: data => updateInitialOrder(data),
      getDiscountData: (discount) => getDiscountData(discount),
      addDiscount2: (name, accessories) => addDiscount2(name, accessories),
      openAccessoryModal: (accessories, name) => openAccessoryModal(accessories, name),
      closeAccessoryModal: () => closeAccessoryModal(),
    },
    dispatch,
  )
}
const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    cart: state.cart.cart,
    customer: state.cart.customer,
    currency: props.initData.currency,
    countries: props.initData.countries,
    discount_not_found: state.cart.discount_not_found,
    formValues: state.form.CheckoutForm && state.form.CheckoutForm.values,
    routes: props.language.routes,
    payment_methods: props.initData.payment_methods,
    delivery_methods: props.initData.delivery_methods,
    formEnabled:
      isValid('CheckoutForm')(state) && !isSubmitting('CheckoutForm')(state),
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    fixed: state.main.fixed,
    all_routes: props.all_routes,
    accessory_modal: state.cart.open_accessory_modal,
    accessory_modal_items: state.cart.accessory_modal_items,
    discount_name: state.cart.discount_name,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Checkout)
