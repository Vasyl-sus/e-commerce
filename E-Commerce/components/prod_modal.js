import React, {Component} from 'react';
import Modal from "react-modal";
import { reduxForm } from 'redux-form';
import {compose} from 'redux';

class NewGift extends Component {
  constructor(props) {
    super(props)
  }

  finish(obj) {
    this.props.redirect('/checkout')
  }

  renderRow(row, index){
    return(
      <div className="col-md-4" key={index}>
        <h5 className="no-bottom-top font-weight-bold">{row.name}</h5>
        <p className="gray-text-medium small-width-text">{row.view_label}</p>
        <p className="line-through no-margin">{(row.total_price*2).toFixed(2)} €</p>
        <p className="pink-bold no-margin">{row.total_price.toFixed(2)} €</p>

        <div className="img-wraper">
          <img alt="image" className="product-wraper-image" src={row.display_image && row.display_image.link} />
        </div>
        <div className="margin-bottom-small">
          <img alt="image" className="str-image" src="/static/images/down-arrow.svg" alt="down arrow" />
        </div>
        <button className="btn btn-primary pink-button">NAROČI</button>
      </div>
    )
  }

  closeModal() {
    this.props.closeNewModal();
  }

  render() {
    const { therapies } = this.props;

    return (
      <Modal isOpen={this.props.newModal} onRequestClose={this.closeModal.bind(this)} className="react-modal-style" overlayClassName="react-modal-overlay" ariaHideApp={false} >
        <div className="modal-header-gray text-center">
          <i className="fa fa-check" aria-hidden="true"></i><br/>
          <h3 className="text-center">USPEŠNO STE DODALI PRODUKT V KOŠARICO</h3>
        </div>
        <div className="modal-container">
          <div className="row center">
            {therapies && therapies.map(this.renderRow.bind(this))}
          </div>
        </div>
        <div className="modal-footer-pink text-center">
          <button className="btn btn-primary new-btn-to-order" onClick={this.finish.bind(this)}>ZAKLJUČI NAKUP</button>
        </div>

      </Modal>
    );
  }
}

export default compose(
  reduxForm({
    form: 'NewCountryForm',
    enableReinitialize: true,
  })
)(NewGift);
