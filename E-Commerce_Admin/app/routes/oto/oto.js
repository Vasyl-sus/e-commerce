import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import {connect} from 'react-redux';
import {getOTOs, createOto, deleteOto, editOto} from '../../actions/oto_actions';
import NewOto from './new_oto.js';
import EditOto from './edit_oto.js';

class Oto extends Component {
    constructor(props) {
      super(props);

      this.state = {pageNumber:1, pageLimit:15, newModal: false, editModal: false, opened:{}};
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
      this.props.getOTOs();
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
      this.props.getOTOs();
    }

    openNewModal() {
      this.setState({newModal: true});
    }

    closeNewModal() {
      this.setState({newModal: false})
    }

    createOto(obj)
    {
      this.props.createOto(obj)
      this.closeNewModal();
    }

    editOto(obj)
    {
      var id = obj.id;
      delete obj.id;
      this.props.editOto(id,obj);
      this.closeEditModal();
    }

    deleteOto(id)
    {
      if(window.confirm("Ali ste sigurni da hočete izbrisati OTO?"))
        this.props.deleteOto(id);
    }

    openEditModal(row) {
      this.setState({editModal: true});
      row.offer_on = row.offer_on.map(r=>{return {label:r.name, value:r.id}})
      row.accessories = row.accessories.map(r=>{return {label:r.name, value:r.id}})
      row.therapies = row.therapies.map(r=>{return {label:r.name, value:r.id}})
      this.setState({opened:row})
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    renderOtos(row, index){
      return(
        <tr key={index}>
          <td className="center">{row.title}</td>
          <td>{row.offer_on.map(o => {return o.name}).join(', ')}</td>
          <td className="center">{row.time}</td>
          <td className="center">{row.discount}</td>
          <td className="center">{row.country}</td>
          <td>
            <b>Terapije:</b> {row.therapies.map(o => {return o.name}).join(', ')}<br/>
            <b>Dodatki:</b> {row.accessories.map(o => {return o.name}).join(', ')}<br/>
          </td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, row)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.deleteOto.bind(this, row.id)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const {otos} = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">One Time Offers</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default">Dodaj OTO</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="center table-pad-l-8">Naziv</th>
                        <th className="left table-pad-l-8">Za terapije</th>
                        <th className="center table-pad-l-8">Čas trajanja</th>
                        <th className="center table-pad-l-8">Popust</th>
                        <th className="center table-pad-l-8">Država</th>
                        <th className="left table-pad-l-8">OTO ponudba</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otos.map(this.renderOtos.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.otosCount} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal && <NewOto newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} countries={this.props.countries} paymentmethods={this.props.paymentmethods}
          languages={this.props.languages} category={this.props.category} createOto={this.createOto.bind(this)} therapies={this.props.therapies} accessories={this.props.accessories} />}
          {this.state.editModal && <EditOto initialValues={this.state.opened} countries={this.props.countries} category={this.props.category} therapies={this.props.therapies} accessories={this.props.accessories}
          languages={this.props.languages} paymentmethods={this.props.paymentmethods} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} editOto={this.editOto.bind(this)}/>}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    createOto: (obj) => {
      dispatch(createOto(obj))
    },

    deleteOto: (id) => {
      dispatch(deleteOto(id))
    },

    editOto: (id, obj) => {
      dispatch(editOto(id, obj))
    },

    getOTOs: () => {
      dispatch(getOTOs())
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    otos: nextState.oto_data.otos,
    otosCount: nextState.oto_data.otosCount,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages,
    accessories: nextState.main_data.accessories,
    paymentmethods: nextState.main_data.paymentmethods,
    therapies: nextState.main_data.therapies,
    blog_select_options: [{label: 'terapija', value: 'terapija'}, {label: 'dodatek', value: 'dodatek'}]
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Oto);
