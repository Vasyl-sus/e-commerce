import React from "react";
import AliceCarousel from 'react-alice-carousel';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

class AccessoryInfoWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openedUrl: null,
      isOpen: false,
      photoIndex: 0,
      isOpenImage: false,
      selectedTherapy: this.props.accessory.options[0] || {}
    };

    this.openTDropdown = this.openTDropdown.bind(this)
    this.addToCart = this.addToCart.bind(this)
  }

  componentDidMount(){

  };

  openTDropdown() {
    this.setState({isOpen: !this.state.isOpen})
  }

  pickTherapy = (row) => () => {
    this.setState({selectedTherapy: row, isOpen: false})
  }

  addToCart() {
    if (Object.keys(this.state.selectedTherapy).length > 0) {
      this.props.addToCart(this.props.accessory, this.state.selectedTherapy)
    }
  }

  renderProductDropdown() {
    const { accessory, fixed } = this.props
    return (
      <div>
        <div onClick={this.openTDropdown} className="th-price-w pointer">
          <p className="main-t">{this.state.selectedTherapy.name}</p>
          <div className="border"></div>
          <div className="d-flex align-items-center main-p justify-content-around">
            <p className="precrtano">{(accessory.regular_price).toFixed(fixed)} {this.props.currency.symbol}</p>
            <p className="cena">{accessory.reduced_price.toFixed(fixed)} {this.props.currency.symbol}</p>
          </div>
        </div>
        <div className={`dropdown-t ${this.state.isOpen ? '' : 'd-none'}`}>
          {accessory.options.map((t, index) => {
            return (
              <div key={index} onClick={this.pickTherapy(t)} className="th-price-w pointer">
                <p className="main-t">{t.name}</p>
                <div className="border"></div>
                <div className="d-flex align-items-center main-p justify-content-around">
                  <p className="precrtano">{accessory.regular_price.toFixed(fixed)} {this.props.currency.symbol}</p>
                  <p className="cena">{accessory.reduced_price.toFixed(fixed)} {this.props.currency.symbol}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  renderSingleOkvir = (row, index) => {
    let selected = false;

    if (this.state.selectedTherapy.id === row.id) {
      selected = true
    }
    return (
      <div key={index} onClick={this.pickTherapy(row)} className={`okvircek ${selected && 'active'} pointer`}>
        {row.name}
      </div>
    )
  }

  handleOnDragStart = (e) => {
    e.preventDefault();
  }

  openImage = (index) => () => {
    this.setState({isOpenImage: true, photoIndex: index})
  }

  renderSingleGImage = (image, index) => {
    return (
      <img onClick={this.openImage(index)} className="gallery-image pointer" key={index} src={image.link} alt="gallery image" />
    )
  }

  render() {
    const { language, accessory, fixed } = this.props;
    const { photoIndex, isOpenImage, selectedTherapy } = this.state
    var reducedPercentage = parseInt(((accessory.regular_price.toFixed(fixed) - accessory.reduced_price.toFixed(fixed)) / accessory.regular_price.toFixed(fixed)) * 100);

    return (
      <div className="container accessory-top-wrap mb-5">
        <h1 className="main-page-title">{accessory.name}</h1>
        <div className="border blog-border"></div>
        <div className="row">
          <div className="col-md-6">
            <img className="w-100" src={selectedTherapy.profile_image && selectedTherapy.profile_image.link || accessory.profile_image.link} />
            <div className="row">
              <AliceCarousel
                mouseDragEnabled
                buttonsDisabled={true}
                autoPlayInterval={2500}
                responsive={{
                  5: { items: 5 }
                }}
                slideToIndex={this.state.currentIndex}
                dotsDisabled={true}
              >
                {accessory.images.map(this.renderSingleGImage)}
              </AliceCarousel>
            </div>
          </div>
          <div className="col-md-6 align-self-center">
            <div className="accessory-description mb-5" dangerouslySetInnerHTML={{__html: accessory.long_description}}>
            </div>
            <div className="ac-price-wrap">
              <del>{(accessory.regular_price).toFixed(fixed)} {this.props.currency.symbol}</del>
              <strong className="cena">{accessory.reduced_price.toFixed(fixed)} {this.props.currency.symbol}</strong>
              <div className="perc">- {reducedPercentage} %</div>
            </div>
            <div className="accessory-cart-box">
              <div className={`cart-row-inner`}>
                <div className="ovircek-wrap d-flex flex-lg-row">
                  {accessory.options.length > 1 && accessory.options.map(this.renderSingleOkvir)
                  }
                  {accessory.options.length === 0 &&
                    <p className="accessory-description">
                      {language.accessories_page.data.pptocac1.value}
                    </p>
                  }
                </div>
              </div>
              <div className="cart-row-block">
                {accessory.options.length > 0 && <button onClick={this.addToCart} className="btn btn-primary btn-cart-big">
                  <img alt="image" className="cart-image" src="/static/images/add-to-cart.svg" />
                  {language.main.data.addtocart.value}
                </button> }
              </div>
            </div>
          </div>
        </div>
        {isOpenImage && (
          <Lightbox
            slides={accessory.images.map(image => ({ src: image.link }))}
            currentIndex={photoIndex}
            close={() => this.setState({ isOpenImage: false })}
            onPrev={() => this.setState({ photoIndex: (photoIndex + accessory.images.length - 1) % accessory.images.length })}
            onNext={() => this.setState({ photoIndex: (photoIndex + 1) % accessory.images.length })}
          />
        )}
      </div>
    );
  }
}

AccessoryInfoWrap.propTypes = {

};

export default AccessoryInfoWrap;