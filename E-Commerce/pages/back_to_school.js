import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { subscribe } from '../actions/mainActions'
import HomeTherapy from '../components/home-therapy'
import Layout from '../components/layout'
import { parseLanguageModules } from '../components/services.js'
import { ROOT_URL } from '../constants/constants.js'
import { getInitConfig } from '../utils/helpers/getInitConfig'
import { PageView } from '../actions/facebookActions'
import { addToCart, addDiscount, getDiscountData, openCartModal } from '../actions/cartActions.js'
import CartModal from '../components/cart_modal'
import { addToDataLayer } from '../components/services'
import { Timer } from '../components/timer.js'

class BackToSchoolPage extends React.Component {
  constructor(props) {
    super(props)

    this.renderSingleTherapy = this.renderSingleTherapy.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.closeCartModal = this.closeCartModal.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
    const { therapies, currency } = this.props;
    this.checkCountdown();
  }

  state = {
    countdownComplete: false,
    myStyle: {}
  };

  renderSingleTherapy(row, index) {
    return (
      <HomeTherapy
        module_location='Homepage product list'
        therapies={this.props.therapies}
        currency={this.props.currency}
        lang={this.props.lang}
        country={this.props.country}
        data={row}
        key={index}
      />
    )
  }

  subscribe(email) {
    this.props.subscribe({ email })
  }

  addToCart = async therapy => {
    const { currency } = this.props
    await this.props.addToCart({ therapy, new_quantity: 1 }, currency)
    this.props.openCartModal()
  }

  closeCartModal() {
    this.props.closeCartModal()
  }

  addToCartShort = async (therapyId, discountCode) => {
    const { currency } = this.props
  
    // Add to cart first
    this.props.addToCart(
      { 
        therapy: { id: therapyId }, 
        new_quantity: 1, 
      },
      currency,
    )
  
    // Then get the discount data
    const discountData = await this.props.getDiscountData(discountCode)
  
    // Then add the discount to the cart
    this.props.addDiscount(discountCode)
  
    this.props.openCartModal()
    dataLayer.push({
      event: 'eventTracking',
      eventCategory: 'Product Page',
      eventAction: 'click',
      eventLabel: 'Bottom bar - ' + this.props.therapies[0].name,
    })
  }

  setDate = "September, 1, 2024";

  checkCountdown = () => {
    let now = new Date()
    let currentDate = new Date()
    let futureDate = new Date(this.setDate)
    let diff = futureDate.getTime() / 1000 - currentDate.getTime() / 1000

    if (diff < 0) {
      this.completeCountDown()
    }
  }

  completeCountDown = () => {
    this.setState({
        countdownComplete: true,
        myStyle: { display: 'block' }  // new style
      });
  };
    
