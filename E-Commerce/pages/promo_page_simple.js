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
import { Timer } from '../components/timer.js'

class PromoPageSimple extends React.Component {
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
    this.updateCouponCount();
  }

  state = {
    countdownComplete: false,
    myStyle: {},
    couponCount: 300
  };

  updateCouponCount = () => {
    const couponCount = this.calculateCouponCount();
    this.setState({ couponCount });
    document.getElementById('orderNumber').innerText = couponCount;
  }

  calculateCouponCount = () => {
    const now = new Date();
    
    // Define the schedule
    const schedule = [
      { date: new Date('May 22, 2025 19:00:00'), count: 240 },
      { date: new Date('May 23, 2025 07:00:00'), count: 190 },
      { date: new Date('May 23, 2025 20:00:00'), count: 110 },
      { date: new Date('May 25, 2025 10:00:00'), count: 80 },
      { date: new Date('May 25, 2025 23:00:00'), count: 0 }
    ];
    
    // If before the first date, return the initial count
    if (now < schedule[0].date) {
      return 300;
    }
    
    // If after the last date, return the final count
    if (now >= schedule[schedule.length - 1].date) {
      return schedule[schedule.length - 1].count;
    }
    
    // Find the two dates that the current time falls between
    for (let i = 0; i < schedule.length - 1; i++) {
      if (now >= schedule[i].date && now < schedule[i + 1].date) {
        // Calculate the percentage of time passed between the two dates
        const totalTime = schedule[i + 1].date - schedule[i].date;
        const timePassed = now - schedule[i].date;
        const percentage = timePassed / totalTime;
        
        // Calculate the count based on linear interpolation
        const countDifference = schedule[i].count - schedule[i + 1].count;
        const decreaseAmount = Math.floor(countDifference * percentage);
        return schedule[i].count - decreaseAmount;
      }
    }
    
    // Fallback to initial count (should not reach here)
    return 300;
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

  setDate = "May, 1, 2024";

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
        page='easter'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        addToCart={this.addToCart}
        currency={currency}>
        <div className='container-fluid promo-page-simple'>
          <div className='container page-container'>
            <div className='row'>
              <div className='col-12'>
                <img
                  className='top-image img-fluid'
                  alt=''
                  src={language.promo_page_simple.data.mainImage.value}
                />
              </div>
            </div>
            <div className='row'>
              <div className='col-12'>
                <div
                  className='promo-content'
                  dangerouslySetInnerHTML={{
                    __html: language.promo_page_simple.data.mainContent.value,
                  }}></div>
                  <div  
                  className='promo-content couponCount'>
                    <p>{language.promo_page_simple.data.onlyLeft.value} <span className='number-format' id='orderNumber'>{this.state.couponCount}</span> {language.promo_page_simple.data.coupons.value}.</p>
                  </div>
                  <div
                  className='promo-content'
                  dangerouslySetInnerHTML={{
                    __html: language.promo_page_simple.data.mainContent2.value,
                  }}></div>
              </div>
            </div>
          </div>
          <div className='container therapies-wrap'>
            <div className='row justify-content-center'>
              {categories.map(this.renderSingleTherapy)}
            </div>
            {/* <div className='row'>
              <div className='col-12'>
                <div
                  className='promo-valid'
                  dangerouslySetInnerHTML={{
                    __html: language.promo_page_simple.data.validUntil.value,
                  }}></div>
              </div>
            </div> */}
            <div className='home-border'></div>
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
              
              // Update coupon count every minute to ensure smooth transitions
              setInterval(function() {
                  const calculateCouponCount = () => {
                      const now = new Date();
                      
                      // Define the schedule
                      const schedule = [
                          { date: new Date('May 22, 2025 10:00:00'), count: 299 },
                          { date: new Date('May 22, 2025 19:00:00'), count: 240 },
                          { date: new Date('May 23, 2025 07:00:00'), count: 200 },
                          { date: new Date('May 23, 2025 16:00:00'), count: 130 },
                          { date: new Date('May 25, 2025 07:00:00'), count: 45 },
                          { date: new Date('May 25, 2025 23:30:00'), count: 0 }
                      ];
                      
                      // If before the first date, return the initial count
                      if (now < schedule[0].date) {
                          return 300;
                      }
                      
                      // If after the last date, return the final count
                      if (now >= schedule[schedule.length - 1].date) {
                          return schedule[schedule.length - 1].count;
                      }
                      
                      // Find the two dates that the current time falls between
                      for (let i = 0; i < schedule.length - 1; i++) {
                          if (now >= schedule[i].date && now < schedule[i + 1].date) {
                              // Calculate the percentage of time passed between the two dates
                              const totalTime = schedule[i + 1].date - schedule[i].date;
                              const timePassed = now - schedule[i].date;
                              const percentage = timePassed / totalTime;
                              
                              // Calculate the count based on linear interpolation
                              const countDifference = schedule[i].count - schedule[i + 1].count;
                              const decreaseAmount = Math.floor(countDifference * percentage);
                              return schedule[i].count - decreaseAmount;
                          }
                      }
                      
                      // Fallback to initial count (should not reach here)
                      return 300;
                  };
                  
                  const couponCount = calculateCouponCount();
                  document.getElementById('orderNumber').innerText = couponCount;
              }, 60000); // Update every minute
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

PromoPageSimple.getInitialProps = async function (context) {
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

export default connect(mapStateToProps, mapDispatchToProps)(PromoPageSimple)
