import React, {Component} from 'react';
import Switch from 'react-switch'
import { browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {getLanguages} from '../../actions/languages_actions';
import {getDeliveryMethods, createDeliveryMethod, setInitialValuesDeliveryMethod, editDeliveryMethod, deleteDeliveryMethod} from '../../actions/delivery_methods_actions';
import {connect} from 'react-redux';
import NewDeliveryMethod from './new_delivery_method.js';
import EditDeliveryMethod from './edit_delivery_method.js';

class DeliveryMethods extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:15, thisDeliveryMethod: null};
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
      this.props.getDeliveryMethods();
      this.props.getLanguages();
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
      this.props.getDeliveryMethods();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    createNewDeliveryMethod(obj)
    {
      this.props.createDeliveryMethod(obj, this.props.user, this.props.socket);
      this.closeNewModal();
    }

    openEditModal(deliveryMethod)
    {
			deliveryMethod.therapies = deliveryMethod.therapies.map(t => {return {label: t.name, value: t.id}})
      this.setState({editModal: true, thisDeliveryMethod: deliveryMethod});
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditExistingDeliveryMethod(deliveryMethod, data)
    {
      var id = deliveryMethod.id;
      delete deliveryMethod.id;
      this.props.editDeliveryMethod(id, data, this.props.user, this.props.socket);
      this.closeEditModal();
    }

    DeleteDeliveryMethod(deliveryMethod)
    {
      var id = deliveryMethod.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati način dostave?"))
        this.props.deleteDeliveryMethod(id, this.props.user, this.props.socket);
    }

    renderSingleDeliveryMethod(deliveryMethod, index)
    {
      var currency = this.props.countries.find(c => {return c.name == deliveryMethod.country})
      return(
        <tr key={index}>
          <td>{deliveryMethod.code}</td>
          <td><Switch checked={deliveryMethod.active === 1} disabled={true} className="form-white"/></td>
          <td className="center">{deliveryMethod.country}</td>
          <td className="center">{deliveryMethod.price} {currency && currency.symbol}</td>
          <td className="center">{deliveryMethod.to_price} {currency && currency.symbol}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, deliveryMethod)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteDeliveryMethod.bind(this, deliveryMethod)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { deliverymethods } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Načini dostave</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj način dostave</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Koda</th>
                        <th className="left table-pad-l-8">Aktivni</th>
                        <th className="center table-pad-l-8">Država</th>
                        <th className="center table-pad-l-8">Cena dostave</th>
                        <th className="center table-pad-l-8">Minimalni znesek za brezplačno dostavo</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliverymethods.map(this.renderSingleDeliveryMethod.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.deliverymethodsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal ? <NewDeliveryMethod newModal={this.state.newModal} therapies={this.props.therapies} langs={this.props.languages} closeNewModal={this.closeNewModal.bind(this)}
          countries={this.props.countries} createNewDeliveryMethod={this.createNewDeliveryMethod.bind(this)}/> : ""}
          {this.state.editModal ? <EditDeliveryMethod initialValues={Immutable.fromJS(this.state.thisDeliveryMethod)} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)}
          therapies={this.props.therapies} langs={this.props.languages} countries={this.props.countries} EditExistingDeliveryMethod={this.EditExistingDeliveryMethod.bind(this)}/> : ""}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getDeliveryMethods: () => {
      dispatch(getDeliveryMethods());
    },

    createDeliveryMethod: (obj, user, socket) => {
      dispatch(createDeliveryMethod(obj, user, socket));
    },

    setInitialValuesDeliveryMethod: (deliveryMethod) => {
      dispatch(setInitialValuesDeliveryMethod(deliveryMethod));
    },

    editDeliveryMethod: (id, deliveryMethod, user, socket) => {
      dispatch(editDeliveryMethod(id, deliveryMethod, user, socket));
    },

    deleteDeliveryMethod: (id, user, socket) => {
      dispatch(deleteDeliveryMethod(id, user, socket));
    },

    getLanguages: () => {
      dispatch(getLanguages());
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    deliverymethods: nextState.delivery_methods_data.deliverymethods,
    deliverymethodsCount: nextState.delivery_methods_data.deliverymethodsCount,
    initialValuesDeliveryMethod: nextState.delivery_methods_data.initialValuesDeliveryMethod,
    countries: nextState.main_data.countries,
    user: nextState.main_data.user,
    socket: nextState.main_data.socket,
    therapies: nextState.main_data.therapies,
    languages: nextState.language_data.allLanguages
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryMethods);
