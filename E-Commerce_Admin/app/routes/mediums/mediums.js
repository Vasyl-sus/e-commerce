import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import NewMedium from './new_medium.js';
import EditMedium from './edit_medium.js';
import { getMediums, createMedium, EditSingleMedium, setInitialValuesMedium, DeleteMedium } from '../../actions/mediums_actions';

class Mediums extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:15, selectedMedium: null};
    }

    componentDidMount() {
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
      this.props.getMediums();
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
      this.props.getMediums();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    openEditModal(obj)
    {
      this.setState({editModal: true, selectedMedium: obj});
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    createMedium(data)
    {
      this.props.createMedium(data);
      this.closeNewModal();
    }

    EditSingleMedium(medium, data) {
      var id = medium.id;
      delete medium.id;
      this.props.EditSingleMedium(id, data);
      this.closeEditModal();
    }

    DeleteMedium(medium)
    {
      var id = medium.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati medija?"))
        this.props.DeleteMedium(id);
    }

    renderMediums(medium, index) {
      return (
        <tr key={index}>
          <td>{medium.profile_image ? <img src={medium.profile_image.link} className="accessories-pic-table"/> : ""}</td>
          <td>{medium.name}</td>
          <td>{medium.sort_order}</td>
          <td>{medium.country}</td>
          <td>{medium.language}</td>
          <td className={`center pointer`}>
            <span onClick={this.openEditModal.bind(this, medium)} className="fas fa-pencil-alt"></span>
          </td>
          <td className={`center pointer`}>
            <span onClick={this.DeleteMedium.bind(this, medium)} className="fas fa-trash"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { mediums, mediumsCount } = this.props;
      
      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Mediji o nas</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj medij</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Slika</th>
                        <th className="left table-pad-l-8">Naslov</th>
                        <th className="left table-pad-l-8">Zap. št.</th>
                        <th className="left table-pad-l-8">Država</th>
                        <th className="left table-pad-l-8">Jezik</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mediums.map(this.renderMediums.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={mediumsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal && <NewMedium newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createMedium={this.createMedium.bind(this)} countries={this.props.countries} languages={this.props.languages}/>}
          {this.state.editModal && <EditMedium initialValues={Immutable.fromJS(this.state.selectedMedium)} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} countries={this.props.countries} languages={this.props.languages} EditSingleMedium={this.EditSingleMedium.bind(this)} />}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getMediums: () => {
      dispatch(getMediums())
    },

    createMedium: (obj) => {
      dispatch(createMedium(obj))
    },

    setInitialValuesMedium: (obj) => {
      dispatch(setInitialValuesMedium(obj))
    },

    EditSingleMedium: (id, obj) => {
      dispatch(EditSingleMedium(id, obj))
    },

    DeleteMedium: (id) => {
      dispatch(DeleteMedium(id))
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    mediums: nextState.mediums.mediums,
    mediumsCount: nextState.mediums.mediumsCount,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Mediums);
