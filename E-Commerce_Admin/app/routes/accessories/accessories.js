import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import {getAccessories, createAccessory, setInitialValuesAccessory, editAccessory, deleteAccessory} from '../../actions/accessories_actions';
import NewAccessory from './new_accessory.js';
import Select from 'react-select';
import EditAccessory from './edit_accessory.js';
import ReplicateAccessory from './replicate_accessory.js';
import Search from '../../components/Search/Search';


class Accessories extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:15, a_profile_image:null, a_images:null, replicateModal: false, selectedCountry: null};
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
      this.props.getAccessories();
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
      this.props.getAccessories();
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

    createNewAccessory(data)
    {
      this.props.createAccessory(data);
      this.closeNewModal();
    }

    openEditModal(accessory)
    {
      this.setState({editModal: true});
      this.setState({a_profile_image: accessory.profile_image})
      this.setState({a_images: accessory.images})
      this.props.setInitialValuesAccessory(accessory);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    openReplicateModal(accessory) {
      this.setState({replicateModal: true});
      this.setState({a_profile_image: accessory.profile_image})
      this.setState({a_images: accessory.images})
      this.props.setInitialValuesAccessory(accessory);
    }

    closeReplicateModal()
    {
      this.setState({replicateModal: false})
    }

    ReplicateAccessory(obj)
    {
      this.props.createAccessory(obj)
      this.closeReplicateModal();
    }

    EditAccessory(accessory, data)
    {
      var id = accessory.id;
      delete accessory.id;
      this.props.editAccessory(id, data);
      this.closeEditModal();
    }

    DeleteAccessory(accessory)
    {
      if(window.confirm("Ali ste sigurni da hočete izbrisati dodatek?"))
        this.props.deleteAccessory(accessory.id);
    }

    renderAccessories(accessory, index){
      var currency = this.props.countries.find(c => {return c.name == accessory.country})

      return(
        <tr key={index}>
          <td>{accessory.profile_image != null ? <img src={accessory.profile_image.link} className="accessories-pic-table"/> : ""}</td>
          <td>{accessory.name}</td>
          <td>{accessory.lang} / {accessory.country}</td>
          <td>{accessory.category}</td>
          <td>{parseFloat(accessory.regular_price).toFixed(2)} {currency && currency.symbol}</td>
          <td>{parseFloat(accessory.reduced_price).toFixed(2)} {currency && currency.symbol}</td>
          <td className={`center pointer`}>
            <span onClick={this.openEditModal.bind(this, accessory)} className="fa fa-pencil-alt"></span>
          </td>
          <td className="center">
            <span onClick={this.openReplicateModal.bind(this, accessory)} className="fa fa-clone pointer"></span>
          </td>
          <td className={`center pointer`}>
            <span onClick={this.DeleteAccessory.bind(this, accessory)} className="fa fa-trash"></span>
          </td>
        </tr>
      )
    }

    changeCountrySelect = (event) => {
      this.setState({selectedCountry: event})
      var location = browserHistory.getCurrentLocation();
      if(event)
        location.query.country = event.value;
      else
        delete location.query.country;
      this.resetPageNumber(location);
      browserHistory.replace(location)
      this.props.getAccessories();
    }

    setSearch = (data) => {
      let location = browserHistory.getCurrentLocation();
      this.resetPageNumber(location);
      if(data=="")
        delete location.query.search;
      else
        location.query.search = data;
      browserHistory.replace(location);
      this.props.getAccessories();
    }

    render(){
      const { accessories, localCountries } = this.props;

      const c = localCountries.map(c => { return {label: c, value: c}});

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Dodatki</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-4 search-div">
                <Search setSearch={this.setSearch} />
              </div>
              <div className="col-md-3">
                <Select
                  className="form-white"
                  name=""
                  placeholder="Izberi državo..."
                  value={this.state.selectedCountry}
                  options={c}
                  multi={false}
                  onChange={this.changeCountrySelect}
                />
              </div>
              <div className="col-md-5 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj dodatek</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Slika</th>
                        <th className="left table-pad-l-8">Naziv</th>
                        <th className="left table-pad-l-8">Jezik / Država</th>
                        <th className="left table-pad-l-8">Kategorija</th>
                        <th className="left table-pad-l-8">Redna cena</th>
                        <th className="left table-pad-l-8">Cena s popustom</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Dupliciraj</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessories.map(this.renderAccessories.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} current={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.accessoriesCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewAccessory newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewAccessory={this.createNewAccessory.bind(this)}
          products={this.props.products} countries={this.props.countries} languages={this.props.languages}/>
          {this.state.editModal && <EditAccessory initialValues={Immutable.fromJS(this.props.initialValuesAccessory)} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)}
          a_profile_image={this.state.a_profile_image} a_images={this.state.a_images} EditAccessory={this.EditAccessory.bind(this)} products={this.props.products}
          countries={this.props.countries} languages={this.props.languages}/>}
          {this.state.replicateModal && <ReplicateAccessory initialValues={Immutable.fromJS(this.props.initialValuesAccessory)} replicateModal={this.state.replicateModal}
          closeReplicateModal={this.closeReplicateModal.bind(this)} a_profile_image={this.state.a_profile_image} a_images={this.state.a_images} ReplicateAccessory={this.ReplicateAccessory.bind(this)}
          products={this.props.products} countries={this.props.countries} languages={this.props.languages}/>}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getAccessories: () => {
      dispatch(getAccessories());
    },

    createAccessory: (data) => {
      dispatch(createAccessory(data));
    },

    setInitialValuesAccessory: (accessory) => {
      dispatch(setInitialValuesAccessory(accessory));
    },

    editAccessory: (id, accessory) => {
      dispatch(editAccessory(id, accessory));
    },

    deleteAccessory: (id) => {
      dispatch(deleteAccessory(id));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    accessories: nextState.accessories_data.accessories,
    accessoriesCount: nextState.accessories_data.accessoriesCount,
    countries: nextState.main_data.countries,
    initialValuesAccessory: nextState.accessories_data.initialValuesAccessory,
    products: nextState.main_data.products,
    localCountries: nextState.main_data.localCountries,
    languages: nextState.main_data.languages
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Accessories);
