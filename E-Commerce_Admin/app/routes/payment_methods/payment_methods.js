import React, {Component} from 'react';
import Switch from 'react-switch'
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {getPaymentMethods, createPaymentMethod, setInitialValuesPaymentMethod, editPaymentMethod, deletePaymentMethod} from '../../actions/payment_methods_actions';
import {connect} from 'react-redux';
import {getAllLanguages} from '../../actions/languages_actions';
import NewPaymentMethod from './new_payment_method.js';
import EditPaymentMethod from './edit_payment_method.js';

class PaymentMethods extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:15, editModalPicture:false,
      preview:null, image:[], picture_link:null, paymentmethod_id:null, picture_id:null, selectedPayment: null};
    }

    componentDidMount()
    {
      var location = browserHistory.getCurrentLocation();

      if(location.query.pageLimit)
        this.setState({pageLimit: location.query.pageLimit});
      else
        location.query.pageLimit = 15;

      if(location.query.pageNumber)
        this.setState({pageNumber: location.query.pageNumber});
      else
        location.query.pageNumber = 1;

      browserHistory.replace(location);
      this.props.getPaymentMethods();
      this.props.getAllLanguages();
    };

    resetPageNumber(location){
      location.query.pageNumber = 1;
      this.setState({pageNumber:1});
      return location;
    }

    pageChange(pageNumber) {
      let location = browserHistory.getCurrentLocation();
      location.query.pageNumber = pageNumber;
      browserHistory.replace(location);
      this.props.getPaymentMethods();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    createNewPaymentMethod(obj)
    {
      this.props.createPaymentMethod(obj, this.props.user, this.props.socket);
      this.closeNewModal();
    }

    openEditModal(paymentMethod)
    {
      var c = [];
			var countries = localStorage.getItem("countries") && JSON.parse(localStorage.getItem("countries")) || [];
			for(var i=0; i<countries.length; i++) {
				for(var j=0; j<paymentMethod.countries.length; j++) {
					if(countries[i].name == paymentMethod.countries[j]) {
						c.push({label: countries[i].name, value: countries[i].id})
					}
				}
			}
			paymentMethod.countries = c;
      this.setState({editModal: true, selectedPayment: paymentMethod});
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditPaymentMethod(paymentMethod, data)
    {
      var id = paymentMethod.id;
      delete paymentMethod.id;
      this.props.editPaymentMethod(id, data, this.props.user, this.props.socket);
      this.closeEditModal();
    }

    DeletePaymentMethod(paymentMethod)
    {
      var id = paymentMethod.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati plačilno metodo?"))
        this.props.deletePaymentMethod(id, this.props.user, this.props.socket);
    }

    renderSinglePaymentMethod(paymentMethod, index)
    {
      return(
        <tr key={index}>
          <td>{paymentMethod.title}</td>
          <td>{paymentMethod.code}</td>
          <td><Switch checked={paymentMethod.active === 1} disabled={true} className="form-white" /></td>
          <td>{paymentMethod.countries.map(c => {return c}).join(", ")}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, paymentMethod)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeletePaymentMethod.bind(this, paymentMethod)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { paymentmethods } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Plačilne metode</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj plačilno metodo</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Ime</th>
                        <th className="left table-pad-l-8">Koda</th>
                        <th className="left table-pad-l-8">Aktivna</th>
                        <th className="left table-pad-l-8">Države</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentmethods.map(this.renderSinglePaymentMethod.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.paymentmethodsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal && <NewPaymentMethod languages={this.props.allLanguages} countries={this.props.countries} newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewPaymentMethod={this.createNewPaymentMethod.bind(this)}/>}
          {this.state.editModal && this.props.initialValuesPaymentMethod && <EditPaymentMethod initialValues={Immutable.fromJS(this.state.selectedPayment)} languages={this.props.allLanguages}
           countries={this.props.countries} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} EditPaymentMethod={this.EditPaymentMethod.bind(this)}/> }
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getPaymentMethods: () => {
      dispatch(getPaymentMethods());
    },

    createPaymentMethod: (obj, user, socket) => {
      dispatch(createPaymentMethod(obj, user, socket));
    },

    setInitialValuesPaymentMethod: (paymentMethod) => {
      dispatch(setInitialValuesPaymentMethod(paymentMethod));
    },

    editPaymentMethod: (id, obj, user, socket) => {
      dispatch(editPaymentMethod(id, obj, user, socket));
    },

    deletePaymentMethod: (id, user, socket) => {
      dispatch(deletePaymentMethod(id, user, socket));
    },

    getAllLanguages: () => {
      dispatch(getAllLanguages());
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    paymentmethods: nextState.payment_methods_data.paymentmethods,
    paymentmethodsCount: nextState.payment_methods_data.paymentmethodsCount,
    initialValuesPaymentMethod: nextState.payment_methods_data.initialValuesPaymentMethod,
    countries: nextState.main_data.countries,
    user: nextState.main_data.user,
    socket: nextState.main_data.socket,
    allLanguages: nextState.language_data.allLanguages
  }
}

export default connect(mapStateToProps, mapDispatchToProps) (PaymentMethods);

