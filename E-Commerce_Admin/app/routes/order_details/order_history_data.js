import React, {Component} from 'react';
import Modal from 'react-modal';
import Switch from 'react-switch';


class OrderHistoryData extends Component {
	constructor(props) {
		super(props)

		this.state = {
    }

	}

  closeModal()
  {
		this.props.closeOrderHistoryModal();
	}

  renderSingleRow(data, index)
  {
    var obj = this.props.orderDetailsData[data]
    if(data == "therapies") {
      return (
        <tr key={index}>
          <td>{data} : {this.props.orderDetailsData.therapies.length}</td>
        </tr>
      )
    }
    if(data == 'isGift' || data == 'isCardGift' || data == 'isPerfumeGift')
    {
      return (
        <tr key={index}>
          <td><p className="header_align flag_icon_dashboard-flag">{data}:</p> <Switch checked={obj} className="form-white flag_icon_dashboard-flag" /></td>
        </tr>
      )
    }
    if(data == 'ip')
    {
      return (
        <tr className="hide_order_history_details" key={index}>
        </tr>
      )
    }
    else {
      return (
        <tr key={index}>
          <td>{data} : {obj}</td>
        </tr>
      )
    }
  }

	render() {

		return (
      <Modal
      isOpen={this.props.orderHistoryModal}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}>
        <header className={`confirm_box clearfix`}>
          <h2 className="align-center">Zgodovina - {this.props.orderHistoryID}</h2>
        </header>
        <div className={`modal-body col-lg-12`}>
          <div className="row table-responsive no-padding">
            <table className="table table-striped">
              <thead>
                <tr>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.props.orderDetailsData).map(this.renderSingleRow.bind(this))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={`modal-footer col-lg-12`}>
          <button className="btn btn-primary" onClick={this.closeModal.bind(this)}>Zapri</button>
        </div>
      </Modal>
		);
	}
}

export default OrderHistoryData;
