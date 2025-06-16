import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {getAllLanguages} from '../../actions/languages_actions';
import {getOrderStatuses, createOrderStatus, setInitialValuesOrderStatus, editOrderStatus, deleteOrderStatus} from '../../actions/order_statuses_actions';
import {connect} from 'react-redux';
import NewOrderStatus from './new_order_status.js';
import EditOrderStatus from './edit_order_status.js';

class OrderStatuses extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:15};
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
      this.props.getOrderStatuses();
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
      this.props.getOrderStatuses();
      this.setState({pageNumber});
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    createNewOrderStatus(obj)
    {
      this.props.createOrderStatus(obj, this.props.user, this.props.socket);
      this.closeNewModal();
      setTimeout(
        function() {
          this.props.getOrderStatuses();
        }
        .bind(this),
        1000
      );
    }

    openEditModal(orderStatus)
    {
      this.setState({editModal: true});
      this.setState({translations: orderStatus.translations})
      this.props.setInitialValuesOrderStatus(orderStatus);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditExistingOrderStatus(orderStatus)
    {
      var id = orderStatus.id;
      delete orderStatus.id;
      this.props.editOrderStatus(id, orderStatus, this.props.user, this.props.socket);
      this.closeEditModal();
      setTimeout(
        function() {
          this.props.getOrderStatuses();
        }
        .bind(this),
        1000
      );
    }

    DeleteOrderStatus(orderStatus)
    {
      var id = orderStatus.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati statusa?"))
        this.props.deleteOrderStatus(id, this.props.user, this.props.socket);

      setTimeout(
        function() {
          this.props.getOrderStatuses();
        }
        .bind(this),
        1000
      );
    }

    renderSingleOrderStatus(orderStatus, index)
    {
      return(
        <tr key={index}>
          <td>{orderStatus.sort_order}</td>
          <td>{orderStatus.name}</td>
          <td className="center">
          <svg width="20" height="20">
            <rect width="20" height="20" style={{fill: orderStatus.color}}/>
          </svg>
          </td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, orderStatus)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteOrderStatus.bind(this, orderStatus)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { orderstatuses } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Statusi naročil</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj status</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Zap. št.</th>
                        <th className="left table-pad-l-8">Status</th>
                        <th className="center table-pad-l-8">Barva</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderstatuses.map(this.renderSingleOrderStatus.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.orderstatusesCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal && <NewOrderStatus order_statuses={this.props.orderstatuses} languages={this.props.allLanguages} newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewOrderStatus={this.createNewOrderStatus.bind(this)}/>}
          {this.state.editModal && <EditOrderStatus initialValues={Immutable.fromJS(this.props.initialValuesOrderStatus)} order_statuses={this.props.orderstatuses} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)}
          languages={this.props.allLanguages} translations={this.state.translations} EditExistingOrderStatus={this.EditExistingOrderStatus.bind(this)}/>}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getOrderStatuses: () => {
      dispatch(getOrderStatuses());
    },

    createOrderStatus: (obj, user, socket) => {
      dispatch(createOrderStatus(obj, user, socket));
    },

    setInitialValuesOrderStatus: (orderStatus) => {
      dispatch(setInitialValuesOrderStatus(orderStatus));
    },

    editOrderStatus: (id, orderStatus, user, socket) => {
      dispatch(editOrderStatus(id, orderStatus, user, socket));
    },

    deleteOrderStatus: (id, user, socket) => {
      dispatch(deleteOrderStatus(id, user, socket));
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
    orderstatuses: nextState.order_statuses_data.orderstatuses,
    orderstatusesCount: nextState.order_statuses_data.orderstatusesCount,
    initialValuesOrderStatus: nextState.order_statuses_data.initialValuesOrderStatus,
    order_statuses: nextState.main_data.orderstatuses,
    user: nextState.main_data.user,
    socket: nextState.main_data.socket,
    allLanguages: nextState.language_data.allLanguages
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderStatuses);
