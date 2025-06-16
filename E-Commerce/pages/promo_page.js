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

class PromoPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
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

  addToCart = (therapy, couponValue) => {
    const { currency } = this.props
    this.props.addToCart({ therapy, new_quantity: 1, coupon: couponValue }, currency)
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

  setDate = "November, 1, 2024";

  checkCountdown = () => {
    let now = new Date()
    let currentDate = new Date()
    let futureDate = new Date(this.setDate)
    let diff = futureDate.getTime() / 1000 - currentDate.getTime() / 1000

    console.log("DIFF + diff")

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
        page='easter'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        addToCart={this.addToCart}
        currency={currency}>
        <div className='container-fluid promo-page'>
          <div className='container page-container'>
            <div className='row promo-header d-flex align-items-center'>
              <div className='col-12 col-md-6'>
                <img className='top-image img-fluid image-promo' id='easterImage' src={ language.promo_page.data.mainImage.value } />
              </div>
              <div className='col-12 col-md-6 d-flex align-items-center'>
                <div className='promo-content' dangerouslySetInnerHTML={{ __html: language.promo_page.data.mainContent.value }}>
                </div>
              </div>
            </div>
            <div className="row timer-row">
                <div id="timer" className="col-12 promo-page-timer d-flex align-items-center flex-column align-content-center justify-content-center order-2 order-md-1 white color-white">
                {this.state.countdownComplete ? language.promo_page.data.offerEnded?.value
                  : 
                  <React.Fragment>
                    <h3>{language.promo_page.data.titleCountdown?.value}</h3>
                    <Timer id="what" deadline={this.setDate} lang={lang} />
                  </React.Fragment>}
                </div>
              </div>

            <div className='d-flex justify-content-center align-items-center'><div className='top-header-4d'>4D HYALURON</div></div>
            <div className='row mb-5 mt-4'>
            <div className='col-12 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-1'>
                  <div className='coupon-box-header'>1x {language.promo_page.data.coupon1header.value}</div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/4d1x.png' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.promo_page.data.coupon1.value }}></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.promo_page.data.regular4d1x.value}</span><span className="bundle-new-price">{language.promo_page.data.new4d1x.value}</span></div>
                    <div className="bundle-save">{language.promo_page.data.save4d1x.value}</div>
                    <div className='button'>
                      <button onClick={() => this.addToCartShort(language.promo_page.data.sale4d1x.value, "FRESH18")} className='btn btn-bar-not-full'>{language.main.data.addtocart.value}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-12 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-1'>
                  <div className='coupon-box-header'>2x {language.promo_page.data.coupon1header.value}</div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/4d2x.png' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.promo_page.data.coupon1.value }}></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.promo_page.data.regular4d2x.value}</span><span className="bundle-new-price">{language.promo_page.data.new4d2x.value}</span></div>
                    <div className="bundle-save">{language.promo_page.data.save4d2x.value}</div>
                    <div className='button'>
                      <button onClick={() => this.addToCartShort(language.promo_page.data.sale4d2x.value, "FRESH18")} className='btn btn-bar-not-full'>{language.main.data.addtocart.value}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-12 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-1'>
                <div className='coupon-box-header'>3x {language.promo_page.data.coupon1header.value}</div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/4d3x.png' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.promo_page.data.coupon1.value }}></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.promo_page.data.regular4d3x.value}</span><span className="bundle-new-price">{language.promo_page.data.new4d3x.value}</span></div>
                    <div className="bundle-save">{language.promo_page.data.save4d3x.value}</div>
                    <div className='button'>
                      <button onClick={() => this.addToCartShort(language.promo_page.data.sale4d3x.value, "FRESH18")} className='btn btn-bar-not-full'>{language.main.data.addtocart.value}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='d-flex justify-content-center align-items-center'><div className='top-header-eyelash'>EYELASH</div></div>
            <div className='row mb-5 mt-4'>
              <div className='col-12 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-3'>
                  <div className='coupon-box-header'>1x {language.promo_page.data.coupon3header.value}</div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/eyelash1x.png' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.promo_page.data.coupon3.value, }}></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.promo_page.data.regularEyelash1x.value}</span><span className="bundle-new-price">{language.promo_page.data.newEyelash1x.value}</span></div>
                    <div className="bundle-save">{language.promo_page.data.saveEyelash1x.value}</div>
                    <div className='button'>
                      <button onClick={() => this.addToCartShort(language.promo_page.data.saleEyelash1x.value, "MAGIC20")} className='btn btn-bar-not-full'>{language.main.data.addtocart.value}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-12 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-3'>
                  <div className='coupon-box-header'>2x {language.promo_page.data.coupon3header.value}</div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/eyelash2x.png' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.promo_page.data.coupon3.value, }}></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.promo_page.data.regularEyelash2x.value}</span><span className="bundle-new-price">{language.promo_page.data.newEyelash2x.value}</span></div>
                    <div className="bundle-save">{language.promo_page.data.saveEyelash2x.value}</div>
                    <div className='button'>
                      <button onClick={() => this.addToCartShort(language.promo_page.data.saleEyelash2x.value, "MAGIC20")} className='btn btn-bar-not-full'>{language.main.data.addtocart.value}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-12 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-3'>
                  <div className='coupon-box-header'>3x {language.promo_page.data.coupon3header.value}</div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/eyelash3x.png' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.promo_page.data.coupon3.value, }}></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.promo_page.data.regularEyelash3x.value}</span><span className="bundle-new-price">{language.promo_page.data.newEyelash3x.value}</span></div>
                    <div className="bundle-save">{language.promo_page.data.saveEyelash3x.value}</div>
                    <div className='button'>
                      <button onClick={() => this.addToCartShort(language.promo_page.data.saleEyelash3x.value, "MAGIC20")} className='btn btn-bar-not-full'>{language.main.data.addtocart.value}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='d-flex justify-content-center align-items-center'><div className='top-header-procollagen'>PROCOLLAGEN</div></div>
            <div className='row mb-5 mt-4'>
            <div className='col-12 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-2'>
                  <div className='coupon-box-header'>1x {language.promo_page.data.coupon2header.value}</div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/pc1x.png' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.promo_page.data.coupon2.value, }}></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.promo_page.data.regularProcollagen1x.value}</span><span className="bundle-new-price">{language.promo_page.data.newProcollagen1x.value}</span></div>
                    <div className="bundle-save">{language.promo_page.data.saveProcollagen1x.value}</div>
                    <div className='button'>
                      <button onClick={() => this.addToCartShort(language.promo_page.data.saleProcollagen1x.value, "SPARK15")} className='btn btn-bar-not-full'>{language.main.data.addtocart.value}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-12 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-2'>
                  <div className='coupon-box-header'>2x {language.promo_page.data.coupon2header.value}</div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/pc2x.png' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.promo_page.data.coupon2.value, }}></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.promo_page.data.regularProcollagen2x.value}</span><span className="bundle-new-price">{language.promo_page.data.newProcollagen2x.value}</span></div>
                    <div className="bundle-save">{language.promo_page.data.saveProcollagen2x.value}</div>
                    <div className='button'>
                      <button onClick={() => this.addToCartShort(language.promo_page.data.saleProcollagen2x.value, "SPARK15")} className='btn btn-bar-not-full'>{language.main.data.addtocart.value}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-12 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-2'>
                  <div className='coupon-box-header'>3x {language.promo_page.data.coupon2header.value}</div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/pc3x.png' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.promo_page.data.coupon2.value, }}></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.promo_page.data.regularProcollagen3x.value}</span><span className="bundle-new-price">{language.promo_page.data.newProcollagen3x.value}</span></div>
                    <div className="bundle-save">{language.promo_page.data.saveProcollagen3x.value}</div>
                    <div className='button'>
                      <button onClick={() => this.addToCartShort(language.promo_page.data.saleProcollagen3x.value, "SPARK15")} className='btn btn-bar-not-full'>{language.main.data.addtocart.value}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='valid-until mb-5 col-12' dangerouslySetInnerHTML={{__html: language.promo_page.data.validUntil.value}}></div>
            </div>

          </div>
        </div> 
        <script
          dangerouslySetInnerHTML={{
            __html: `
          $(document).ready(function(){
              $(".coupon-box-text").click(function(event){
              var $tempElement = $("<input>");
                  $("body").append($tempElement);
                  $tempElement.val($(this).text()).select();
                  document.execCommand("Copy");
                  $tempElement.remove();
                  console.log("Kopirano");
              var tooltipOne = $(this).siblings(".tooltiptext");
              tooltipOne.css({"visibility":"visible","opacity":"1"}).delay( 800 );
              });
          });
        `,
          }}
        />
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

PromoPage.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  return data
}

const mapDispatchToProps = dispatch => {
  return {
    addToCart: bindActionCreators(addToCart, dispatch),
    openCartModal: bindActionCreators(openCartModal, dispatch),
    addDiscount: bindActionCreators(addDiscount, dispatch),
    getDiscountData: bindActionCreators(getDiscountData, dispatch),
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

export default connect(mapStateToProps, mapDispatchToProps)(PromoPage)
