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

class BlackFridayPage extends React.Component {
  constructor(props) {
    super(props)

    this.renderSingleTherapy = this.renderSingleTherapy.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.closeCartModal = this.closeCartModal.bind(this)
  }

  setDate = "December, 02, 2024";

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
        page='black_friday'
        routes={routes}
        langConfig={langConfig}
        language={language}
        lang={lang}
        country={country}
        addToCart={this.addToCart}
        currency={currency}>
        <div className="bf-header">
            <div className="container">
              <div className="row d-flex align-items-center">
                <img
                  className='img-bf-header'
                  alt='Black Friday'
                  src='/static/images/black-friday.png'
                />
              </div>
              <div className="row timer-row bf-timer">
                <div id="timer" className="col-12 bf-timer d-flex align-items-center flex-column align-content-center justify-content-center order-2 order-md-1 white color-white">
                {this.state.countdownComplete ? language.main.data.endedSale?.value 
                  : 
                  <React.Fragment>
                    <h3>{language.black_friday.data.titleCountdown?.value}</h3>
                    <Timer id="what" deadline={this.setDate} lang={lang} />
                  </React.Fragment>}
                </div>
              </div>
            </div>
        </div>
        <div className="container-fluid bg-black text-light text-center bf-content">
          <div className='container'>
            <div className="row">
              <div className="col-12 bf-content-subtitle">
                <h1 className="bf-heading" dangerouslySetInnerHTML={{__html: language.black_friday.data.blackFridayTextTitle1.value}}></h1>
                <p className="bf-main-content" dangerouslySetInnerHTML={{__html: language.black_friday.data.blackFridayText1.value}}></p>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row black-friday-sale-title color-4d">
                <div className="col-12">
                    <h2>4D HYALURON</h2>
                    <p dangerouslySetInnerHTML={{__html: language.black_friday.data.blackFriday4Dtext?.value}}></p>
                </div>
              </div>
            <div className="row black-friday-bundles color-4d">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offer4dpercent1?.value}
                    </div>
                    <img src="/static/images/4d-double.png" alt="4D HYALURON Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">1x<br/><span>4D HYALURON</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offer4dregular1?.value}</span><span className="bundle-new-price">{language.black_friday.data.offer4dnew1?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offer4dsave1?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offer4d1.value)}
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
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offer4dpercent2?.value}
                    </div>
                    <img src="/static/images/4d-double.png" alt="4D HYALURON Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x<br/><span>4D HYALURON</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offer4dregular2?.value}</span><span className="bundle-new-price">{language.black_friday.data.offer4dnew2?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offer4dsave2?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offer4d2.value)}
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
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offer4dpercent3?.value}
                    </div>
                    <img src="/static/images/4d-double.png" alt="4D HYALURON Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">3x<br/><span>4D HYALURON</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offer4dregular3?.value}</span><span className="bundle-new-price">{language.black_friday.data.offer4dnew3?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offer4dsave3?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offer4d3.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row more-about">
              <div className="col-12">
                  <p dangerouslySetInnerHTML={{__html: language.black_friday.data.moreAboutProducts?.value}}></p>
                  <p><span dangerouslySetInnerHTML={{__html: language.black_friday.data.moreAbout4D?.value}}></span></p>
                </div>
              </div>
          </div>
          <div className="container">
            <div className="row black-friday-sale-title color-eyelash">
                <div className="col-12">
                    <h2>EYELASH</h2>
                    <p dangerouslySetInnerHTML={{__html: language.black_friday.data.blackFridayLashtext?.value}}></p>
                </div>
              </div>
            <div className="row black-friday-bundles color-eyelash">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offerlashpercent1?.value}
                    </div>
                    <img src="/static/images/eyelash-double.png" alt="EYELASH Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">1x<br/><span>EYELASH</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offerlashregular1?.value}</span><span className="bundle-new-price">{language.black_friday.data.offerlashnew1?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offerlashsave1?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offerlash1.value)}
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
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offerlashpercent2?.value}
                    </div>
                    <img src="/static/images/eyelash-double.png" alt="EYELASH Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x<br/><span>EYELASH</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offerlashregular2?.value}</span><span className="bundle-new-price">{language.black_friday.data.offerlashnew2?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offerlashsave2?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offerlash2.value)}
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
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offerlashpercent3?.value}
                    </div>
                    <img src="/static/images/eyelash-double.png" alt="EYELASH Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">3x<br/><span>EYELASH</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offerlashregular3?.value}</span><span className="bundle-new-price">{language.black_friday.data.offerlashnew3?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offerlashsave3?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offerlash3.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row more-about">
              <div className="col-12">
                  <p dangerouslySetInnerHTML={{__html: language.black_friday.data.moreAboutProducts?.value}}></p>
                  <p><span dangerouslySetInnerHTML={{__html: language.black_friday.data.moreAboutEyelash?.value}}></span></p>
                </div>
              </div>
          </div>
          <div className="container">
            <div className="row black-friday-sale-title color-procollagen">
              <div className="col-12">
                  <h2>PROCOLLAGEN</h2>
                  <p dangerouslySetInnerHTML={{__html: language.black_friday.data.blackFridayPCtext?.value}}></p>
              </div>
            </div>
            <div className="row black-friday-bundles color-procollagen">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offerpcpercent1?.value}
                    </div>
                    <img src="/static/images/procollagen-double.png" alt="PROCOLLAGEN Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">1x<br/><span>PROCOLLAGEN</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offerpcregular1?.value}</span><span className="bundle-new-price">{language.black_friday.data.offerpcnew1?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offerpcsave1?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offerpc1.value)}
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
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offerpcpercent2?.value}
                    </div>
                    <img src="/static/images/procollagen-double.png" alt="PROCOLLAGEN Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x<br/><span>PROCOLLAGEN</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offerpcregular2?.value}</span><span className="bundle-new-price">{language.black_friday.data.offerpcnew2?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offerpcsave2?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offerpc2.value)}
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
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offerpcpercent3?.value}
                    </div>
                    <img src="/static/images/procollagen-double.png" alt="PROCOLLAGEN Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">3x<br/><span>PROCOLLAGEN</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offerpcregular3?.value}</span><span className="bundle-new-price">{language.black_friday.data.offerpcnew3?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offerpcsave3?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offerpc3.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row more-about">
              <div className="col-12">
                  <p dangerouslySetInnerHTML={{__html: language.black_friday.data.moreAboutProducts?.value}}></p>
                  <p><span dangerouslySetInnerHTML={{__html: language.black_friday.data.moreAboutProcollagen?.value}}></span></p>
                </div>
              </div>
          </div>
          <div className="container">
            <div className="row black-friday-sale-title color-bundle4dpc">
                <div className="col-12">
                    <h2>4D HYALURON + PROCOLLAGEN</h2>
                    <p dangerouslySetInnerHTML={{__html: language.black_friday.data.blackFriday4DCtext?.value}}></p>
                </div>
              </div>
            <div className="row black-friday-bundles color-bundle4dpc">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="bf-bundle-box">
                <div className="overlay-bf" style={this.state.myStyle}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offer4dcpercent1?.value}
                    </div>
                    <img src="/static/images/bf-bundle-4d-hyaluron-procollagen.png" alt="4D CAVIAR Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">1x<br/><span>4D HYALURON + PROCOLLAGEN</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offer4dcregular1?.value}</span><span className="bundle-new-price">{language.black_friday.data.offer4dcnew1?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offer4dcsave1?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offer4dc1.value)}
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
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offer4dcpercent2?.value}
                    </div>
                    <img src="/static/images/bf-bundle-4d-hyaluron-procollagen.png" alt="4D CAVIAR Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">2x<br/><span>4D HYALURON + PROCOLLAGEN</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offer4dcregular2?.value}</span><span className="bundle-new-price">{language.black_friday.data.offer4dcnew2?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offer4dcsave2?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offer4dc2.value)}
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
                        <div className="timer-bf-content"><div className="timer-bf-content-title">Black Friday has ended.</div></div>
                      </div>
                  </div>
                  <div className="bf-bundle-image-box">
                    <div className="bf-bundle-percent">
                      - {language.black_friday.data.offer4dcpercent3?.value}
                    </div>
                    <img src="/static/images/bf-bundle-4d-hyaluron-procollagen.png" alt="4D CAVIAR Black Friday bundle" />
                  </div>
                  <div className="bf-bundle-content-box">
                    <div className="bundle-title">3x<br/><span>4D HYALURON + PROCOLLAGEN</span></div>
                    <div className="bundle-price"><span className="bundle-regular-price">{language.black_friday.data.offer4dcregular3?.value}</span><span className="bundle-new-price">{language.black_friday.data.offer4dcnew3?.value}</span></div>
                    <div className="bundle-save">{language.black_friday.data.youSave?.value} {language.black_friday.data.offer4dcsave3?.value}</div>
                    <button
                      onClick={() => this.addToCartShort(language.black_friday.data.offer4dc3.value)}
                      className='btn btn-bf-add-to-cart'>
                      {language.main.data.addtocart.value}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row more-about">
              <div className="col-12">
                  <p dangerouslySetInnerHTML={{__html: language.black_friday.data.moreAboutProducts?.value}}></p>
                  <p><span dangerouslySetInnerHTML={{__html: language.black_friday.data.moreAbout4D?.value}}></span> | <span dangerouslySetInnerHTML={{__html: language.black_friday.data.moreAboutProcollagen?.value}}></span></p>
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




BlackFridayPage.getInitialProps = async function (context) {
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

export default connect(mapStateToProps, mapDispatchToProps)(BlackFridayPage)
