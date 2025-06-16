import React, {Component} from 'react';
import Switch from 'react-switch';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import {getGifts, createGift, setInitialValuesGift, editGift, deleteGift} from '../../actions/gift_actions';
import NewGift from './new_gift.js';
import EditGift from './edit_gift.js';

class Gifts extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:15, active:1};
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

      if(location.query.active)
        this.setState({active: location.query.active});
      else
        location.query.active = 1;

      browserHistory.replace(location);
      this.props.getGifts();
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
      this.props.getGifts();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    createNewGift(obj)
    {
      this.props.createGift(obj);
      this.closeNewModal();
    }

    openEditModal(gift)
    {
      this.setState({editModal: true});
      this.props.setInitialValuesGift(gift);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditExistingGift(gift)
    {
      var id = gift.id;
      delete gift.id;
      this.props.editGift(id, gift);
      this.closeEditModal();
    }

    DeleteGift(gift)
    {
      var id = gift.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati darilo?"))
        this.props.deleteGift(id);
    }

    renderGifts(gift, index){
      return(
        <tr key={index}>
          <td>{gift.name}</td>
          <td><Switch checked={gift.active} className="form-white" /></td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, gift)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteGift.bind(this, gift)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const {gifts} = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Darila</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj darilo</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Naziv</th>
                        <th className="left table-pad-l-8">Aktivno</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gifts.map(this.renderGifts.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.giftsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewGift newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} countries={this.props.countries} languages={this.props.languages} createNewGift={this.createNewGift.bind(this)} />
          {this.props.initialValuesGift && <EditGift languages={this.props.languages} countries={this.props.countries} initialValues={Immutable.fromJS(this.props.initialValuesGift)} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} EditExistingGift={this.EditExistingGift.bind(this)} />}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getGifts: () => {
      dispatch(getGifts())
    },

    createGift: (obj) => {
      dispatch(createGift(obj));
    },

    setInitialValuesGift: (gift) => {
      dispatch(setInitialValuesGift(gift));
    },

    editGift: (id, gift) => {
      dispatch(editGift(id, gift));
    },

    deleteGift: (id) => {
      dispatch(deleteGift(id));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    gifts: nextState.gifts_data.gifts,
    giftsCount: nextState.gifts_data.giftsCount,
    initialValuesGift: nextState.gifts_data.initialValuesGift,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Gifts);
