import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {getUTMS, createUTM, setInitialValuesUTM, editUTM, deleteUTM} from '../../actions/utm_actions';
import {connect} from 'react-redux';
import NewUTM from './new_utm.js';
import EditUTM from './edit_utm.js';

class UTMS extends Component {
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
      this.props.getUTMS();
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
      this.props.getUTMS();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    createNewUTM(obj)
    {
      this.props.createUTM(obj);
      this.closeNewModal();
    }

    openEditModal(utm)
    {
      this.setState({editModal: true});
      this.props.setInitialValuesUTM(utm);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditExistingUTM(utm)
    {
      var id = utm.id;
      delete utm.id;
      this.props.editUTM(id, utm);
      this.closeEditModal();
    }

    DeleteUTM(utm)
    {
      var id = utm.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati UTM mediuma?"))
        this.props.deleteUTM(id);
    }

    renderSingleUTM(utm, index)
    {
      return(
        <tr key={index}>
          <td>{utm.name}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, utm)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteUTM.bind(this, utm)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { utmmedia } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">UTM mediumi</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj UTM medium</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">UTM medium</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {utmmedia.map(this.renderSingleUTM.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.utmmediaCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewUTM newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewUTM={this.createNewUTM.bind(this)} />
          <EditUTM initialValues={Immutable.fromJS(this.props.initialValuesUTM)} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} EditExistingUTM={this.EditExistingUTM.bind(this)} />
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getUTMS: () => {
      dispatch(getUTMS());
    },

    createUTM: (obj) => {
      dispatch(createUTM(obj));
    },

    setInitialValuesUTM: (utm) => {
      dispatch(setInitialValuesUTM(utm));
    },

    editUTM: (id, utm) => {
      dispatch(editUTM(id, utm));
    },

    deleteUTM: (id) => {
      dispatch(deleteUTM(id));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    utmmedia: nextState.utms_data.utmmedia,
    utmmediaCount: nextState.utms_data.utmmediaCount,
    initialValuesUTM: nextState.utms_data.initialValuesUTM
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UTMS);
