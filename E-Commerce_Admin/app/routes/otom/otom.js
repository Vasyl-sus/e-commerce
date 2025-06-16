import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import {getOTOMails, createOTOMail, setInitialValuesOTOMail, editOTOMail, deleteOTOMail} from '../../actions/otom_actions';
import NewOTOM from './new_otom.js';
import EditOTOM from './edit_otom.js';

class Otoms extends Component {
    constructor(props) {
      super(props);

      this.state = {pageNumber:1, pageLimit:15, newModal: false, editModal: false};
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
      this.props.getOTOMails();
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
      this.props.getOTOMails();
    }

    CreateOTOMail(obj)
    {
      this.props.createOTOMail(obj)
      this.closeNewModal();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    DeleteOTOMail(otom) {
      var id = otom.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati OTO maila?"))
        this.props.deleteOTOMail(id);
    }

    openEditModal(otom)
    {
      this.setState({editModal: true});
      this.props.setInitialValuesOTOMail(otom);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditOTOMail(id, data)
    {
      this.props.editOTOMail(id, data);
      this.closeEditModal();
    }

    renderOTOMails(otom, index)
    {
      return(
        <tr key={index}>
          <td>{otom.title}</td>
          <td>{otom.country}</td>
          <td>{otom.lang}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, otom)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteOTOMail.bind(this, otom)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { otoms } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">OTO maili</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj OTO mail</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Naslov</th>
                        <th className="left table-pad-l-8">Država</th>
                        <th className="left table-pad-l-8">Jezik</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otoms.map(this.renderOTOMails.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.otomsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal ? <NewOTOM newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} countries={this.props.countries} CreateOTOMail={this.CreateOTOMail.bind(this)}
          discounts={this.props.discounts} therapies={this.props.therapies} languages={this.props.languages}/> : ""}
          {this.state.editModal ? <EditOTOM editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} countries={this.props.countries} EditOTOMail={this.EditOTOMail.bind(this)}
          discounts={this.props.discounts} therapies={this.props.therapies} initialValues={Immutable.fromJS(this.props.initialValuesOtom)} languages={this.props.languages}/> : ""}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getOTOMails: () => {
      dispatch(getOTOMails());
    },

    createOTOMail: (obj) => {
      dispatch(createOTOMail(obj));
    },

    setInitialValuesOTOMail: (otom) => {
      dispatch(setInitialValuesOTOMail(otom));
    },

    editOTOMail: (id, otom) => {
      dispatch(editOTOMail(id, otom));
    },

    deleteOTOMail: (id) => {
      dispatch(deleteOTOMail(id));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    otoms: nextState.otom_data.otoms,
    otomsCount: nextState.otom_data.otomsCount,
    initialValuesOtom: nextState.otom_data.initialValuesOtom,
    therapies: nextState.main_data.therapies,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages,
    discounts: nextState.main_data.discounts
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Otoms);
