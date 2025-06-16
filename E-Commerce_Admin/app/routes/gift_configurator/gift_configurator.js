import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {getGiftConfigurator, createGiftConfigurator, setInitialValuesGiftConfigurator,
editGiftConfigurator, deleteGiftConfigurator} from '../../actions/gift_configurator_actions';
import NewGiftConfig from './new_gift_configurator.js';
import EditGiftConfig from './edit_gift_configurator.js';

class GiftConfig extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:15, active:1, selectedCountry: null};
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

      if(location.query.country) {
        var selectedCountry = this.props.countries.find(c => {return c.name == location.query.country});
        this.setState({selectedCountry: {label: selectedCountry.name, value: selectedCountry.name}});
      }

      browserHistory.replace(location);
      this.props.getGiftConfigurator();
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
      this.props.getGiftConfigurator();
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

    createGiftConfigurator(obj)
    {
      this.props.createGiftConfigurator(obj);
      this.closeNewModal();
    }

    openEditModal(obj)
    {
      this.setState({editModal: true});
      this.props.setInitialValuesGiftConfigurator(obj);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    editGiftConfigurator(obj)
    {
      var id = obj.id;
      delete obj.id;
      this.props.editGiftConfigurator(id, obj);
      this.closeEditModal();
    }

    deleteGiftConfigurator(obj)
    {
      if(window.confirm("Ali ste sigurni da hočete izbrisati konfiguracijo?"))
        this.props.deleteGiftConfigurator(obj.id);
    }

    changeCountrySelect(event) {
      this.setState({selectedCountry: event})
      var location = browserHistory.getCurrentLocation();
      if(event != null)
        location.query.country = event.value;
      else
        delete location.query.country;
      this.resetPageNumber(location);
      browserHistory.replace(location)
      this.props.getGiftConfigurator();
    }

    renderGiftConfigurator(giftConfig, index){
      var currency = this.props.countries.find(c => {return c.name == giftConfig.country})

      return(
        <tr key={index}>
          <td>{giftConfig.count}</td>
          <td>{parseFloat(giftConfig.price).toFixed(2)} {currency && currency.symbol}</td>
          <td>{giftConfig.num_therapies}</td>
          <td>{giftConfig.country}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, giftConfig)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.deleteGiftConfigurator.bind(this, giftConfig)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const {giftConfig, countries} = this.props;

      const c = countries.map(c => { return {label: c.name, value: c.name}});

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Konfigurator daril</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-3">
                <Select
                  className="form-white"
                  name=""
                  placeholder="Izberi državo..."
                  value={this.state.selectedCountry}
                  options={c}
                  multi={false}
                  onChange={this.changeCountrySelect.bind(this)}
                />
              </div>
              <div className="col-md-9 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Število</th>
                        <th className="left table-pad-l-8">Cena</th>
                        <th className="left table-pad-l-8">Št. terapije</th>
                        <th className="left table-pad-l-8">Država</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {giftConfig.map(this.renderGiftConfigurator.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.giftConfigCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal ? <NewGiftConfig newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)}
          countries={this.props.countries} createGiftConfigurator={this.createGiftConfigurator.bind(this)} /> : ""}
          {this.state.editModal ? <EditGiftConfig countries={this.props.countries} initialValues={Immutable.fromJS(this.props.initialValuesGiftConfig)}
          editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} editGiftConfigurator={this.editGiftConfigurator.bind(this)} /> : ""}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getGiftConfigurator: () => {
      dispatch(getGiftConfigurator());
    },

    createGiftConfigurator: (obj) => {
      dispatch(createGiftConfigurator(obj));
    },

    setInitialValuesGiftConfigurator: (obj) => {
      dispatch(setInitialValuesGiftConfigurator(obj));
    },

    editGiftConfigurator: (id, obj) => {
      dispatch(editGiftConfigurator(id, obj));
    },

    deleteGiftConfigurator: (id) => {
      dispatch(deleteGiftConfigurator(id));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    giftConfig: nextState.gift_configurator_data.giftConfig,
    giftConfigCount: nextState.gift_configurator_data.giftConfigCount,
    initialValuesGiftConfig: nextState.gift_configurator_data.initialValuesGiftConfig,
    countries: nextState.main_data.countries
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GiftConfig);
