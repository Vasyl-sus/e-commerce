import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import {getColors, createColor, deleteColor} from '../../actions/colors_actions';
import {connect} from 'react-redux';
import NewColor from './new_color.js';

class Colors extends Component {
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
      this.props.getColors();
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
      this.props.getColors();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    CreateColor(obj)
    {
      this.props.createColor(obj);
      this.closeNewModal();
    }

    DeleteColor(color)
    {
      var id = color.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati barvo?"))
        this.props.deleteColor(id);
    }

    renderSingleColor(color, index)
    {
      return(
        <tr key={index}>
          <td>{color.description}</td>
          <td className="center">
          <svg width="20" height="20">
            <rect width="20" height="20" style={{fill: color.value}}/>
          </svg>
          </td>
          <td className="center">
            <span onClick={this.DeleteColor.bind(this, color)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { colors } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Barve naročil</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default">Dodaj barvo</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Opis</th>
                        <th className="center table-pad-l-8">Barva</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colors.map(this.renderSingleColor.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.colorsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewColor newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} CreateColor={this.CreateColor.bind(this)}/>
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getColors: () => {
      dispatch(getColors());
    },

    createColor: (obj) => {
      dispatch(createColor(obj));
    },

    deleteColor: (id) => {
      dispatch(deleteColor(id));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    colors: nextState.colors_data.colors,
    colorsCount: nextState.colors_data.colorsCount
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Colors);
