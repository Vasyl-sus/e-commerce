import React from "react";
import ModalVideo from 'react-modal-video'

class ProductPromoWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openedUrl: null,
      isOpen: false,
      toggled: false
    };
  }

  componentDidMount(){

  };


  render() {
    const { language, therapies, categories } = this.props;
    const { toggled } = this.state;

    var category = therapies && therapies[0] && therapies[0].category
    var c = categories.find(cc => {
      return cc.name == category
    })
    return (
      <div className="container product-promo-wrap">
        <div className="row blue-row" style={{backgroundImage: `url(${language?.data?.promobg?.value})`}}>
          <div className="col-12 col-md-6">
            <img src={`${language?.data?.promoimg?.value}`} className="d-flex align-items-center" />
          </div>
          <div className="col-12-col-md-6">
            <img src={`${language?.data?.promoimgtxt?.value}`} className="d-flex align-items-center" />
          </div>
        </div>
      </div>
    );
  }
}

ProductPromoWrap.propTypes = {

};

export default ProductPromoWrap;
