import React, {Component} from 'react';
import { browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {getAdmins, createAdmin, setInitialValuesAdmin, editAdmin, deleteAdmin} from '../../actions/admins_actions';
import {connect} from 'react-redux';
import NewAdmin from './new_admin.js';
import EditAdmin from './edit_admin.js';

class Admins extends Component {
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
      this.props.getAdmins();
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
      this.props.getAdmins();
    }

    openNewModal() {
      this.setState({newModal: true});
    }

    closeNewModal() {
      this.setState({newModal: false})
    }

    createNewAdmin(obj) {
      this.props.createAdmin(obj, this.props.user, this.props.socket);
      this.closeNewModal();
    }

    openEditModal(admin)
    {
      this.setState({editModal: true});
      this.props.setInitialValuesAdmin(admin);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditExistingAdmin(admin)
    {
      var id = admin.id;
      delete admin.id;
      this.props.editAdmin(id, admin,this.props.user, this.props.socket);
      this.closeEditModal();
    }

    DeleteAdmin(admin)
    {
      var id = admin.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati uporabnika?"))
        this.props.deleteAdmin(id,this.props.user, this.props.socket);
    }

    renderSingleAdmin(admin, index)
    {
      return(
        <tr key={index}>
          <td>{admin.first_name}</td>
          <td>{admin.last_name}</td>
          <td>{admin.username}</td>
          <td>{admin.email}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, admin)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteAdmin.bind(this, admin)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { admins } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Uporabniki</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj uporabnik</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                      <th className="left table-pad-l-8">Ime</th>
                      <th className="left table-pad-l-8">Priimek</th>
                      <th className="left table-pad-l-8">Uporabniško ime</th>
                      <th className="left table-pad-l-8">E-pošta</th>
                      <th className="center table-pad-l-8">Uredi</th>
                      <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map(this.renderSingleAdmin.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.adminsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewAdmin admingroups={this.props.admingroups} newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewAdmin={this.createNewAdmin.bind(this)} countries={this.props.countries}/>
          <EditAdmin initialValues={Immutable.fromJS(this.props.initialValuesAdmin)} admingroups={this.props.admingroups} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)}
          EditExistingAdmin={this.EditExistingAdmin.bind(this)} countries={this.props.countries}/>
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getAdmins: () => {
      dispatch(getAdmins());
    },

    createAdmin: (obj,user,socket) => {
      dispatch(createAdmin(obj,user,socket));
    },

    setInitialValuesAdmin: (admin) => {
      dispatch(setInitialValuesAdmin(admin));
    },

    editAdmin: (id, admin,user,socket) => {
      dispatch(editAdmin(id, admin,user,socket));
    },

    deleteAdmin: (id,user,socket) => {
      dispatch(deleteAdmin(id,user,socket));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    admins: nextState.admins_data.admins,
    adminsCount: nextState.admins_data.adminsCount,
    initialValuesAdmin: nextState.admins_data.initialValuesAdmin,
    admingroups: nextState.main_data.admingroups,
    countries: nextState.main_data.countries,
    user: nextState.main_data.user,
    socket: nextState.main_data.socket
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Admins);
