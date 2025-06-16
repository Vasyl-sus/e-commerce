import React, {Component} from 'react';
import {connect} from 'react-redux';
import Immutable from 'immutable';
import {getCountries, addCountry, deleteCountry, setInitialCountry, editCountry} from '../../actions/countries_actions';
import {getLanguages} from '../../actions/languages_actions';
import NewCountry from './new_country.js';
import EditCountry from './edit_country.js';

import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";

class Countries extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal:false, editModal: false, pageNumber:1, pageLimit:20, count:0};
    }

    componentDidMount()
    {
      this.props.getCountries();
      this.props.getLanguages();
    };

    toggleEditModal(row) {
      this.setState({editModal: !this.state.editModal});
      this.props.setInitialCountry(row)
    }

    renderRows(row, index){
      return(
        <tr key={index}>
          <td>{row.full_name}</td>
          <td>{row.name}</td>
          <td>{row.currency_name}</td>
          <td className="center">
            <span onClick={this.toggleEditModal.bind(this, row)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.deleteCountryIf.bind(this, row.id)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    openNewModal() {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    addNewCountry(obj){
      this.props.addCountry(obj, this.props.user, this.props.socket);
      this.closeNewModal();
    }

    deleteCountryIf(id){
      //console.log(id);
      if (window.confirm('Ali ste sigurni da hočete izbrisati državo?'))
        this.props.deleteCountry(id, this.props.user, this.props.socket);
    }

    pageChange(pageNumber) {
      let location = browserHistory.getCurrentLocation();
      location.query.pageNumber = pageNumber;
      browserHistory.replace(location);
      this.props.getCountries();
      this.setState({pageNumber});
    }

    editCountry(data, langData) {
      this.props.editCountry(data, langData)
    }

    render(){
      const {countries } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Države</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default">Dodaj državo</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Naziv</th>
                        <th className="left table-pad-l-8">Kratica</th>
                        <th className="left table-pad-l-8">Valuta</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {countries.map(this.renderRows.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.countriesCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal && <NewCountry newModal={this.state.newModal} addNewCountry={this.addNewCountry.bind(this)} closeNewModal={this.closeNewModal.bind(this)}/>}
          {this.state.editModal && <EditCountry langs={this.props.languages} initialValues={Immutable.fromJS(this.props.initialValuesCountry)} editModal={this.state.editModal} editCountry={this.editCountry.bind(this)} closeEditModal={this.toggleEditModal.bind(this)}/>}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getCountries: () => {
      dispatch(getCountries());
    },
    addCountry: (obj,user,socket) => {
      dispatch(addCountry(obj,user,socket));
    },
    deleteCountry: (id,user,socket) => {
      dispatch(deleteCountry(id,user,socket));
    },
    setInitialCountry: (data) => {
      dispatch(setInitialCountry(data))
    },
    editCountry: (data, langData) => {
      dispatch(editCountry(data, langData))
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
    countries: nextState.countries_data.countriesList,
    countriesCount: nextState.countries_data.countriesListCount,
    user: nextState.main_data.user,
    initialValuesCountry: nextState.countries_data.initialValuesCountry,
    languages: nextState.language_data.languages,
    socket: nextState.main_data.socket
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Countries);
