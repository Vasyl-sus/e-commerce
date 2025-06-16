import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {getCurrencies, createCurrency, setInitialValuesCurrency, editCurrency, deleteCurrency} from '../../actions/currencies_actions';
import {connect} from 'react-redux';
import NewCurrency from './new_currency.js';
import EditCurrency from './edit_currency.js';

class Currencies extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:5};
    }

    componentDidMount()
    {
      var location = browserHistory.getCurrentLocation();

      if(location.query.pageLimit)
        this.setState({pageLimit: location.query.pageLimit});
      else
        location.query.pageLimit = 5;

      if(location.query.pageNumber)
        this.setState({pageNumber: location.query.pageNumber});
      else
        location.query.pageNumber = 1;

      browserHistory.replace(location);
      this.props.getCurrencies();
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
      this.props.getCurrencies();
      this.setState({pageNumber})
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    createNewCurrency(obj)
    {
      this.props.createCurrency(obj, this.props.user, this.props.socket);
      this.closeNewModal();
    }

    openEditModal(currency)
    {
      this.setState({editModal: true});
      this.props.setInitialValuesCurrency(currency);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditExistingCurrency(currency)
    {
      var id = currency.id;
      delete currency.id;
      this.props.editCurrency(id, currency, this.props.user, this.props.socket);
      this.closeEditModal();
    }

    DeleteCurrency(currency)
    {
      var id = currency.id;
      if (window.confirm('Ali ste sigurni da hočete izbrisati valuto?'))
        this.props.deleteCurrency(id, this.props.user, this.props.socket);
    }

    renderSingleCurrency(currency, index)
    {
      return(
        <tr key={index}>
          <td>{currency.name}</td>
          <td>{currency.code}</td>
          <td>{currency.symbol}</td>
          <td>{parseFloat(currency.value).toFixed(2)}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, currency)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteCurrency.bind(this, currency)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { currencies } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Valute</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj valuto</button>
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
                        <th className="left table-pad-l-8">Simbol</th>
                        <th className="left table-pad-l-8">Vrednost</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currencies.map(this.renderSingleCurrency.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.currenciesCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewCurrency newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewCurrency={this.createNewCurrency.bind(this)} />
          <EditCurrency initialValues={Immutable.fromJS(this.props.initialValuesCurrency)} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} EditExistingCurrency={this.EditExistingCurrency.bind(this)} />
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getCurrencies: () => {
      dispatch(getCurrencies());
    },

    createCurrency: (obj, user, socket) => {
      dispatch(createCurrency(obj, user, socket));
    },

    setInitialValuesCurrency: (currency) => {
      dispatch(setInitialValuesCurrency(currency));
    },

    editCurrency: (id, currency, user, socket) => {
      dispatch(editCurrency(id, currency, user, socket));
    },

    deleteCurrency: (id, user, socket) => {
      dispatch(deleteCurrency(id, user, socket));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    currencies: nextState.currencies_data.currencies,
    currenciesCount: nextState.currencies_data.currenciesCount,
    initialValuesCurrency: nextState.currencies_data.initialValuesCurrency,
    user: nextState.main_data.user,
    socket: nextState.main_data.socket
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Currencies);
