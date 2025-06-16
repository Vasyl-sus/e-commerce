import React from "react";

import ReviewModal from './review_modal';


import { Swiper, SwiperSlide } from 'swiper/react';


import { Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-cube';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';


class ProductInfoWrapSimple extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openedUrl: null,
      isOpen: false,
      isReviewOpen: false,
      selectedTherapy: this.props.therapies[0] || {}
    };

    this.renderSingleOkvir = this.renderSingleOkvir.bind(this)
    this.openTDropdown = this.openTDropdown.bind(this)
    this.addToCart = this.addToCart.bind(this)

    this.myRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("scroll", this.onScrollEvent);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScrollEvent);
  }

  onScrollEvent = (event) => {
    let bounding = this.myRef.current.getBoundingClientRect();
    if (bounding.top <= -50) {
      this.props.changeClass("visible")
    } else {
      this.props.changeClass("")
    }
  }

  openTDropdown() {
    this.setState({isOpen: !this.state.isOpen})
  }

  pickTherapy = (row) => () => {
    this.setState({selectedTherapy: row, isOpen: false})
  }

  addToCart() {
    this.props.addToCart(this.state.selectedTherapy)
    dataLayer.push({
      'event': 'eventTracking',
      'eventCategory' : 'Product Page',
      'eventAction': 'click',
      'eventLabel': 'Main CTA - ' +this.state.selectedTherapy.name
    });
  }

  renderSingleOkvir() {
      let selected = false;
      const { fixed, therapies } = this.props
      var th = therapies.filter(f => {
        return f.id
        }) || {}


    return (
      <div className="d-flex align-items-center justify-content-between simplePick">
          {th.map((t, index) => {
            if (t.id == this.state.selectedTherapy.id) {
              selected = true;
            } else {
              selected = false;
            }
            console.log("DELAM " + JSON.stringify(t))
            let pricePerPiece = (t.total_price / t.product_quantity).toFixed(fixed)
            return (
              <div key={index} onClick={this.pickTherapy(t)} className={`simplePickFrame ${selected && 'active'} pointer`}>
                <p className="simplePickTitle">{t.name}</p>
                <p className="simplePickPrice">{t.total_price.toFixed(fixed)} {this.props.currency.symbol}</p>
                <p className="simplePickPiece">{pricePerPiece} {this.props.currency.symbol} / kos</p>
              </div>
            )
          })}
          </div>
    )
  }

  toggleReviewModal = () => {
    this.setState({isReviewOpen: !this.state.isReviewOpen})
  }

  closeReviewModal = () => {
    this.setState({isReviewOpen: false})
  }

  submitReview = (data) => {
    this.props.submitReview(data);
  }

  clickStar = () => {
    this.setState({openReviewList: true})
    this.props.getReviews();
  }

  verifyCallback = (data) => {
    this.props.verifyCallback();
  }

  render() {
    const { mlang, hlang, language, lang, categories, therapies, reviewStatus, reviewData={grade: 0, count: 0}, enableSendMessage } = this.props;
    const { isReviewOpen } = this.state
    var category = therapies && therapies[0] && therapies[0].category
    var c = categories.find(cc => {
      return cc.name == category
    })
    let product_image = language.data.ppppimg1 && language.data.ppppimg1.value || language.data.ppppimg2 && language.data.ppppimg2.value || language.data.ppppimg3 && language.data.ppppimg3.value
    let product_image_alt = language.data.ppppimg1alt && language.data.ppppimg1alt.value || language.data.ppppimg2alt && language.data.ppppimg2alt.value || language.data.ppppimg3alt && language.data.ppppimg3alt.value

    return (
      <div className="container product-info-wrap-simple">
        <div className="row">
          <div className="col-12 col-md-6 order-2 order-md-1 simple-product-top-gallery">
            <div className="simple-product-top-gallery">
              <Swiper
                slidesPerView={1.3}
                pagination={true}
                modules={[Pagination]}
                onSlideChange={() => console.log('slide change')}
                onSwiper={(swiper) => console.log(swiper)}
                >
                <SwiperSlide><img src="/static/images/slide4.jpg"/></SwiperSlide>
                <SwiperSlide><img src="/static/images/slide1.jpg"/></SwiperSlide>
                <SwiperSlide><img src="/static/images/slide2.jpg"/></SwiperSlide>
                <SwiperSlide><img src="/static/images/slide3.jpg"/></SwiperSlide>
                ...
                </Swiper>
            </div>
          </div>
          <div className="col-12 col-md-6 order-1 order-md-2 simple-product-details">
            <div className="row simple-product-headings">
              <div className="col-12">
                <h1>{language.data.pph1.value}</h1>
              </div>
              <div className="product-info-simple col-12">
                <p className="p-title">{language.data.ppt3.value}</p>
                <div dangerouslySetInnerHTML={{__html: language.data.left_ul.value}}></div>
              </div>
            <div className="col-md-12 l-p-i">
              <div className="cart-row-w">
                <div className="cart-row-inner">
                    {this.renderSingleOkvir()}
                  <div className="cart-row-block">
                  <button ref={this.myRef} onClick={this.addToCart} className="btn btn-primary btn-cart-big">
                    <img alt="image" className="cart-image" src="/static/images/add-to-cart.svg" />
                    {mlang.data.addtocart.value}
                  </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-6">
                <div className="contact-wrap d-flex align-items-center justify-content-center justify-content-md-start">
                  <div className="contact-img">
                    <img alt={hlang.data.telnumimgalt.value} className="contact-image" src={hlang.data.telnumimg.value} />
                  </div>
                  <div className="contact-data">
                    <p className="title-i">{language.data.ppkv.value}</p>
                    <p className="description">{language.data.pptc.value}</p>
                    <a href={`tel: ${hlang.data.telnum.value}`} className="title-i n">{hlang.data.telnum.value}</a>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="lux-customers d-flex flex-column align-items-center justify-content-center justify-content-md-start">
                <img src="/static/images/five-stars.svg" className="img-fluid five-stars" />
                {mlang && mlang.data && mlang.data.totalCustomers && mlang.data.totalCustomers.value}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        <ReviewModal enableSendMessage={enableSendMessage} verifyCallback={this.verifyCallback} lang={lang} reviewStatus={reviewStatus} submitReview={this.submitReview} isOpen={isReviewOpen} language={mlang} closeModal={this.closeReviewModal} />
      </div>
    );
  }
}

ProductInfoWrapSimple.propTypes = {

};

export default ProductInfoWrapSimple;
