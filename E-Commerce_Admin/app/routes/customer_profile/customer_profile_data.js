import React, {Component} from 'react';
import Modal from 'react-modal';
import {Link} from 'react-router';
import Moment from "moment";

class CustomerProfileData extends Component {
	constructor(props) {
		super(props)

		this.state = {
    }

	}

	closeModal()
  {
		this.props.closeCustomerDataModal();
	}

  renderCustomerOrders(customer_order, index)
  {
    return(
      <tr key={index}>
        <td>{customer_order.order_id}</td>
        <td>{Moment (customer_order.date_added).format("DD.MM.YYYY")}</td>
        <td>{customer_order.order_status}</td>
        <td>{parseFloat(customer_order.total).toFixed(2)} {customer_order.currency_symbol}</td>
        <td className="ordersTable align-center"><Link target="_blank" to={{pathname: '/order_details', query: {id: customer_order.id}}}><span style={{cursor: 'pointer'}} className="glyphicon glyphicon-zoom-in"></span></Link></td>
      </tr>
    )
  }

	render() {
		return (
			<Modal
      isOpen={this.props.customerDataModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}>
        <header className={`confirm_box clearfix`}>
          <h2 className="align-center">Podrobnosti profil stranke</h2>
        </header>
        <div className={`modal-body col-lg-12`}>
          <div className="col-lg-7">
            <div>
              <h3>Informacije</h3>
            </div>
            <div className="col-lg-4">
              <label className="control-label">Ime</label>
              <p>{this.props.customer.first_name ? this.props.customer.first_name : "Ni določeno"}</p>
              <label className="control-label">Priimek</label>
              <p>{this.props.customer.last_name ? this.props.customer.last_name : "Ni določeno"}</p>
              <label className="control-label">E-pošta</label>
              <p>{this.props.customer.email ? this.props.customer.email : "Ni določeno"}</p>
              <label className="control-label">Telefon</label>
              <p>{this.props.customer.telephone ? this.props.customer.telephone : "Ni določeno"}</p>
              <label className="control-label">Rojstni datum</label>
              <p>{this.props.customer.birthdate ? Moment(this.props.customer.birthdate).format("DD.MM.YYYY") : "Ni določeno"}</p>
              <label className="control-label">Komentar</label>
              <p>{this.props.customer.comment ? this.props.customer.comment : "Ni določeno"}</p>
            </div>
            <div className="col-lg-3">
              <label className="control-label">Ocena</label>
              <p>
                <StarRatingComponent
                name="rating"
                value={this.props.customer.rating ? this.props.customer.rating : "Ni določeno"} />
              </p>
              <label className="control-label">Naslov</label>
              <p>{this.props.customer.address ? this.props.customer.address : "Ni določeno"}</p>
              <label className="control-label">Poštna številka</label>
              <p>{this.props.customer.postcode ? this.props.customer.postcode : "Ni določeno"}</p>
              <label className="control-label">Mesto</label>
              <p>{this.props.customer.city ? this.props.customer.city : "Ni določeno"}</p>
              <label className="control-label">Država</label>
              <p>{this.props.customer.country ? this.props.customer.country : "Ni določeno"}</p>
            </div>
          </div>
          <div className="col-lg-5">
            <div>
              <h3>Stara naročila</h3>
            </div>
            {this.props.customer.orders ? <div className="row table-responsive no-padding">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th className="col-lg-2">ID</th>
                    <th className="col-lg-5">Datum oddaje</th>
                    <th className="col-lg-3">Status</th>
                    <th className="col-lg-3">Skupna cena</th>
                    <th className="col-lg-1 align-center">Info</th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.customer.orders.map(this.renderCustomerOrders.bind(this))}
                </tbody>
              </table>
            </div> : "Ni naročil"}
          </div>
        </div>
        <div className={`modal-footer col-lg-12`}>
          <button className="btn btn-primary" onClick={this.closeModal.bind(this)}>Zapri</button>
        </div>
      </Modal>
		);
	}
}

export default (CustomerProfileData);
