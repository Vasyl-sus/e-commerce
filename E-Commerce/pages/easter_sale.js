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

class EasterSalePage extends React.Component {
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

  addToCart = therapy => {
    const { currency } = this.props
    this.props.addToCart({ therapy, new_quantity: 1 }, currency)
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

  setDate = "April 23, 2025";

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
        page='easter_sale'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        addToCart={this.addToCart}
        currency={currency}>
        <div className="easter-header">
            <div className="container">
              <div className="row d-flex align-items-center">
                <img
                  className='img-fluid img-landing'
                  alt=''
                  src={language.easter_sale.data.headerImage.value}
                />
              </div>
              <div className="row timer-row">
                <div id="timer" className="col-12 bf-timer d-flex align-items-center flex-column align-content-center justify-content-center order-2 order-md-1 white color-white">
                {this.state.countdownComplete ? language.easter_sale.data.offerEnded?.value
                  : 
                  <React.Fragment>
                    <h3>{language.easter_sale.data.titleCountdown?.value}</h3>
                    <Timer id="what" deadline={this.setDate} lang={lang} />
                  </React.Fragment>}
                </div>
              </div>
            </div>
        </div>
        <div className="container-fluid easter-bg text-light text-center bf-content">
          <div className='container'>
            <div className="row">
              <div className="col-12 easter-content">
                <h1 className="bf-heading" dangerouslySetInnerHTML={{__html: language.easter_sale.data.winterSaleTitle.value}}></h1>
                <p className="bf-main-content" dangerouslySetInnerHTML={{__html: language.easter_sale.data.winterSaleContent.value}}></p>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row black-friday-bundles">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="easter-bundle-box">
                  <div className="bf-bundle-percent">
                    {language.easter_sale.data.youSavePercentBundle1.value}
                  </div>
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-cntent"><div className="timer-bf-content-title">{language.easter_sale.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/easter-4dh.png" alt="4D HYALURON Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x<br/><span className="color-4d">4D HYALURON</span></div>
                    <div className="bundle-desc">{language.easter_sale.data.descriptionBundle1?.value}</div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.easter_sale.data.regularPriceBundle1?.value}</span><span className="bundle-new-price">{language.easter_sale.data.newPriceBundle1?.value}</span></div>
                    <div className="bundle-save">{language.easter_sale.data.youSaveBundle1?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.easter_sale.data.bundle1ID.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
                <div className="more-about">
                  <p dangerouslySetInnerHTML={{__html: language.easter_sale.data.moreAboutProducts?.value}}></p>
                  <p><span dangerouslySetInnerHTML={{__html: language.easter_sale.data.moreAbout4D?.value}}></span></p>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="easter-bundle-box">
                  <div className="bf-bundle-percent">
                    {language.easter_sale.data.youSavePercentBundle2.value}
                  </div>
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.easter_sale.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/easter-pc.png" alt="PROCOLLAGEN Winter sale" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x<br/><span className="color-procollagen">PROCOLLAGEN</span></div>
                    <div className="bundle-desc">{language.easter_sale.data.descriptionBundle2?.value}</div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.easter_sale.data.regularPriceBundle2?.value}</span><span className="bundle-new-price">{language.easter_sale.data.newPriceBundle2?.value}</span></div>
                    <div className="bundle-save">{language.easter_sale.data.youSaveBundle2?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.easter_sale.data.bundle2ID.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
                <div className="more-about">
                  <p dangerouslySetInnerHTML={{__html: language.easter_sale.data.moreAboutProducts?.value}}></p>
                  <p><span dangerouslySetInnerHTML={{__html: language.easter_sale.data.moreAboutProcollagen?.value}}></span></p>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="easter-bundle-box">
                  <div className="bf-bundle-percent">
                    {language.easter_sale.data.youSavePercentBundle3.value}
                  </div>
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.easter_sale.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/easter-eyelash.png" alt="EYELASH Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x<br/><span className="color-eyelash">EYELASH</span></div>
                    <div className="bundle-desc">{language.easter_sale.data.descriptionBundle3?.value}</div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.easter_sale.data.regularPriceBundle3?.value}</span><span className="bundle-new-price">{language.easter_sale.data.newPriceBundle3?.value}</span></div>
                    <div className="bundle-save">{language.easter_sale.data.youSaveBundle3?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.easter_sale.data.bundle3ID.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
                <div className="more-about">
                  <p dangerouslySetInnerHTML={{__html: language.easter_sale.data.moreAboutProducts?.value}}></p>
                  <p><span dangerouslySetInnerHTML={{__html: language.easter_sale.data.moreAboutEyelash?.value}}></span></p>
                </div>
              </div>
            </div>
          </div>
          <div className='container'>
            <div className="row">
              <div className="col-12 easter-content">
                <h1 className="bf-heading" dangerouslySetInnerHTML={{__html: language.easter_sale.data.caviarEasterTitle?.value}}></h1>
                <p className="bf-main-content" dangerouslySetInnerHTML={{__html: language.easter_sale.data.caviarEasterContent?.value}}></p>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row black-friday-bundles">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="easter-bundle-box">
                  <div className="bf-bundle-percent">
                    1x
                  </div>
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-cntent"><div className="timer-bf-content-title">{language.easter_sale.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/easter-caviar.png" alt="4D HYALURON Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title"><span className="color-caviar">1x 4D CAVIAR</span></div>
                    <div className="bundle-desc">{language.easter_sale.data.caviarEnterCode?.value}</div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.easter_sale.data.caviarPrice1?.value}</span><span className="bundle-new-price">{language.easter_sale.data.caviarDiscounted1?.value}</span></div>
                    <div className="bundle-save">{language.easter_sale.data.caviarSave1?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.easter_sale.data.caviarId1.value, "CAVIAR25")}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="easter-bundle-box">
                  <div className="bf-bundle-percent">
                    2x
                  </div>
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.easter_sale.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/easter-caviar.png" alt="PROCOLLAGEN Winter sale" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title"><span className="color-caviar">2x 4D CAVIAR</span></div>
                    <div className="bundle-desc">{language.easter_sale.data.caviarEnterCode?.value}</div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.easter_sale.data.caviarPrice2?.value}</span><span className="bundle-new-price">{language.easter_sale.data.caviarDiscounted2?.value}</span></div>
                    <div className="bundle-save">{language.easter_sale.data.caviarSave2?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.easter_sale.data.caviarId2.value, "CAVIAR25")}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
                <div className="more-about">
                  <p dangerouslySetInnerHTML={{__html: language.easter_sale.data.moreAboutProducts?.value}}></p>
                  <p><span dangerouslySetInnerHTML={{__html: language.easter_sale.data.moreAbout4DCaviar?.value}}></span></p>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-md-4">
                <div className="easter-bundle-box">
                  <div className="bf-bundle-percent">
                    3x
                  </div>
                  <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">{language.easter_sale.data.offerEnded?.value}</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <img src="/static/images/easter-caviar.png" alt="EYELASH Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title"><span className="color-caviar">3x 4D CAVIAR</span></div>
                    <div className="bundle-desc">{language.easter_sale.data.caviarEnterCode?.value}</div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.easter_sale.data.caviarPrice3?.value}</span><span className="bundle-new-price">{language.easter_sale.data.caviarDiscounted3?.value}</span></div>
                    <div className="bundle-save">{language.easter_sale.data.caviarSave3?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.easter_sale.data.caviarId3.value, "CAVIAR25")}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
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

EasterSalePage.getInitialProps = async function (context) {
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

export default connect(mapStateToProps, mapDispatchToProps)(EasterSalePage)
