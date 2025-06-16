import React from 'react'
import { bindActionCreators } from 'redux'
import Layout from '../components/layout'
import { ROOT_URL } from '../constants/constants.js'
import { parseLanguageModules } from '../components/services.js'
import AliceCarousel from 'react-alice-carousel'
import Link from 'next/link'
import { PageView } from '../actions/facebookActions'
import AccessoryModal from '../components/accessory_modal'

import { checkoutRoute, productsRoute } from '../constants/constants'
import {
  removeFromCart,
  changeQuantity,
  removeGiftFromCart,
  addDiscount,
  addDiscount2,
  addGiftToCart,
  removeDiscount,
  getDiscountData,
  openAccessoryModal,
  closeAccessoryModal,
} from '../actions/cartActions'
import DiscountForm from '../components/discount-form.js'

import { Line } from 'rc-progress'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { connect } from 'react-redux'
import { sortBy } from 'lodash'

var selectedOption = null

class Cart extends React.Component {
  constructor(props) {
    super(props)

    const { routes } = this.props
    var checkoutLink = (routes &&
      routes.find(r => {
        return r.page == checkoutRoute
      })) || { route: '' }

    this.state = {
      isOver: true,
      checkoutLink,
      ggifts: [],
      giftsAvailable: false,
    }
    this.renderTherapy = this.renderTherapy.bind(this)
    this.submitDiscount = this.submitDiscount.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
  }

