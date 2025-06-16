import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import {getACMail, createACMail, setInitialValuesACMail, editACMail, deleteACMail} from '../../actions/ac_mails_actions';
import NewACMail from './new_ac_mail.js';
import EditACMail from './edit_ac_mail.js';

class ACMails extends Component {
    constructor(props) {
      super(props);

      this.state = {pageNumber:1, pageLimit:20, newModal:false, editModal:false, searchString:''};
    }

    componentDidMount(){
      var location = browserHistory.getCurrentLocation();

      if(location.query.pageLimit)
        this.setState({pageLimit: location.query.pageLimit});
      else
        location.query.pageLimit = 20;

      if(location.query.pageNumber)
        this.setState({pageNumber: location.query.pageNumber});
      else
        location.query.pageNumber = 1;

      browserHistory.replace(location);
      this.props.getACMail();
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
      this.props.getACMail();
      this.setState({pageNumber})
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
      this.setState({editModal: true});
      this.props.setInitialValuesACMail(obj);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    createACMail(data) {
      this.props.createACMail(data);
      this.closeNewModal();
    }

    editACMail(id, obj) {
      this.props.editACMail(id, obj);
      this.closeEditModal();
    }

    deleteACMail(obj) {
      if(window.confirm("Ali ste sigurni da hočete izbrisati abandoned cart maila?"))
        this.props.deleteACMail(obj.id);
    }

    renderACMail(acMail, index){
      return(
        <tr key={index}>
          <td>{acMail.title}</td>
          <td>{acMail.country}</td>
          <td>{acMail.lang}</td>
          <td onClick={this.openEditModal.bind(this, acMail)} className="align-center"><a className="pointer"><i className="fa fa-pencil-alt"></i></a></td>
          <td onClick={this.deleteACMail.bind(this, acMail)} className="align-center"><a className="pointer"><i className="fa fa-trash"></i></a></td>
        </tr>
      )
    }

    render(){
      const { acMails } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Abandoned cart maili</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button className="btn btn-default" onClick={this.openNewModal.bind(this)}> Dodaj mail</button>
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
                      {acMails.map(this.renderACMail.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.acMailsCount} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal ? <NewACMail newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} countries={this.props.countries}
          languages={this.props.languages} acMails={this.props.acMails} discounts={this.props.discounts} createACMail={this.createACMail.bind(this)} /> : ""}
          {this.state.editModal ? <EditACMail initialValues={Immutable.fromJS(this.props.initialValuesACMail)} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)}
          countries={this.props.countries} languages={this.props.languages} acMails={this.props.acMails} discounts={this.props.discounts} editACMail={this.editACMail.bind(this)} /> : ""}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getACMail: () => {
      dispatch(getACMail());
    },

    createACMail: (obj) => {
      dispatch(createACMail(obj))
    },

    setInitialValuesACMail: (obj) => {
      dispatch(setInitialValuesACMail(obj))
    },

    editACMail: (id, obj) => {
      dispatch(editACMail(id, obj))
    },

    deleteACMail: (id) => {
      dispatch(deleteACMail(id))
    }
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    acMails: nextState.ac_mail_data.acMails,
    acMailsCount: nextState.ac_mail_data.acMailsCount,
    initialValuesACMail: nextState.ac_mail_data.initialValuesACMail,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages,
    discounts: nextState.main_data.discounts
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ACMails);
