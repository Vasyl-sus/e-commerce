import React, {Component} from 'react';
import Modal from 'react-modal';
import {connect} from 'react-redux';
import moment from 'moment';

const otherModalStyles = {
  content : {
    display               : 'block',
    top                   : '10%',
    left                  : '20%',
    right                 : '20%',
    bottom                : '10%',
    opacity               : 1,
    overflow 			        : 'auto',
    boxShadow             : '0px 0px 28px 10px #333'
  }
};

class ProductHistory extends Component {
	constructor(props) {
		super(props)

		this.state = {}
	}

  closeModal()
  {
    this.props.closeHistoryModal();
  }

  renderStockChanges(stockchange, index) {
    return (
      <tr key={index}>
        <td>{stockchange.product_name}</td>
        <td>{Moment (stockchange.date).format("DD. MM. YYYY")}</td>
        <td className="center">{stockchange.value}</td>
        <td>{stockchange.admin_full_name ? stockchange.admin_full_name : ""}</td>
        <td>{stockchange.comment ? stockchange.comment : ""}</td>
      </tr>
    )
  }

	render() {
    const { stockchanges } = this.props;

		return (
			<Modal
      isOpen={this.props.historyModal}
      ariaHideApp={false}
      contentLabel="new-customer-prof Modal"
      onRequestClose={this.closeModal.bind(this)}
      style={otherModalStyles}>
        <div className="pointer text-right"><i onClick={this.closeModal.bind(this)} className="fas fa-times"/></div>
        <header className={`confirm_box clearfix`}>
          <h2 className="center mb-4">Zgodovina produkta</h2>
        </header>
        <table className="table table-striped">
         <thead>
           <tr>
             <th className="left table-pad-l-8">Produkt</th>
             <th className="left table-pad-l-8">Datum urejanja</th>
             <th className="center table-pad-l-8">Dodana/odstranjena količina</th>
             <th className="left table-pad-l-8">Uporabnik</th>
             <th className="left table-pad-l-8">Opomba</th>
           </tr>
         </thead>
         <tbody>
           {stockchanges.map(this.renderStockChanges.bind(this))}
         </tbody>
        </table>
      </Modal>
		);
	}
}


function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    stockchanges: nextState.products_data.stockchanges
  }
}

export default connect(mapStateToProps, null) (ProductHistory);
