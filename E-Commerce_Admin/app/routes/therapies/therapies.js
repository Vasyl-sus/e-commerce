import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {compose} from 'redux';
import {getTherapies, createTherapy, setInitialValuesTherapy, editTherapy, deleteTherapy} from '../../actions/therapies_actions';
import {connect} from 'react-redux';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { Field, reduxForm } from 'redux-form/immutable';
import NewTherapy from './new_therapy.js';
import EditTherapy from './edit_therapy.js';
import ReplicateTherapy from './replicate_therapy.js';

class Therapies extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, enabled:false, activeFilter:false, pageNumber:1, pageLimit:15,
      replicateModal: false, sortCountry: true, sortID: true, sortName: true, sortPrice: true, images:[], searchString:'', selectedCountry: null};
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

      if(location.query.sort)
        this.setState({sort: location.query.sort});
      else
        location.query.sort = "country";

      if(location.query.sortOpt) {
        if(location.query.sortOpt == "desc") {
          if(location.query.sort == "country")
            this.setState({sortCountry: false})
          if(location.query.sort == "name")
            this.setState({sortName: false})
          if(location.query.sort == "id")
            this.setState({sortID: false})
          if(location.query.sort == "total_price")
            this.setState({sortPrice: false})
        }
        this.setState({sortOpt: location.query.sortOpt});
      }
      else
        location.query.sortOpt = "asc";

      if(location.query.search)
      {
        delete location.query.search;
      }

      if(location.query.country) {
        var selectedCountry = this.props.localCountries.find(c => {return c == location.query.country});
        this.setState({selectedCountry});
      }

      browserHistory.replace(location);
      this.props.getTherapies();
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
      this.props.getTherapies();
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

    createNewTherapy(data)
    {
      this.props.createTherapy(data, this.props.user, this.props.socket);
      this.closeNewModal();
    }

    replicateTherapy(data)
    {
      this.props.createTherapy(data, this.props.user, this.props.socket);
      this.closeReplicateModal();
    }

    openEditModal(therapy)
    {
      this.setState({editModal: true});
      if(therapy.images.length > 0)
      {
        this.setState({images: therapy.images});
      }
      else {
        this.setState({images: []});
      }
      this.props.setInitialValuesTherapy(therapy);
    }

    openReplicateModal(therapy)
    {
      this.setState({replicateModal: true});
      if(therapy.images.length > 0)
      {
        this.setState({images: therapy.images});
      }
      else {
        this.setState({images: []});
      }
      this.props.setInitialValuesTherapy(therapy);
    }

    closeEditModal() {
      this.setState({editModal: false})
    }

    closeReplicateModal() {
      this.setState({replicateModal: false})
    }

    EditExistingTherapy(therapy, data)
    {
      var id = therapy.id;
      delete therapy.id;
      this.props.editTherapy(id, data, this.props.user, this.props.socket);
      this.closeEditModal();
    }

    DeleteTherapy(therapy)
    {
      var id = therapy.id;
      if(window.confirm("Ali ste sigurni da hočete deaktivirati terapijo?"))
        this.props.deleteTherapy(id, this.props.user, this.props.socket);
    }

    sortByCountry(sort) {
      let location = browserHistory.getCurrentLocation();
      location.query.sort = sort;
      this.setState({sortCountry: !this.state.sortCountry})
      this.setState({sortName: true})
      this.setState({sortID: true})
      if(!this.state.sortCountry) {
        location.query.sortOpt = "asc";
      } else {
        location.query.sortOpt = "desc";
      }
      browserHistory.replace(location);
      this.props.getTherapies();
    }

    sortByID(sort) {
      let location = browserHistory.getCurrentLocation();
      location.query.sort = sort;
      this.setState({sortID: !this.state.sortID})
      this.setState({sortName: true})
      this.setState({sortCountry: true})
      this.setState({sortPrice: true})
      if(!this.state.sortID) {
        location.query.sortOpt = "asc";
      } else {
        location.query.sortOpt = "desc";
      }
      browserHistory.replace(location);
      this.props.getTherapies();
    }

    sortByName(sort) {
      let location = browserHistory.getCurrentLocation();
      location.query.sort = sort;
      this.setState({sortName: !this.state.sortName})
      this.setState({sortCountry: true})
      this.setState({sortID: true})
      this.setState({sortPrice: true})
      if(!this.state.sortName) {
        location.query.sortOpt = "asc";
      } else {
        location.query.sortOpt = "desc";
      }
      browserHistory.replace(location);
      this.props.getTherapies();
    }

    sortByPrice(sort) {
      let location = browserHistory.getCurrentLocation();
      location.query.sort = sort;
      this.setState({sortPrice: !this.state.sortPrice})
      this.setState({sortCountry: true})
      this.setState({sortID: true})
      this.setState({sortName: true})
      if(!this.state.sortPrice) {
        location.query.sortOpt = "asc";
      } else {
        location.query.sortOpt = "desc";
      }
      browserHistory.replace(location);
      this.props.getTherapies();
    }

    setSearch(data) {
      data = data.toJS();
      let location = browserHistory.getCurrentLocation();
      this.resetPageNumber(location);
      if(data.searchString=="")
        delete location.query.search;
      else
        location.query.search = data.searchString;
      browserHistory.replace(location);
      this.props.getTherapies();
    }

    changeCountrySelect(event) {
      this.setState({selectedCountry: event})
      var location = browserHistory.getCurrentLocation();
      if(event)
        location.query.country = event.value;
      else
        delete location.query.country;
      this.resetPageNumber(location);
      browserHistory.replace(location)
      this.props.getTherapies();
    }

    renderSingleTherapy(therapy, index){
      var currency = this.props.countries.find(c => {return c.name == therapy.country})

      return(
        <tr key={index}>
          <td>{therapy.country}</td>
          <td>{therapy.name}</td>
          <td>{parseFloat(therapy.total_price).toFixed(2)} {currency && currency.symbol}</td>
          <td className="center">{therapy.id}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, therapy)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.openReplicateModal.bind(this, therapy)} className="fas fa-clone pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteTherapy.bind(this, therapy)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { therapies, handleSubmit, localCountries } = this.props;

      const c = localCountries.map(c => { return {label: c, value: c}});

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Terapije</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-4 search-div">
                <form onSubmit={handleSubmit(this.setSearch.bind(this))}>
                  <Field place="Išči terapije..." name="searchString" type="text" component={renderField}></Field>
                  <button type="submit" className="btn btn-secondary btn-search">IŠČI</button>
                </form>
              </div>
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
              <div className="col-md-5 d-flex justify-content-end">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj terapijo</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Država <i onClick={this.sortByCountry.bind(this, "country")} className={`ml-2 pointer ${this.state.sortCountry ? "fa fa-chevron-up" : "fa fa-chevron-down"}`} aria-hidden="true"></i></th>
                        <th className="left table-pad-l-8">Ime terapije <i onClick={this.sortByName.bind(this, "name")} className={`ml-2 pointer ${this.state.sortName ? "fa fa-chevron-up" : "fa fa-chevron-down"}`} aria-hidden="true"></i></th>
                        <th className="left table-pad-l-8">Cena <i onClick={this.sortByPrice.bind(this, "total_price")} className={`ml-2 pointer ${this.state.sortPrice ? "fa fa-chevron-up" : "fa fa-chevron-down"}`} aria-hidden="true"></i></th>
                        <th className="center table-pad-l-8">ID</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Dupliciraj</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {therapies.map(this.renderSingleTherapy.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.therapiesCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewTherapy newModal={this.state.newModal} therapy_category={this.props.therapy_category} languages={this.props.languages} closeNewModal={this.closeNewModal.bind(this)} countries={this.props.countries} products={this.props.products} createNewTherapy={this.createNewTherapy.bind(this)} />
          {this.state.editModal && <EditTherapy initialValues={Immutable.fromJS(this.props.initialValuesTherapy)} therapy_category={this.props.therapy_category} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)}
          countries={this.props.countries} products={this.props.products} EditExistingTherapy={this.EditExistingTherapy.bind(this)} images={this.state.images} languages={this.props.languages}/>}
          {this.state.replicateModal && <ReplicateTherapy initialValues={Immutable.fromJS(this.props.initialValuesTherapy)} therapy_category={this.props.therapy_category} replicateModal={this.state.replicateModal} closeReplicateModal={this.closeReplicateModal.bind(this)}
          countries={this.props.countries} products={this.props.products} replicateTherapy={this.replicateTherapy.bind(this)} images={this.state.images} languages={this.props.languages}/> }
        </div>
      )
    }
 }

 const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning } }) => (
   <div className={inputclass}>
    <input type={type} placeholder={place} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} new-search-input`} />
   </div>
 )

const mapDispatchToProps = (dispatch) => {
  return {
    getTherapies: () => {
      dispatch(getTherapies());
    },

    createTherapy: (data, user, socket) => {
      dispatch(createTherapy(data, user, socket));
    },

    setInitialValuesTherapy: (therapy) => {
      dispatch(setInitialValuesTherapy(therapy));
    },

    editTherapy: (id, data, user, socket) => {
      dispatch(editTherapy(id, data, user, socket));
    },

    deleteTherapy: (id, user, socket) => {
      dispatch(deleteTherapy(id, user, socket));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    therapies: nextState.therapies_data.therapies,
    therapiesCount: nextState.therapies_data.therapiesCount,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages,
    products: nextState.main_data.products,
    initialValuesTherapy: nextState.therapies_data.initialValuesTherapy,
    therapy_category: [{label: "tattoo", value: "tattoo"}, {label: "cream", value: "cream"}, {label: "eyelash", value: "eyelash"}, {label: "caviar", value: "caviar"}, {label: "royal", value: "royal"}, {label: "aqua", value: "aqua"}, {label: "lotion", value: "lotion"}, {label: "procollagen", value: "procollagen"}, {label: "bundle", value: "bundle"}],
    user: nextState.main_data.user,
    socket: nextState.main_data.socket,
    localCountries: nextState.main_data.localCountries
  }
}

export default compose(
  reduxForm({
    form: 'TherapiesForm',
    enableReinitialize: true
  }), connect(mapStateToProps, mapDispatchToProps)
)(Therapies);
