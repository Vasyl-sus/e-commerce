import React, {Component} from 'react';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {getMessageTemplates, createMessageTemplate, setInitialValuesMessageTemplate, editMessageTemplate, deleteMessageTemplate} from '../../actions/message_templates_actions';
import {connect} from 'react-redux';
import NewMessageTemplate from './new_message_template.js';
import EditMessageTemplate from './edit_message_template';

class MessageTemplates extends Component {
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
      this.props.getMessageTemplates();
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
      this.props.getMessageTemplates();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    createNewMessageTemplate(obj)
    {
      this.props.createMessageTemplate(obj);
      this.closeNewModal();
    }

    openEditModal(messageTemplate)
    {
      this.setState({editModal: true});
      this.props.setInitialValuesMessageTemplate(messageTemplate);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    editExistingMessageTemplate(messageTemplate)
    {
      var id = messageTemplate.id;
      delete messageTemplate.id;
      this.props.editMessageTemplate(id, messageTemplate);
      this.closeEditModal();
    }

    DeleteMessageTemplate(messageTemplate)
    {
      var id = messageTemplate.id;
      this.props.deleteMessageTemplate(id);
    }

    renderSingleMessageTemplate(messageTemplate, index)
    {
      return(
        <tr key={index}>
          <td>{messageTemplate.title}</td>
          <td>{messageTemplate.country}</td>
          <td><span dangerouslySetInnerHTML={{__html:messageTemplate.text}}></span></td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, messageTemplate)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteMessageTemplate.bind(this, messageTemplate)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { smstemplates } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Message templates</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj template</button>
              </div>
            </div>
            <div className="row table-cust table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th className="left table-pad-l-8">Naziv</th>
                    <th className="left table-pad-l-8">Država</th>
                    <th className="left table-pad-l-8">Vsebina</th>
                    <th className="center table-pad-l-8">Uredi</th>
                    <th className="center table-pad-l-8">Izbriši</th>
                  </tr>
                </thead>
                <tbody>
                  {smstemplates.map(this.renderSingleMessageTemplate.bind(this))}
                </tbody>
              </table>
              <div className="box-footer w-100">
                <div className="row w-100">
                  <div className="col-sm-6 col-xs-8 w-100">
                    <div className="pagination-block">
                      <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.smstemplatesCount}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewMessageTemplate countries={this.props.countries} newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewMessageTemplate={this.createNewMessageTemplate.bind(this)} />
          <EditMessageTemplate initialValues={Immutable.fromJS(this.props.initialValuesMessageTemplate)} countries={this.props.countries} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} editExistingMessageTemplate={this.editExistingMessageTemplate.bind(this)} />
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getMessageTemplates: () => {
      dispatch(getMessageTemplates());
    },

    createMessageTemplate: (obj) => {
      dispatch(createMessageTemplate(obj));
    },

    setInitialValuesMessageTemplate: (messageTemplate) => {
      dispatch(setInitialValuesMessageTemplate(messageTemplate));
    },

    editMessageTemplate: (id, messageTemplate) => {
      dispatch(editMessageTemplate(id, messageTemplate));
    },

    deleteMessageTemplate: (id) => {
      dispatch(deleteMessageTemplate(id));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    smstemplates: nextState.message_templates_data.smstemplates,
    smstemplatesCount: nextState.message_templates_data.smstemplatesCount,
    initialValuesMessageTemplate: nextState.message_templates_data.initialValuesMessageTemplate,
    countries: nextState.main_data.countries
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageTemplates);
