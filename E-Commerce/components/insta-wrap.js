import React from "react";
import PropTypes from "prop-types";
import Link from 'next/link'
import Modal from 'react-modal';

import {ROOT_URL} from "../constants/constants"

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : '80%',
    maxHeight             : '80%'
  }
};

const initIg = {
  products: [],
  accessories: []
}

class InstaWrap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: false,
      thisIg: initIg
    };

    this.renderSingleIg = this.renderSingleIg.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.renderSingleAcc = this.renderSingleAcc.bind(this)
    this.renderSingleProduct= this.renderSingleProduct.bind(this)
  }

  componentDidMount(){

  };

  closeModal() {
    this.setState({modalIsOpen: false, thisIg: initIg})
  }

  openIgModal = (row) => () => {
    this.setState({modalIsOpen: true, thisIg: row})
  }

  addToCart = (id) => () => {
    this.props.addToCart(id)
  }


  renderSingleIg(row, index) {
    return (
      <div key={index} onClick={this.openIgModal(row)} className="pointer col-6 col-md-3 col-lg-2 insta-item">
        <img className="insta-b-image" alt="img" src={row.smallImage && row.smallImage.link} />
      </div>
    )
  }

  renderSingleProduct(row, index) {
    return (
      <div key={index} className="col-6 col-md-4 ig-product">
        <div className="ig-image mx-auto" alt="img"  style={{backgroundImage: `url(${row.profile_image && row.profile_image.link})`}}></div>
        <p className="black"><strong>{row.display_name}</strong></p>
        <div className="t-b-wrp">
        <Link href={`/product-page`} as={`/${this.props.lang}-${this.props.country}/${row.link_name}`}>
          <button className={`btn btn-primary rose-cart-t-acc`}>
            {this.props.language.main.data.ppog.value}
          </button></Link>
        </div>
      </div>
    )
  }

  renderSingleAcc(row, index) {
    let image = row.images.find(i => {
      return i.profile_img === 1
    })
    return (
      <div key={index} className="col-6 col-md-4 ig-product">
        <div className="ig-image mx-auto" alt="img"  style={{backgroundImage: `url(${image && image.link})`}}></div>
        <p className="black"><strong>{row.name}</strong></p>
        <p className="black">{row.description}</p>
        <div className="t-b-wrp">
        <Link
          key={index}
          href={`/accessory-page`}
          as={`/${this.props.lang}-${this.props.country}/accessories/${row.seo_link}`}
        >
        <button className={`btn btn-primary rose-cart-t-acc`}>
            {this.props.language.main.data.ppog.value}
          </button></Link>
        </div>
      </div>
    )
  }
  render() {
    const { language, ig_feeds=[] } = this.props;

    const { thisIg } = this.state
    return (
      <div className="container-fluid insta-wrap">
        <h2>{language.home_bottom.data.instatitle.value}</h2>
        <div className="row justify-content-center">
          {ig_feeds.map(this.renderSingleIg)}
            <div className="col-6 col-lg-2 insta-item insta-last">
              <a href="https://instagram.com/E-Commerce" target="_blank">
                <div className="insta-title-wrap h-100">
                  <p className="insta-title">{language.home_bottom.data.instadesc.value}</p>
                  <img alt="image" className="insta-image" src="/static/images/instagram-feed.svg" />
                </div>
              </a>
            </div>
        </div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles}
          ariaHideApp={false}
          contentLabel="IG View"
        >
         <img onClick={this.closeModal} className="x-img pointer" width="30" height="30" alt="image" src="/static/images/times.svg" />
          <div className="row">
            <div className="col-md-5">
              <div className="insta-in-image">
                <img className="insta-full-img" alt="Instagram image" src={thisIg.bigImage && thisIg.bigImage.link} />
              </div>
            </div>
            <div className="col-md-7 d-flex align-items-center">
              <div className="inner-ig-products w-100">
                <div className="row pt-1">
                  {thisIg.products && thisIg.products.map(this.renderSingleProduct)}
                  {thisIg.accessories && thisIg.accessories.map(this.renderSingleAcc)}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

InstaWrap.propTypes = {
  ig_feeds: PropTypes.array.isRequired
};

export default InstaWrap;
