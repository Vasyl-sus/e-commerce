import React, {Component} from 'react';
import { browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import {getBadges, createBadge, editBadge, deleteBadge, setInitialValuesBadge} from '../../actions/badges_actions';
import NewBadge from './new_badge.js';
import EditBadge from './edit_badge.js';

class Badges extends Component {
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
      this.props.getBadges();
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
      this.props.getBadges();
    }

    createNewBadge(obj, data)
    {
      this.props.createBadge(obj, data)
      this.closeNewModal();
    }

    openNewModal() {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    openEditModal(badge) {
      this.setState({editModal: true});
      this.props.setInitialValuesBadge(badge);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditBadge(badge)
    {
      var id = badge.id;
      delete badge.id;
      this.props.editBadge(id, badge);
      this.closeEditModal();
    }

    DeleteBadge(badge)
    {
      if(window.confirm("Ali ste sigurni da hočete izbrisati značko?"))
        this.props.deleteBadge(badge.id);
    }

    renderBadges(badge, index)
    {
      return (
        <tr key={index}>
          <td>{badge.name}</td>
          <td>
            <svg width="20" height="20">
              <rect width="20" height="20" style={{fill: badge.color}}/>
            </svg>
          </td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, badge)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteBadge.bind(this, badge)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const {badges} = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Značke uporabnikov</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj značko</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Naziv</th>
                        <th className="left table-pad-l-8">Barva</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {badges.map(this.renderBadges.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.badgesCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewBadge newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewBadge={this.createNewBadge.bind(this)}/>
          <EditBadge initialValues={Immutable.fromJS(this.props.initialValuesBadges)} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} EditBadge={this.EditBadge.bind(this)}/>
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getBadges: () => {
      dispatch(getBadges())
    },

    createBadge: (obj, data) => {
      dispatch(createBadge(obj, data))
    },

    setInitialValuesBadge: (badge) => {
      dispatch(setInitialValuesBadge(badge))
    },

    editBadge: (id, badge) => {
      dispatch(editBadge(id, badge))
    },

    deleteBadge: (id) => {
      dispatch(deleteBadge(id))
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    badges: nextState.badges_data.badges,
    badgesCount: nextState.badges_data.badgesCount,
    initialValuesBadges: nextState.badges_data.initialValuesBadges
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Badges);
