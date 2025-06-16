import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import NewInstagramFeed from './new_instagram_feed.js';
import EditInstagramFeed from './edit_instagram_feed.js';
import { getInstagramFeeds, createInstagramFeed, setInitialValuesInstagramFeed, editInstagramFeed,
deleteInstagramFeed } from '../../actions/instagram_feed_actions';

class InstagramFeed extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:15, selectedFeed: null};
    }

    componentDidMount() {
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
      this.props.getInstagramFeeds();
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
      this.props.getInstagramFeeds();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    openEditModal(feed)
    {
      this.props.setInitialValuesInstagramFeed(feed);
      this.setState({selectedFeed: feed})
      this.setState({editModal: true});
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    createNewInstagramFeed(data)
    {
      this.props.createInstagramFeed(data);
      this.closeNewModal();
    }

    EditInstagramFeed(feed, data) {
      var id = feed.id;
      delete feed.id;
      this.props.editInstagramFeed(id, data);
      this.closeEditModal();
    }

    DeleteInstagramFeed(feed)
    {
      var id = feed.id;
      if (window.confirm('Ali ste sigurni da hočete izbrisati instagram feed?'))
        this.props.deleteInstagramFeed(id);
    }

    renderInstagramFeeds(feed, index) {
      return (
        <tr key={index}>
          <td>{feed.profile_image != null ? <img src={feed.profile_image.link} className="accessories-pic-table"/> : ""}</td>
          <td>{feed.name}</td>
          <td>{feed.countries.join(",")}</td>
          <td className={`center pointer`}>
            <span onClick={this.openEditModal.bind(this, feed)} className="fas fa-pencil-alt"></span>
          </td>
          <td className={`center pointer`}>
            <span onClick={this.DeleteInstagramFeed.bind(this, feed)} className="fas fa-trash"></span>
          </td>
        </tr>
      )
    }

    render(){
      const { instagramFeeds, categories } = this.props;
      
      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Instagram feed</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj instagram feed</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Slika</th>
                        <th className="left table-pad-l-8">Naslov</th>
                        <th className="left table-pad-l-8">Države</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instagramFeeds.map(this.renderInstagramFeeds.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.instagramFeedsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewInstagramFeed categories={categories} newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} createNewInstagramFeed={this.createNewInstagramFeed.bind(this)} countries={this.props.countries}
          languages={this.props.languages} accessories={this.props.accessories} therapies={this.props.therapies} options={this.props.options}/>
          {this.state.editModal && <EditInstagramFeed categories={categories} initialValues={Immutable.fromJS(this.state.selectedFeed)} editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)}
          countries={this.props.countries} languages={this.props.languages} EditInstagramFeed={this.EditInstagramFeed.bind(this)} accessories={this.props.accessories} therapies={this.props.therapies} options={this.props.options}/>}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getInstagramFeeds: () => {
      dispatch(getInstagramFeeds())
    },

    createInstagramFeed: (obj) => {
      dispatch(createInstagramFeed(obj))
    },

    setInitialValuesInstagramFeed: (obj) => {
      dispatch(setInitialValuesInstagramFeed(obj))
    },

    editInstagramFeed: (id, obj) => {
      dispatch(editInstagramFeed(id, obj))
    },

    deleteInstagramFeed: (id) => {
      dispatch(deleteInstagramFeed(id))
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    instagramFeeds: nextState.instagram_feed_data.instagramFeeds,
    instagramFeedsCount: nextState.instagram_feed_data.instagramFeedsCount,
    initialValuesInstagramFeed: nextState.instagram_feed_data.initialValuesInstagramFeed,
    countries: nextState.main_data.countries,
    languages: nextState.main_data.languages,
    categories: nextState.main_data.categories,
    accessories: nextState.main_data.accessories,
    therapies: nextState.main_data.therapies,
    options: [{label: 'terapija', value: 'terapija'}, {label: 'dodatek', value: 'dodatek'}]
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InstagramFeed);
