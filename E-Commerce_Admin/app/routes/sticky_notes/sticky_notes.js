import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import Switch from 'react-switch';
import {connect} from 'react-redux';
import {getStickyNotes, createStickyNote, setInitialValuesStickyNote, editStickyNote, deleteStickyNote} from '../../actions/sticky_notes_actions';
import NewStickyNote from './new_sticky_note.js';
import EditStickyNote from './edit_sticky_note.js'

class StickyNotes extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:15, initData: {}};
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
      this.props.getStickyNotes();
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
      this.props.getStickyNotes();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    createNewStickyNote(obj)
    {
      this.props.createStickyNote(obj);
      this.closeNewModal();
    }

    openEditModal(stickynote)
    {
      this.setState({editModal: true, initData: stickynote});
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditExistingStickyNote(stickynote)
    {
      var id = stickynote.id;
      delete stickynote.id;
      this.props.editStickyNote(id, stickynote);
      this.closeEditModal();
    }

    DeleteStickyNote(stickynote)
    {
      var id = stickynote.id;
      if(window.confirm("Ali ste prepričani, da želite izbrisati sticky bar?"))
        this.props.deleteStickyNote(id);
    }

    renderSingleStickyNote(stickynote, index)
    {
      return(
        <tr key={index}>
          <td>{stickynote.content}</td>
          <td><Switch checked={stickynote.active === 1} disabled={true} className="form-white" /></td>
          <td>{stickynote.language}</td>
          <td>{stickynote.country}</td>
          <td>{stickynote.link}</td>
          <td>{stickynote.button_text}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, stickynote)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteStickyNote.bind(this, stickynote)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { stickynotes } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Sticky bar</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj sticky bar</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Vsebina</th>
                        <th className="left table-pad-l-8">Aktivni</th>
                        <th className="left table-pad-l-8">Jezik</th>
                        <th className="left table-pad-l-8">Država</th>
                        <th className="left table-pad-l-8">Povezava</th>
                        <th className="left table-pad-l-8">Vsebina gumba</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stickynotes.map(this.renderSingleStickyNote.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.stickynotesCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewStickyNote countries={this.props.countries} newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)}
          createNewStickyNote={this.createNewStickyNote.bind(this)} languages={this.props.languages}/>
          {this.state.editModal && <EditStickyNote initialValues={Immutable.fromJS(this.state.initData)} countries={this.props.countries} languages={this.props.languages}
          editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} EditExistingStickyNote={this.EditExistingStickyNote.bind(this)} />}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getStickyNotes: () => {
      dispatch(getStickyNotes());
    },

    createStickyNote: (obj) => {
      dispatch(createStickyNote(obj))
    },

    setInitialValuesStickyNote: (stickynote) => {
      dispatch(setInitialValuesStickyNote(stickynote));
    },

    editStickyNote: (id, stickynote) => {
      dispatch(editStickyNote(id, stickynote));
    },

    deleteStickyNote: (id) => {
      dispatch(deleteStickyNote(id));
    },
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    stickynotes: nextState.sticky_notes_data.stickynotes,
    stickynotesCount: nextState.sticky_notes_data.stickynotesCount,
    initialValuesStickyNotes: nextState.sticky_notes_data.initialValuesStickyNotes,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StickyNotes);
