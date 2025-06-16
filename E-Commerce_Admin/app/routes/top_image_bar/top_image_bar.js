import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import Switch from 'react-switch';
import {connect} from 'react-redux';
import NewTopImageBar from './new_top_image_bar.js';
import EditTopImageBar from './edit_top_image_bar.js';
import {getBillboard, createBillboard, setInitialValuesBillboard, editBillboard, deleteBillboard} from '../../actions/top_image_bar_actions';

class TopImageBar extends Component {
    constructor(props) {
      super(props);

      this.state = {selectedBilboard: null, pageNumber:1, pageLimit:15, newModal: false, editModal: false};
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
      this.props.getBillboard();
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
      this.props.getBillboard();
    }

    openNewModal() {
      this.setState({newModal: true});
    }

    closeNewModal() {
      this.setState({newModal: false})
    }

    openEditModal(billboard)
    {
      this.setState({editModal: true, selectedBilboard: billboard});
      this.props.setInitialValuesBillboard(billboard);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    createNewBillboard(data)
    {
      this.props.createBillboard(data);
      this.closeNewModal();
    }

    EditBillboard(billboard, data) {
      var id = billboard.id;
      delete billboard.id;
      this.props.editBillboard(id, data);
      this.closeEditModal();
    }

    DeleteBillboard(billboard)
    {
      var id = billboard.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati sliderja?"))
        this.props.deleteBillboard(id);
    }

    renderBillboards(billboard, index){
      return(
        <tr key={index}>
          <td>{billboard.img_link != null ? <img src={billboard.img_link} className="accessories-pic-table"/> : ""}</td>
          <td><Switch checked={billboard.active} disabled={true} className="form-white" /></td>
          <td>{billboard.lang}</td>
          <td>{billboard.country}</td>
          <td className={`center pointer`}>
            <span onClick={this.openEditModal.bind(this, billboard)} className="fas fa-pencil-alt"></span>
          </td>
          <td className={`center pointer`}>
            <span onClick={this.DeleteBillboard.bind(this, billboard)} className="fas fa-trash"></span>
          </td>
        </tr>
      )
    }

    render(){
      const {billboards} = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Naslovni slider</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj naslovni slider</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Slika</th>
                        <th className="left table-pad-l-8">Aktivni</th>
                        <th className="left table-pad-l-8">Jezik</th>
                        <th className="left table-pad-l-8">Država</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billboards.map(this.renderBillboards.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.billboardsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewTopImageBar newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewBillboard={this.createNewBillboard.bind(this)}
          countries={this.props.countries} languages={this.props.languages}/>
          {this.state.editModal && <EditTopImageBar initialValues={Immutable.fromJS(this.state.selectedBilboard)} editModal={this.state.editModal}
          closeEditModal={this.closeEditModal.bind(this)} EditBillboard={this.EditBillboard.bind(this)}
          countries={this.props.countries} languages={this.props.languages}/>}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getBillboard: () => {
      dispatch(getBillboard());
    },

    createBillboard: (data) => {
      dispatch(createBillboard(data));
    },

    setInitialValuesBillboard: (obj) => {
      dispatch(setInitialValuesBillboard(obj))
    },

    editBillboard: (data, id) => {
      dispatch(editBillboard(data, id))
    },

    deleteBillboard: (id) => {
      dispatch(deleteBillboard(id))
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    billboards: nextState.top_image_bar_data.billboards,
    billboardsCount: nextState.top_image_bar_data.billboardsCount,
    initialValuesBillboard: nextState.top_image_bar_data.initialValuesBillboard,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages,
    socket: nextState.main_data.socket,
    user: nextState.main_data.user
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TopImageBar);