  render() {
    const {
      language,
      routes,
      lang,
      country,
      langConfig,
      therapies,
      categories,
      currency,
      countries,
      open_cart_modal,
      cart,
      addedTherapy,
      sticky_note,
      locale,
      all_routes,
      fixed
    } = this.props


    return (
      <Layout
        all_routes={all_routes}
        locale={locale}
        sticky_note={sticky_note}
        countries={countries}
        page='back_to_school'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        addToCart={this.addToCart}
        currency={currency}>
        <div className="b2s-sale-page">
        <div className="container-fluid text-center b2s-sale-content">
          <div className="container b2s-sale-header">
            <div className="row timer-row">
              <div id="timer" className="col-12 timer d-flex align-items-center flex-column align-content-center justify-content-center order-2 order-md-1 white color-white">
              {this.state.countdownComplete ? language.back_to_school.data.offerEnded?.value
                : 
                <React.Fragment>
                  <h3>{language.back_to_school.data.titleCountdown?.value}</h3>
                  <Timer id="what" deadline={this.setDate} lang={lang} />
                </React.Fragment>}
              </div>
            </div>
          </div>
          <div className='container'>
            <div className="row">
              <div className="col-12 sale-content-subtitle">
                <h1 className="bf-heading" dangerouslySetInnerHTML={{__html: language.back_to_school.data.backToSchoolTitle.value}}></h1>
                <p className="bf-main-content" dangerouslySetInnerHTML={{__html: language.back_to_school.data.backToSchoolContent.value}}></p>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row d-flex flex-column b2s-sale-product-header b2s-4d">
              <h2>{language.back_to_school.data.firstOfferTitle.value}</h2>
              <h3>{language.back_to_school.data.firstOfferDesc.value}</h3>
            </div>
            <div className="row black-friday-bundles b2s-4d">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-sale-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-4d1.png" alt="1x 4D HYALURON" />
                  </div>
                  <div className="bf-bundle-content-box">
                  <div className="bundle-title">1x <span className="color-procollagen">4D HYALURON</span><br/>+ {language.back_to_school.data.balzam.value}</div>
                  <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPrice4d1?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPrice4d1?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSave4d1?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2s4d1.value,language.back_to_school.data.b2s4dcode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-4d2.png" alt="2x 4D HYALURON" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x <span className="color-procollagen">4D HYALURON</span><br/>+ {language.back_to_school.data.balzam.value}</div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPrice4d2?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPrice4d2?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSave4d2?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2s4d2.value,language.back_to_school.data.b2s4dcode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-4d3.png" alt="3x 4D HYALURON" />
                  </div>
                  <div className="bf-bundle-content-box">
                  <div className="bundle-title">3x <span className="color-procollagen">4D HYALURON</span><br/>+ {language.back_to_school.data.balzam.value}</div>
                  <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPrice4d3?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPrice4d3?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSave4d3?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2s4d3.value,language.back_to_school.data.b2s4dcode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row d-flex flex-column b2s-sale-product-header b2s-lash">
              <h2>{language.back_to_school.data.secondOfferTitle.value}</h2>
              <h3>{language.back_to_school.data.secondOfferDesc.value}</h3>
            </div>
            <div className="row black-friday-bundles b2s-lash">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-sale-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-lash1.png" alt="1x EYELASH" />
                  </div>
                  <div className="bf-bundle-content-box">
                  <div className="bundle-title">1x <span className="color-procollagen">EYELASH</span><br/>+ {language.back_to_school.data.copici.value}</div>
                  <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPriceLash1?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPriceLash1?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSaveLash1?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2slash1.value,language.back_to_school.data.b2slashcode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-lash2.png" alt="2x EYELASH" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x <span className="color-procollagen">EYELASH</span><br/>+ {language.back_to_school.data.copici.value}</div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPriceLash2?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPriceLash2?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSaveLash2?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2slash2.value,language.back_to_school.data.b2slashcode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-lash3.png" alt="3x EYELASH" />
                  </div>
                  <div className="bf-bundle-content-box">
                  <div className="bundle-title">3x <span className="color-procollagen">EYELASH</span><br/>+ {language.back_to_school.data.copici.value}</div>
                  <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPriceLash3?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPriceLash3?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSaveLash3?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2slash3.value,language.back_to_school.data.b2slashcode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row d-flex flex-column b2s-sale-product-header b2s-pc">
              <h2>{language.back_to_school.data.thirdOfferTitle.value}</h2>
              <h3>{language.back_to_school.data.thirdOfferDesc.value}</h3>
            </div>
            <div className="row black-friday-bundles b2s-pc">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-sale-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-pc1.png" alt="1x PROCOLLAGEN" />
                  </div>
                  <div className="bf-bundle-content-box">
                  <div className="bundle-title">1x <span className="color-procollagen">PROCOLLAGEN</span><br/>+ {language.back_to_school.data.skodelicaBossy.value}</div>
                  <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPricePc1?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPricePc1?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSavePc1?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2spc1.value,language.back_to_school.data.b2spccode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-pc2.png" alt="2x PROCOLLAGEN" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x <span className="color-procollagen">PROCOLLAGEN</span><br/>+ {language.back_to_school.data.skodelicaBossy.value}</div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPricePc2?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPricePc2?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSavePc2?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2spc2.value,language.back_to_school.data.b2spccode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-pc3.png" alt="3x PROCOLLAGEN" />
                  </div>
                  <div className="bf-bundle-content-box">
                  <div className="bundle-title">3x <span className="color-procollagen">PROCOLLAGEN</span><br/>+ {language.back_to_school.data.skodelicaBossy.value}</div>
                  <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPricePc3?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPricePc3?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSavePc3?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2spc3.value,language.back_to_school.data.b2spccode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row d-flex flex-column b2s-sale-product-header b2s-4dc">
              <h2>{language.back_to_school.data.fourthOfferTitle.value}</h2>
              <h3>{language.back_to_school.data.fourthOfferDesc.value}</h3>
            </div>
            <div className="row black-friday-bundles b2s-4dc">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-sale-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-4dc1.png" alt="1x 4D CAVIAR" />
                  </div>
                  <div className="bf-bundle-content-box">
                  <div className="bundle-title">1x <span className="color-procollagen">4D CAVIAR</span><br/>+ {language.back_to_school.data.skodelicaStillMe.value}</div>
                  <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPrice4dc1?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPrice4dc1?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSave4dc1?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2s4dc1.value,language.back_to_school.data.b2s4dccode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-4dc2.png" alt="2x 4D CAVIAR" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x <span className="color-procollagen">4D CAVIAR</span><br/>+ {language.back_to_school.data.skodelicaStillMe.value}</div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPrice4dc2?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPrice4dc2?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSave4dc2?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2s4dc2.value,language.back_to_school.data.b2s4dccode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.back_to_school.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/b2s-4dc3.png" alt="3x 4D CAVIAR" />
                  </div>
                  <div className="bf-bundle-content-box">
                  <div className="bundle-title">3x <span className="color-procollagen">4D CAVIAR</span><br/>+ {language.back_to_school.data.skodelicaStillMe.value}</div>
                  <div className="bundle-price"><span className="bundle-regular-price">{language.back_to_school.data.regularPrice4dc3?.value}</span><span className="bundle-new-price">{language.back_to_school.data.newPrice4dc3?.value}</span></div>
                    <div className="bundle-save">{language.back_to_school.data.youSave4dc3?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.back_to_school.data.b2s4dc3.value,language.back_to_school.data.b2s4dccode.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
          <CartModal
            fixed={fixed}
            addedTherapy={addedTherapy}
            closeCartModal={this.closeCartModal}
            routes={routes}
            cartModal={open_cart_modal}
            cart={cart}
            language={language}
            lang={lang}
            country={country}
            currency={currency}
          />
      </Layout>
    )
  }
}

BackToSchoolPage.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: bindActionCreators(addToCart, dispatch),
    addDiscount: bindActionCreators(addDiscount, dispatch),
    getDiscountData: bindActionCreators(getDiscountData, dispatch),
    openCartModal: bindActionCreators(openCartModal, dispatch),
    closeCartModal: bindActionCreators(openCartModal, dispatch),
    subscribe: bindActionCreators(subscribe, dispatch),
  }
}

const mapStateToProps = (state, props) => {
  return {
    language: parseLanguageModules(props.language.languageModules),
    lang: props.language.language.toLowerCase(),
    country: props.language.country.toLowerCase(),
    langConfig: props.langConfig,
    subscribe_result: state.main.subscribe_result,
    accessories: props.initData.accessories,
    routes: props.language.routes,
    currency: props.initData.currency,
    countries: props.initData.countries,
    therapies: props.initData.therapies,
    categories: props.initData.categories,
    sticky_note: props.initData.sticky_note,
    locale: props.locale,
    fixed: state.main.fixed,
    all_routes: props.all_routes,
    addedTherapy: state.cart.addedTherapy,
    addedProduct: state.cart.addedProduct,
    open_cart_modal: state.cart.open_cart_modal,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BackToSchoolPage)