  componentWillReceiveProps(nextProps) {
    var data = []
    var self = this
    var giftsAvailable = ''

    const giftProps = sortBy(nextProps.gifts, 'sort_order')

    giftProps.forEach((row, index) => {
      const { currency, language, cart, giftConfig, lang, fixed } = nextProps
      let accGifts = cart.accessories.filter(g => {
        return g.isGift
      })
      let quantity = cart.therapies.reduce((acc, th) => {
        return acc + th.quantity * th.product_quantity
      }, 0)

      let shallPass = true
      let count = 0



      if (giftConfig) {
        if (
          accGifts.length < giftConfig.count &&
          ((giftConfig.price && giftConfig.price <= cart.total) ||
            (giftConfig.num_therapies && giftConfig.num_therapies <= quantity))
        ) {
          shallPass = false
        }
        count = giftConfig.count
      }

      giftsAvailable = shallPass

      let isAdded = cart.accessories && cart.accessories.length > 0 && cart.accessories.find(a => {
        return a.id === row.id && a.price === 0
      })
      let changeOption = id => event => {
        selectedOption = { accId: id, optionId: event.target.value }
      }
      data.push(
        <div
          key={index}
          className={`gift-wrap d-flex flex-column ${shallPass ? 'disabled' : ''}`}>
          <div
            className='ac-image-w'
            style={{
              backgroundImage: `url(${
                row.profile_image && row.profile_image.link
              })`,
            }}></div>
          <div className='ac-text-wrap'>
            <p className='rose black'>{row.name}</p>
            <p className='gift-value-text'>
              {language.checkout.data.ppgb4.value}
            </p>
            <p className='black gift-value'>
              {row.regular_price.toFixed(fixed)} {currency.symbol}
            </p>
          </div>
          <div className="mt-auto">
          {row.options.length > 1 && (
            <div className='mb-3 text-center'>
            <select
              onChange={changeOption(row.id)}
              className='custom-select'
              disabled={shallPass}>
              {row.options.map((o, index) => {
                return (
                  <option value={o.id} key={index}>
                    {o.name}
                  </option>
                )
              })}
            </select>
            </div>
          )}
          {!isAdded && (
            <button
              onClick={self.addGiftToCart(row)}
              disabled={shallPass}
              className='btn btn-primary btn-cart-small d-flex justify-content-center'>
              <img
                alt='image'
                className='cart-image'
                src='/static/images/add-to-cart.svg'
              />
              {language.checkout.data.ppgb3.value}
            </button>
          )}
          </div>
          {shallPass &&
            !isAdded &&
            (accGifts.length < count || accGifts.length === 0) && (
              <React.Fragment>
                <div className='mt-auto mx-auto text-center disabled-text'>
                  {giftConfig &&
                    (lang.toLowerCase() === 'hu' ? (
                      <React.Fragment>
                        {giftConfig.price ? (
                          <React.Fragment>
                            <strong>
                              {giftConfig.nextGiftConfig.price}{' '}
                              {currency.symbol}
                            </strong>{' '}
                            {language.checkout.data.ppgb1.value}
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <strong>
                              {giftConfig.nextGiftConfig.num_therapies}
                            </strong>{' '}
                            {language.checkout.data.ppgb1b.value}
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        {giftConfig.price ? (
                          <React.Fragment>
                            {language.checkout.data.ppgb1.value}
                            <strong>
                              {giftConfig.nextGiftConfig.price}{' '}
                              {currency.symbol}
                            </strong>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            {language.checkout.data.ppgb1b.value}
                            <strong>
                              {giftConfig.nextGiftConfig.num_therapies}
                            </strong>{' '}
                            {language.checkout.data.ppgb1c.value}
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    ))}
                </div>
              </React.Fragment>
            )
          }
          {shallPass &&
            !isAdded &&
            accGifts.length > 0 &&
            accGifts.length >= count && (
              <React.Fragment>
                <div className='mt-auto mx-auto text-center disabled-text'>
                  {language.checkout.data.ppgb11.value}
                </div>
              </React.Fragment>
            )
          }
          {isAdded && (
            <React.Fragment>
              <div className='d-flex align-items-center w-100'>
                <div className='mt-auto text-center disabled-text already-added d-inline flex-fill'>
                  {language.checkout.data.ppgb2.value}
                </div>
                <button
                  onClick={this.removeTherapy({...row,...{isFreeProduct: 1}})}
                  className='d-inline btn btn-remove-gift ml-auto'>
                  {language.checkout.data.ppgb444.value}
                </button>
              </div>
            </React.Fragment>
          )}
          </div>
      )
    })
    this.setState({ ggifts: data })
    this.setState({ giftsAvailable: giftsAvailable })
    // }
  }
  removeTherapy = row => () => {
    if (row.isGift) {
      this.props.removeGiftFromCart(row, this.props.currency)
    } else {
      this.props.removeFromCart(row, this.props.currency)
    }
  }

  chooseAccessoryOption = (name, accessoryId) => {
    this.props.addDiscount(name, accessoryId);
  }

  changeQ = (row, i) => () => {
    let new_q
    if (i === 1) {
      if (row.quantity > 1) {
        new_q = row.quantity - 1
        this.props.changeQuantity(
          { therapy: row, new_quantity: new_q },
          this.props.currency,
        )
      }
    } else {
      new_q = row.quantity + 1
      this.props.changeQuantity(
        { therapy: row, new_quantity: new_q },
        this.props.currency,
      )
    }
  }

  calculateConditionsForNewGift = (
    giftConfig,
    current_quantity,
    current_total_price,
    language,
  ) => {
    var next_quantity = parseInt(giftConfig.nextGiftConfig.num_therapies)
    var next_price = parseInt(giftConfig.nextGiftConfig.price)

    if (next_quantity) {
      //calculate based on quantity if set in config
      if (next_quantity - current_quantity === 1) {
        return language.pptn4.value
      } else {
        return language.pptn4x2.value
      }
    } else if (next_price) {
      //calculate based on price if set in config
      return language.pptn4dp.value + (next_price - current_total_price)
    } else {
      //no more gift target in config
      return ''
    }
  }

  renderTherapy(row, index) {
    let { language } = this.props
    const { fixed } = this.props

    return (
      <tr key={index} className='product-tr'>
        <td className='first d-flex align-items-center'>
          <div className='item-name'>
            <p className='big'>
              {row.isGift ? language.checkout.data.ppggnnn.value : ''}{' '}
              {row.name}
            </p>
            {row.product_name && row.category != "bundle" && <p className='small'>- {row.product_name}</p>}
          </div>
          {
            row.isFreeTherapy || row.isFreeAccessory
            ? null
            : <div
              onClick={this.removeTherapy(row)}
              className='pointer cart-x ml-3'>
              X
            </div>
          }

        </td>
        <td className='second text-right'>
          {!row.isGift && !row.isFreeTherapy && !row.isFreeAccessory && !row.isFreeProduct && (
            <img
              width='15'
              onClick={this.changeQ(row, 1)}
              className='mr-3 pointer'
              src='/static/images/minus-sign.svg'
              alt='plus-sign'
            />
          )}
          {row.quantity}
          {!row.isGift && !row.isFreeTherapy && !row.isFreeAccessory && !row.isFreeProduct && (
            <img
              width='15'
              onClick={this.changeQ(row, 2)}
              className='ml-3 pointer'
              src='/static/images/plus-sign.svg'
              alt='plus-sign'
            />
          )}
        </td>
        <td className='third text-right'>
          {(row.price * row.quantity).toFixed(fixed)}{' '}
          {this.props.currency.symbol}
        </td>
      </tr>
    )
  }

  submitDiscount(name) {
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
    }).catch(error => {
      if (error.response && error.response.status === 404) {
        this.props.setDiscountNotFound(2);
      }
    });
  }

  closeModal() {
    this.props.closeAccessoryModal()
  }

  addGiftToCart = row => () => {
    const { currency } = this.props
    var foundProduct = null
    if (selectedOption && selectedOption.accId === row.id) {
      foundProduct = row.options.find(o => {
        return o.id === selectedOption.optionId
      })
    }

    let product

    if (foundProduct) {
      product = foundProduct
    } else {
      product = row.options[0]
    }

    let data = {
      id: row.id,
      product_id: product.id,
      product_name: product.name,
      name: row.name,
    }

    this.props.addGiftToCart(data, currency)
  }

  removeDiscount = () => {
    this.props.removeDiscount()
  }

  pageHandler = slideCount => {
    let itemIndex = 0
    itemIndex = slideCount
    this.Carousel._slideToItem(itemIndex)
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
      delivery_methods,
      payment_methods,
      discount_not_found,
      customer,
      gifts,
      sticky_note,
      locale,
      fixed,
      all_routes,
      giftConfig,
    } = this.props

    const arrAccessories = Array.isArray(cart.accessories) ? cart.accessories : [];

    var products = [...cart.therapies, ...arrAccessories]
    var productsLink = (routes &&
      routes.find(r => {
        return r.page == productsRoute
      })) || { route: '' }

    let delivery =
     delivery_methods && delivery_methods.find(d => {
        return d.id === customer.delivery_method_id
      }) || null
    let razlika = 0
    let od = 0
    if (delivery) {
      razlika =
        ((cart.subtotal - delivery.to_price) / delivery.to_price) * 100 * -1
      od = delivery.to_price - cart.subtotal
    }

    // let accGifts = cart.accessories.filter(g => {
    //   return g.isGift
    // })
    let quantity = 0
    cart.therapies.map(th => {
      quantity += th.quantity * th.product_quantity
    })
    // let isAdded = cart.accessories.find(a => {
    //   return a.id === a.id && a.price === 0
    // })

    let shippingDiscount = false
    if (
      cart.discountData && cart.discountData.type &&
      cart.discountData.type.toLowerCase() == 'shipping'
    ) {
      shippingDiscount = true
    }

    //console.log("Šiping " + shippingDiscount);
    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        page='cart'
        countries={countries}
        isCheckout={true}
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        currency={currency}
        delivery_methods={delivery_methods}
        payment_methods={payment_methods}>
        <div className='container page-container pb-5'>
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
          {cart.therapies.length === 0 && cart.accessories.length === 0 ? (
            <div className='text-center empty-cart'>
              <img
                width='200'
                height='200'
                src='/static/images/prazna-kosarica-gif.gif'
                alt='shopping_cart'
                className='mb-5 mt-5'
              />
              <h1 className='main-page-title'>
                {language?.checkout?.data?.emca1?.value}
              </h1>
              <div className='border blog-border'></div>
              <p className='subtitle'>{language?.checkout?.data?.emca2?.value}</p>
              <Link
                href={productsLink.page}
                as={`/${lang}-${country}/${productsLink.route}`}>
                <button className='btn btn-primary btn-main'>
                  {language?.checkout?.data?.emca3?.value}
                </button>
              </Link>
            </div>
          ) : (
            <div className='row checkout-row'>
              <div className='col-md-12 info-ch-w'>
                <h1 className='main-page-title'>
                  {language.checkout.data.chead4.value}
                </h1>
                <div className='border blog-border'></div>
                <table className='ch-table w-100'>
                  <thead>
                    <tr>
                      <th>{language.checkout.data.cth1.value}</th>
                      <th className='text-right'>
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
                      <td colSpan='2' className='text-right'>
                        {language.checkout.data.ctr1.value}
                      </td>
                      <td className='text-right'>
                        {cart.subtotal && cart.subtotal.toFixed(fixed)} {currency.symbol}
                      </td>
                    </tr>
                    {cart.discount != 0 && (
                      <tr className='last-row'>
                        <td colSpan='2' className='text-right'>
                          {language.checkout.data.ctr2.value} (
                          {cart.discountData.name})
                          <div
                            onClick={this.removeDiscount}
                            className='pointer cart-x ml-3'>
                            X
                          </div>
                        </td>
                        <td className='text-right'>
                          {cart.discount && cart.discount.toFixed(fixed)} {currency.symbol}
                        </td>
                      </tr>
                    )}
                    <tr className='last-row'>
                      <td colSpan='2' className='text-right'>
                        {language.checkout.data.ctr3.value}
                      </td>
                      <td className='text-right'>
                        {cart.shipping_fee.toFixed(fixed)} {currency.symbol}
                      </td>
                    </tr>
                    <tr className='last-row'>
                      <td colSpan='2' className='text-right'>
                        {language.checkout.data.ctr4.value}
                      </td>
                      <td className='text-right'>
                        {cart.total && cart.total.toFixed(fixed)} {currency.symbol}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {od > 0 && shippingDiscount != true && (
                  <div className='row justify-content-end'>
                    <div className='col-md-4 pt-3 pb-2'>
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
                    </div>
                  </div>
                )}
                {
                // discount_not_found != 1 &&
                  (!cart.discount || cart.discount === 0) && (
                    <DiscountForm
                      cart_form={true}
                      discount_not_found={discount_not_found}
                      submitF={this.submitDiscount}
                      language={language}
                    />
                  )}
                {!this.state.giftsAvailable ? "" :
                <div className='blue-checkout-box second'>
                  <Link
                    href={this.state.checkoutLink.page}
                    as={`/${lang}-${country}/${this.state.checkoutLink.route}`}>
                    <button className='btn btn-primary btn-checkout'>
                      <img
                        alt='image'
                        className='checkout-image'
                        src='/static/images/light-arrow-right.svg'
                      />
                      {language.checkout.data.cbutton1.value}
                    </button>
                  </Link>
                </div>
                }
                <h2 className='gift-title text-center'>
                  {language.checkout.data.pptn3.value}
                </h2>
                <p className='text-center gift-main-subtitle'>
                  {!this.state.giftsAvailable
                    ? giftConfig
                      ? (giftConfig.count === 1 &&
                          language.checkout.data.pptn44.value) ||
                        (giftConfig.count === 2 &&
                          language.checkout.data.pptn44x2.value) ||
                        (giftConfig.count === 3 &&
                          language.checkout.data.pptn44x3.value)
                      : language.checkout.data.pptn4.value
                    : giftConfig
                    ? this.calculateConditionsForNewGift(
                        giftConfig,
                        quantity,
                        cart.total,
                        language.checkout.data,
                      )
                    : language.checkout.data.pptn4.value}
                </p>
                <div className='row list-acc'>
                  <AliceCarousel
                    mouseDragEnabled
                    responsive={{
                      0: { items: 2 },
                      767: { items: 5 },
                    }}
                    items={this.state.ggifts}
                    dotsDisabled={true}
                    buttonsDisabled={true}
                    autoHeight={true}
                    ref={el => (this.Carousel = el)}
                  />
                  <p
                    onClick={() =>
                      this.pageHandler(this.Carousel.state.currentIndex - 1)
                    }
                    className='car-button prev pointer'>
                    <i></i>
                  </p>
                  <p
                    onClick={() =>
                      this.pageHandler(this.Carousel.state.currentIndex + 1)
                    }
                    className='car-button next pointer'>
                    <i></i>
                  </p>
                </div>

                <div className='blue-checkout-box second'>
                  <Link
                    href={this.state.checkoutLink.page}
                    as={`/${lang}-${country}/${this.state.checkoutLink.route}`}>
                    <button className='btn btn-primary btn-checkout'>
                      <img
                        alt='image'
                        className='checkout-image'
                        src='/static/images/light-arrow-right.svg'
                      />
                      {language.checkout.data.cbutton1.value}
                    </button>
                  </Link>
                </div>
                <div className='v-n-w'>
                  <h1 className='main-page-title'>
                    {language.checkout.data.chead5.value}
                  </h1>
                  <div className='border blog-border'></div>
                  <div className='cart-icons-wrap row'>
                    <div className='col-12 col-md-6 d-flex align-items-center cart-icon-1'>
                      <img
                        alt='image'
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

                    <div className='col-12 col-md-6 d-flex align-items-center cart-icon-2'>
                      <img
                        alt='image'
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

                    <div className='col-12 col-md-6 d-flex align-items-center cart-icon-3'>
                      <img
                        alt='image'
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

                    <div className='col-12 col-md-6 d-flex align-items-center cart-icon-4'>
                      <img
                        alt='image'
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
          )}
        </div>
      </Layout>
    )
  }
}

