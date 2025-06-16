import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {getUserGroups, createUserGroup, setInitialValuesUserGroup, editUserGroup, deleteUserGroup} from '../../actions/user_groups_actions';
import {connect} from 'react-redux';
import {routes} from '../../config/constants';
import NewUserGroup from './new_user_group.js';
import EditUserGroup from './edit_user_group.js';

class UserGroups extends Component {
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
      this.props.getUserGroups();
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
      this.props.getUserGroups();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    createNewUserGroup(obj)
    {
      this.props.createUserGroup(obj);
      this.closeNewModal();
    }

    openEditModal(userGroup)
    {
      var permissions = [];

      for (var i = 0; i < userGroup.permissions.length; i++) {
        var category = permissions.find(p => {
          return p == userGroup.permissions[i].category
        })

        if (!category) {
          permissions.push(userGroup.permissions[i].category)
        }
      }

      for (var i = 0; i < routes.length; i++) {
        var permission = permissions.find(p => {
          return p == routes[i].name
        })

        if (permission) {
          routes[i].value = true;
        }
        else {
          routes[i].value = false;
        }
      }

      this.setState({editModal: true});
      this.setState({groupID: userGroup.id})
      this.props.setInitialValuesUserGroup({name: userGroup.name, permissions: routes});
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditUserGroup(id, userGroup)
    {
      this.props.editUserGroup(id, userGroup);
      this.closeEditModal();
    }

    DeleteUserGroup(userGroup)
    {
      var id = userGroup.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati uporabniško skupino?"))
        this.props.deleteUserGroup(id);
    }

    renderSingleUserGroup(userGroup, index)
    {
      return(
        <tr key={index}>
          <td>{userGroup.name}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, userGroup)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteUserGroup.bind(this, userGroup)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { admingroups } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Uporabniške skupine</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj skupino</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Ime skupine</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admingroups.map(this.renderSingleUserGroup.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.admingroupsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal ? <NewUserGroup newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewUserGroup={this.createNewUserGroup.bind(this)} /> : ""}
          {this.state.editModal ? <EditUserGroup initialValues={Immutable.fromJS(this.props.initialValuesUserGroup)} editModal={this.state.editModal}
          closeEditModal={this.closeEditModal.bind(this)} EditUserGroup={this.EditUserGroup.bind(this)} groupID={this.state.groupID}/> : ""}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getUserGroups: () => {
      dispatch(getUserGroups());
    },

    createUserGroup: (obj) => {
      dispatch(createUserGroup(obj));
    },

    setInitialValuesUserGroup: (userGroup) => {
      dispatch(setInitialValuesUserGroup(userGroup));
    },

    editUserGroup: (id, userGroup) => {
      dispatch(editUserGroup(id, userGroup));
    },

    deleteUserGroup: (id) => {
      dispatch(deleteUserGroup(id));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    admingroups: nextState.user_groups_data.admingroups,
    admingroupsCount: nextState.user_groups_data.admingroupsCount,
    initialValuesUserGroup: nextState.user_groups_data.initialValuesUserGroup
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserGroups);
