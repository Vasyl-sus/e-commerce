import React from "react";

import ReviewModal from './review_modal';
import ProductDropdown from "./product-dropdown";
import ProductRadio from "./product-radio";

class ProductInfoWrap extends React.Component {
  constructor(props) {
    super(props);
    const { therapies } = this.props;

    this.state = {
      openedUrl: null,
      isOpen: false,
      isReviewOpen: false,
      selectedTherapy: therapies && therapies.length > 0 && therapies[0] || {},
    };

    this.renderProductDropdown = this.renderProductDropdown.bind(this)
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { therapies, selectedKind } = this.props;
    const { selectedTherapy } = this.state;
    const v = selectedKind;
    if (v !== prevProps.selectedKind) {
      if (v && !(selectedTherapy?.name?.toLowerCase()?.includes(v.toLowerCase()))) {
        const therapy = therapies.find(it => it.name?.toLowerCase()?.includes(v.toLowerCase()));
        this.setState({
          ...this.state,
          selectedTherapy: therapy,
        });
      }
    }
  }

  onScrollEvent = (event) => {
    if (this.myRef.current) {
      let bounding = this.myRef.current.getBoundingClientRect();
      if (bounding.top <= -50) {
        this.props.changeClass("visible");
      } else {
        this.props.changeClass("");
      }
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

  renderProductDropdown() {
    const { fixed, therapies, selectedKind, options, language, mlang } = this.props
    var th = therapies?.filter(f => {
      if (!selectedKind) {
        return f.id != this.state.selectedTherapy.id;
      } else {
        return f.id != this.state.selectedTherapy.id && f.name?.toLowerCase()?.includes(selectedKind?.toLowerCase());
      }
    }) || {}

    return (
      <>
        <ProductDropdown
          isOpen={this.state.isOpen}
          currency={this.props.currency}
          selectedTherapy={this.state.selectedTherapy}
          options={options}
          th={th}
          fixed={fixed}
          openTDropdown={this.openTDropdown}
          pickTherapy={this.pickTherapy}
        />
      </>
    )
  }

  renderProductRadio() {
    const { therapies, selectedKind, options, mlang } = this.props
    var th = therapies?.filter(f => {
      if (!selectedKind) {
        return f.id != this.state.selectedTherapy.id;
      } else {
        return f.id != this.state.selectedTherapy.id && f.name?.toLowerCase()?.includes(selectedKind?.toLowerCase());
      }
    }) || {}

    return (
      <>
        <ProductRadio
          options={options}
          selectedOption={selectedKind}
          onChange={this.props.handleSelectKind}
          language={mlang}
        />
      </>
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
    var c = categories?.find(cc => {
      return cc.name == category
    })
    let product_image = language?.data.ppppimg1 && language.data.ppppimg1.value || language?.data.ppppimg2 && language.data.ppppimg2.value || language?.data.ppppimg3 && language.data.ppppimg3.value
    let product_image_alt = language?.data.ppppimg1alt && language.data.ppppimg1alt.value || language?.data.ppppimg2alt && language.data.ppppimg2alt.value || language?.data.ppppimg3alt && language.data.ppppimg3alt.value

    return (
      <div className="container product-info-wrap">
        <h1>{language?.data.pph1.value}</h1>
        <div style={{backgroundImage: `url(${c && c.pattern_image && c.pattern_image.link})`}} className="row blue-row">
          <div className="col-md-4">
            <p className="title">{language?.data.ppt1.value}</p>
            <div className="border"></div>
            <p className="description">{language?.data.ppt2.value}</p>
          </div>
          <div className="col-md-8">
            <img alt={language?.data.altppprtimg.value} className="product-image" src={language?.data.ppprtimg.value} />
          </div>
        </div>
        <div className="row product-info-left">
          <div className="col-md-4 pl-md-0 text">
            <p className="p-title">{language?.data.ppt3.value}</p>
            <div dangerouslySetInnerHTML={{__html: language?.data.left_ul.value}}></div>
          </div>
          <div className="col-md-8 l-p-i">
            <div className="row">
              <div className="col-md-12">
                <img alt={product_image_alt} className="w-100" src={product_image} />
              </div>
            </div>
            <div className="cart-row-w"> 
            
            <div className="cart-row-inner">
              {this.renderProductRadio()}
              <div className="d-flex justify-content-between flex-column flex-lg-row">
                <div className="cart-row-block cart-row-dropdown">
                  {this.renderProductDropdown()}
                </div>
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
                    <p className="title-i">{language?.data.ppkv.value}</p>
                    <p className="description">{language?.data.pptc.value}</p>
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
            <div className="border"></div>
            <div className="row product-icons-wrap">
              <div className="col-md-6">
                <div className="d-flex align-items-center">

                  <img alt="image" className="product-icon-1" src={category == 'caviar' ? mlang?.data?.adv1imagegold?.value : mlang?.data?.adv1imagedark?.value}  />
                  <div>
                    <p className="main">{mlang.data.adv1title.value}</p>
                    <p dangerouslySetInnerHTML={{__html: mlang.data.adv1text.value}} className="not-main"></p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <img alt="image" className="product-icon-2" src={category == 'caviar' ? mlang?.data?.adv3imagegold?.value : mlang?.data?.adv3imagedark?.value} />
                  <div>
                    <p className="main">{mlang.data.adv3title.value}</p>
                    <p dangerouslySetInnerHTML={{__html: mlang.data.adv3text.value}} className="not-main"></p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row product-icons-wrap second">
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <img alt="image" className="product-icon-3" src={category == 'caviar' ? mlang?.data?.adv2imagegold?.value : mlang?.data?.adv2imagedark?.value} />
                  <div>
                    <p className="main">{mlang.data.adv2title.value}</p>
                    <p dangerouslySetInnerHTML={{__html: mlang.data.adv2text.value}} className="not-main"></p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <img alt="image" className="product-icon-4" src={category == 'caviar' ? mlang?.data?.adv4imagegold?.value : mlang?.data?.adv4imagedark?.value} />
                  <div>
                    <p className="main">{mlang.data.adv4title.value}</p>
                    <p dangerouslySetInnerHTML={{__html: mlang.data.adv4text.value}} className="not-main"></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ReviewModal
          enableSendMessage={enableSendMessage}
          verifyCallback={this.verifyCallback}
          lang={lang}
          reviewStatus={reviewStatus}
          submitReview={this.submitReview}
          isOpen={isReviewOpen}
          language={mlang}
          closeModal={this.closeReviewModal}
        />
      </div>
    );
  }
}

ProductInfoWrap.propTypes = {

};

export default ProductInfoWrap;