Cart.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      removeFromCart: (id, currency) => removeFromCart(id, currency),
      removeGiftFromCart: (id, currency) => removeGiftFromCart(id, currency),
      addDiscount: (name, accessoryId) => addDiscount(name, accessoryId),
      addDiscount2: (name, accessories) => addDiscount2(name, accessories),
      removeDiscount: () => removeDiscount(),
      addGiftToCart: (id, currency) => addGiftToCart(id, currency),
      changeQuantity: (product, currency) => changeQuantity(product, currency),
      getDiscountData: (discount) => getDiscountData(discount),
      openAccessoryModal: (accessories, name) => openAccessoryModal(accessories, name),
      closeAccessoryModal: () => closeAccessoryModal(),
      setDiscountNotFound: (value) => ({ type: 'DISCOUNT_NOT_FOUND', payload: value }),
    },
    dispatch,
  )
}
const mapStateToProps = (state, props) => {
  return {
    language: props.language && parseLanguageModules(props.language.languageModules),
    lang: props.language && props.language.language.toLowerCase(),
    country: props.language && props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    customer: state.cart.customer,
    cart: state.cart.cart,
    accessory_modal: state.cart.open_accessory_modal,
    accessory_modal_items: state.cart.accessory_modal_items,
    discount_name: state.cart.discount_name,
    gifts: state.cart.gifts,
    giftConfig: state.cart.giftConfig,
    currency: props.initData && props.initData.currency,
    countries: props.initData && props.initData.countries,
    payment_methods: props.initData && props.initData.payment_methods,
    delivery_methods: props.initData && props.initData.delivery_methods,
    routes: props.language && props.language.routes,
    discount_not_found: state.cart.discount_not_found,
    sticky_note: props.initData && props.initData.sticky_note,
    locale: props.locale,
    fixed: state.main.fixed,
    all_routes: props.all_routes,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Cart)
