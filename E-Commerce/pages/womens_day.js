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
import { Timer } from '../components/timer.js'

class WomensDayPage extends React.Component {
  constructor(props) {
    super(props)
    
    // Set the target date
    this.setDate = "March, 17, 2025"
    
    // Use the pre-calculated countdown state from props
    this.state = {
      countdownComplete: props.countdownComplete,
      myStyle: props.countdownComplete ? { display: 'block' } : {},
      isClient: false // Add this to track client-side rendering
    }
    
    this.renderSingleTherapy = this.renderSingleTherapy.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.closeCartModal = this.closeCartModal.bind(this)
    this.addToCart = this.addToCart.bind(this)
    this.addToCartShort = this.addToCartShort.bind(this)
  }

  componentDidMount() {
    PageView(window.location.href);
    
    // Set isClient to true once component is mounted on client
    this.setState({ isClient: true });
    
    // Fix duplicate IDs in tooltips (all have id="myTooltip" which causes hydration issues)
    if (typeof window !== 'undefined') {
      // Remove duplicate IDs from tooltips
      document.querySelectorAll('.tooltiptext').forEach((tooltip, index) => {
        if (tooltip.id === 'myTooltip') {
          tooltip.removeAttribute('id');
        }
      });
      
      // Add coupon click handler after component is mounted
      if (window.jQuery) {
        window.jQuery(document).on("click", ".coupon-box-text", function(event) {
          const text = window.jQuery(this).text();
          const tempElement = window.jQuery("<input>");
          window.jQuery("body").append(tempElement);
          tempElement.val(text).select();
          document.execCommand("Copy");
          tempElement.remove();
          console.log("Copied coupon: " + text);
          
          const tooltipOne = window.jQuery(this).closest('.custom-tooltip').find(".tooltiptext");
          tooltipOne.css({"visibility":"visible","opacity":"1"});
          setTimeout(function() {
            tooltipOne.css({"visibility":"hidden","opacity":"0"});
          }, 800);
        });
      }
    }
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


  addToCart(therapy) {
    const { currency } = this.props
    this.props.addToCart({ therapy, new_quantity: 1 }, currency)
    this.props.openCartModal()
  }

  closeCartModal() {
    this.props.closeCartModal()
  }

  addToCartShort(therapyId) {
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
        page='womens_day'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        addToCart={this.addToCart}
        currency={currency}>
        <div className='container-fluid womensday-page'>
          <div className='container page-container'>
            <div className='row promo-header d-flex align-items-center'>
              <div className='col-12 col-md-6'>
                <img className='top-image img-fluid image-promo' src={language.womens_day.data.mainImage.value} />
              </div>
              <div className='col-12 col-md-6 d-flex align-items-center'>
                <div className='promo-content' dangerouslySetInnerHTML={{
                    __html: language.womens_day.data.mainContent.value,
                  }}>
                </div>
              </div>
            </div>
            <div className="row timer-row">
              <div id="timer" className="col-12 promo-page-timer d-flex align-items-center flex-column align-content-center justify-content-center order-2 order-md-1 white color-white">
              {/* Only render the conditional content on the client side */}
              {this.state.isClient ? (
                this.state.countdownComplete ? 
                  language.womens_day.data.offerEnded?.value
                : 
                  <React.Fragment>
                    <h3 class="mb-3">{language.womens_day.data.titleCountdown?.value}</h3>
                    <Timer id="what" deadline={this.setDate} lang={lang} />
                  </React.Fragment>
              ) : (
                // Render a placeholder during server-side rendering
                <div style={{ minHeight: '100px' }}></div>
              )}
              </div>
            </div>
            <div className='row mb-1 mt-5 d-flex align-items-center justify-content-center'>
              <div className='col-6 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-1'>
                  <div className="overlay-bf" style={this.state.myStyle}>
                        <div className="d-flex justify-content-center align-items-center h-100">
                          <div className="timer-sale-content"><div className="timer-bf-content-title">{language.womens_day.data.offerEnded?.value}</div></div>
                        </div>
                  </div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/amber.png' />
                    <div className='coupon-box-header' dangerouslySetInnerHTML={{
                      __html: language.womens_day.data.coupon1header.value,
                    }}>
                    </div>
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.womens_day.data.coupon1.value }}></div>
                  </div>
                </div>
              </div>
              <div className='col-6 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-2'>
                  <div className="overlay-bf" style={this.state.myStyle}>
                        <div className="d-flex justify-content-center align-items-center h-100">
                          <div className="timer-sale-content"><div className="timer-bf-content-title">{language.womens_day.data.offerEnded?.value}</div></div>
                        </div>
                  </div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/bomb.png' />
                    <div className='coupon-box-header' dangerouslySetInnerHTML={{
                      __html: language.womens_day.data.coupon2header.value,
                    }}>
                    </div>
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.womens_day.data.coupon2.value }}></div>
                  </div>
                </div>
              </div>
              <div className='col-6 col-md-4 mb-5'>
                <div className='special-coupon-box coupon-box-3'>
                  <div className="overlay-bf" style={this.state.myStyle}>
                        <div className="d-flex justify-content-center align-items-center h-100">
                          <div className="timer-sale-content"><div className="timer-bf-content-title">{language.womens_day.data.offerEnded?.value}</div></div>
                        </div>
                  </div>
                  <div className='coupon-box-content'>
                    <img src='/static/images/15-discount.png' />
                    <div className='coupon-box-header' dangerouslySetInnerHTML={{
                      __html: language.womens_day.data.coupon3header.value,
                    }}>
                    </div>
                    <div className='coupon-box-code' dangerouslySetInnerHTML={{ __html: language.womens_day.data.coupon3.value }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='container therapies-wrap'>
              <div className='row'>
                <div className='mb-3 mt-3 col-12'><h2 dangerouslySetInnerHTML={{__html: language.womens_day.data.pageFooterTitle.value}}></h2></div>
              </div>
            <div className='row justify-content-center'>
              {categories.map(this.renderSingleTherapy)}
            </div>
            <div className='home-border'></div>
          </div>
        </div>
        {/* Coupon click functionality is now handled in componentDidMount */}
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

WomensDayPage.getInitialProps = async function (context) {
  const data = await getInitConfig({
    context,
    link: `${ROOT_URL}/lang/langconfig`,
  })

  // Calculate countdown state in getInitialProps to ensure consistent server/client rendering
  const targetDate = "March, 17, 2025"
  const currentDate = new Date()
  const futureDate = new Date(targetDate)
  const countdownComplete = futureDate.getTime() <= currentDate.getTime()

  return {
    ...data,
    countdownComplete
  }
}

const mapDispatchToProps = dispatch => {
  return {
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WomensDayPage)
