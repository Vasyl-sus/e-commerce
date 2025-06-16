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
import { addToCart, openCartModal } from '../actions/cartActions.js'
import CartModal from '../components/cart_modal'
import { addToDataLayer } from '../components/services'

class FreeHandCream extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
    this.renderSingleTherapy = this.renderSingleTherapy.bind(this)
    this.subscribe = this.subscribe.bind(this)

    this.closeCartModal = this.closeCartModal.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
    const { therapies, currency } = this.props
  }

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

  addToCartShort = (therapyId) => {
    const { currency } = this.props
    this.props.addToCart(
      { therapy: { id: therapyId }, new_quantity: 1 },
      currency,
    )
    this.props.openCartModal()
    dataLayer.push({
      event: 'eventTracking',
      eventCategory: 'Product Page',
      eventAction: 'click',
      eventLabel: 'Bottom bar - ' + this.props.therapies[0].name,
    })

  }

  completeCountDown = () => {
    this.setState({ complete: true })
  }

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
        <div className='container-fluid promo-page free-hand-cream-page'>
          <div className='container page-container'>
            <div className='row promo-header d-flex align-items-center'>
              <div className='col-12 col-md-6'>
                <img className='top-image img-fluid image-promo' id='easterImage' src={ language.free_hand_cream.data.mainImage.value } />
              </div>
              <div className='col-12 col-md-6 d-flex align-items-center'>
                <div className='promo-content' dangerouslySetInnerHTML={{ __html: language.free_hand_cream.data.mainContent.value }}>
                </div>
              </div>
            </div>
            <div className='row mb-1 mt-5 d-flex align-items-center justify-content-center'>
              <div className='col-6 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-1'>
                  <div className='coupon-box-header' dangerouslySetInnerHTML={{
                    __html: language.free_hand_cream.data.coupon1header.value,
                  }}>
                  </div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/free-aqua.png' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.free_hand_cream.data.coupon1.value }}></div>
                  </div>
                </div>
              </div>
              <div className='col-6 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-2'>
                  <div className='coupon-box-header' dangerouslySetInnerHTML={{
                    __html: language.free_hand_cream.data.coupon2header.value,
                  }}>
                  </div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/free-royal.png' className='img-fluid' />
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.free_hand_cream.data.coupon2.value, }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='valid-until mb-5 col-12' dangerouslySetInnerHTML={{__html: language.free_hand_cream.data.validUntil.value}}></div>
            </div>
            <div className='row'>
              <div className='mb-3 mt-3 col-12'><h2 dangerouslySetInnerHTML={{__html: language.free_hand_cream.data.pageFooterTitle.value}}></h2></div>
            </div>
            <div className='container therapies-wrap'>
              <div className='row justify-content-center'>
                {categories.map(this.renderSingleTherapy)}
              </div>
              <div className='home-border'></div>
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

FreeHandCream.getInitialProps = async function (context) {
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

export default connect(mapStateToProps, mapDispatchToProps)(FreeHandCream)
