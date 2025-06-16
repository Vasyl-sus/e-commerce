import React, {Component} from 'react';
import Moment from 'moment';
import Switch from 'react-switch'
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import { Field, reduxForm } from 'redux-form/immutable';
import {getBlogPosts, getCategories, createBlogPost, setInitialValuesBlogPost, editBlogPost, deleteBlogPost} from '../../actions/blogpost_actions';
import NewBlogPost from './new_blogpost.js';
import EditBlogPost from './edit_blogpost.js';
import Select from 'react-select';

class Blog extends Component {
    constructor(props) {
      super(props);

      this.state = {pageNumber:1, selectedCountries: [], pageLimit:15, newModal: false, editModal: false, profile_image:null, big_image:null, sortBy:'title', asc:true};
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

      if (location.query.sort) {
        this.setState({sortBy: location.query.sort})
      }

      if (location.query.search) {
        delete location.query.search;
      }

      if (location.query.sortOpt) {
        if (location.query.sortOpt == 'desc') {
          this.setState({asc: false})
        } else {
          this.setState({asc: true})
        }
      }

      browserHistory.replace(location);
      this.props.getBlogPosts();
      this.props.getCategories();
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
      this.props.getBlogPosts();
    }

    openNewModal() {
      this.setState({newModal: true});
    }

    closeNewModal() {
      this.setState({newModal: false})
    }

    CreateBlogPost(obj, data)
    {
      this.props.createBlogPost(obj, data)
      this.closeNewModal();
    }

    DeleteBlogPost(blogpost)
    {
      var id = blogpost.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati objavo?"))
        this.props.deleteBlogPost(id);
    }

    openEditModal(blogpost) {
      this.setState({editModal: true});
      if(blogpost.profile_image != null || blogpost.big_image != null)
      {
        this.setState({profile_image: blogpost.profile_image});
        this.setState({big_image: blogpost.big_image});
      }
      else {
        this.setState({profile_image: null});
        this.setState({big_image: null});
      }
      this.props.setInitialValuesBlogPost(blogpost);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditBlogPost(data, blogpost)
    {
      var id = blogpost.id;
      this.props.editBlogPost(id, data);
      this.closeEditModal();
    }

    editDirect(data, blogpost) {
      var formData = new FormData();
      if (data.slider != undefined) {
        formData.append('slider', data.slider ? 1 : 0)
      } else {
        formData.append('starred', data.starred ? 1 : 0)
      }

      this.props.editBlogPost(blogpost.id, formData);
    }

    sort(sortBy){
      let location = browserHistory.getCurrentLocation();
      location.query.sort = sortBy;

      if(this.state.sortBy != sortBy){
        this.setState({asc:true});
        this.setState({sortBy});
        location.query.sortOpt = this.state.asc?'asc':'desc';
        browserHistory.replace(location);
        this.props.getBlogPosts();
      }
      else{
        var asc = this.state.asc?false:true;
        this.setState({asc});
        location.query.sortOpt = asc?'asc':'desc';
        browserHistory.replace(location);
        this.props.getBlogPosts();
      }
    }

    renderBlogPosts(blogpost, index){

      return(
        <tr key={index}>
          <td>{blogpost.title}</td>
          <td>
            {blogpost.categories.length > 1 ?
              blogpost.categories.map(c => {return c.label || c}).join(", ")
              :
              blogpost.categories.map(c => {return c.label || c})}
          </td>
          <td>{Moment (blogpost.date_added).format("DD. MM. YYYY")}</td>
          <td>
            <Switch onChange={this.editDirect.bind(this, {slider: !blogpost.slider}, {id: blogpost.id})} checked={blogpost.slider === 1} className="form-white" />
          </td>
          <td>
            <Switch onChange={this.editDirect.bind(this, {starred: !blogpost.starred}, {id: blogpost.id})} checked={blogpost.starred === 1} className="form-white" />
          </td>
          <td>{blogpost.language}</td>
          <td className="center pointer">
            <span onClick={this.openEditModal.bind(this, blogpost)} className="fas fa-pencil-alt"></span>
          </td>
          <td className="center pointer">
            <span onClick={this.DeleteBlogPost.bind(this, blogpost)} className="fas fa-trash"></span>
          </td>
        </tr>
      )
    }

    setSearch(data) {
      data = data.toJS();
      let location = browserHistory.getCurrentLocation();
      this.resetPageNumber(location);
      if(data.searchString=="")
        delete location.query.search;
      else
        location.query.search = data.searchString;
      browserHistory.replace(location);
      this.props.getBlogPosts();
    }

    changeCountriesSelect(event) {
      this.setState({selectedCountries: event})
      var names = event.map(e => { return e.value });
      var location = browserHistory.getCurrentLocation();
      location.query.countries = names;
      browserHistory.replace(location)
      this.props.getBlogPosts();
    }

    render(){
      const { blogposts, handleSubmit, localCountries } = this.props;

      const c = localCountries.map(c => { return {label: c, value: c}});
      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Blog</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-5 search-div">
                <form onSubmit={handleSubmit(this.setSearch.bind(this))}>
                  <Field place="Išči objave..." name="searchString" type="text" component={renderField}></Field>
                  <button type="submit" className="btn btn-secondary btn-search">IŠČI</button>
                </form>
              </div>
              <div className="col-md-3">
                <Select
                  className="form-white"
                  name=""
                  placeholder="Izberi države..."
                  value={this.state.selectedCountries}
                  options={c}
                  multi={true}
                  onChange={this.changeCountriesSelect.bind(this)}
                />
              </div>
              <div className="col-md-4 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj objavo</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8 pointer" onClick={this.sort.bind(this, 'title')}>Naslov
                          {this.state.sortBy == 'title' && this.state.asc==false && <i className="fa fa-chevron-down ml-2" aria-hidden="true"></i>}
                          {this.state.sortBy == 'title' && this.state.asc==true && <i className="fa fa-chevron-up ml-2" aria-hidden="true"></i>}
                        </th>
                        <th className="left table-pad-l-8">Kategorija</th>
                        <th className="left table-pad-l-8 pointer" onClick={this.sort.bind(this, 'date_added')}>Datum
                          {this.state.sortBy == 'date_added' && this.state.asc==false && <i className="fa fa-chevron-down ml-2" aria-hidden="true"></i>}
                          {this.state.sortBy == 'date_added' && this.state.asc==true && <i className="fa fa-chevron-up ml-2" aria-hidden="true"></i>}
                        </th>
                        <th className="left table-pad-l-8 pointer" onClick={this.sort.bind(this, 'slider')}>Mreža
                          {this.state.sortBy == 'slider' && this.state.asc==false && <i className="fa fa-chevron-down ml-2" aria-hidden="true"></i>}
                          {this.state.sortBy == 'slider' && this.state.asc==true && <i className="fa fa-chevron-up ml-2" aria-hidden="true"></i>}
                        </th>
                        <th className="left table-pad-l-8 pointer" onClick={this.sort.bind(this, 'starred')}>Intro
                          {this.state.sortBy == 'starred' && this.state.asc==false && <i className="fa fa-chevron-down ml-2" aria-hidden="true"></i>}
                          {this.state.sortBy == 'starred' && this.state.asc==true && <i className="fa fa-chevron-up ml-2" aria-hidden="true"></i>}
                        </th>
                        <th className="left table-pad-l-8">Jezik</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogposts.map(this.renderBlogPosts.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.blogpostsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal && <NewBlogPost newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} countries={this.props.countries} blog_select_options={this.props.blog_select_options}
          languages={this.props.languages} category={this.props.category} CreateBlogPost={this.CreateBlogPost.bind(this)} therapies={this.props.therapies} accessories={this.props.accessories} />}
          {this.state.editModal ? <EditBlogPost initialValues={Immutable.fromJS(this.props.initialValuesBlogPost)} profile_image={this.state.profile_image} countries={this.props.countries}
          category={this.props.category} therapies={this.props.therapies} accessories={this.props.accessories} big_image={this.state.big_image} languages={this.props.languages} blog_select_options={this.props.blog_select_options}
          editModal={this.state.editModal} closeEditModal={this.closeEditModal.bind(this)} EditBlogPost={this.EditBlogPost.bind(this)}/> : ""}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getBlogPosts: () => {
      dispatch(getBlogPosts())
    },

    createBlogPost: (obj, data) => {
      dispatch(createBlogPost(obj, data))
    },

    setInitialValuesBlogPost: (blogpost) => {
      dispatch(setInitialValuesBlogPost(blogpost));
    },

    editBlogPost: (id, data) => {
      dispatch(editBlogPost(id, data));
    },

    getCategories:()=> {
      dispatch(getCategories());
    },

    deleteBlogPost: (id) => {
      dispatch(deleteBlogPost(id))
    }
  }
}


const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning } }) => (
  <div className={inputclass}>
    <input type={type} placeholder={place} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} new-search-input`} />
  </div>
 )

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    blogposts: nextState.blogpost_data.blogposts,
    blogpostsCount: nextState.blogpost_data.blogpostsCount,
    initialValuesBlogPost: nextState.blogpost_data.initialValuesBlogPost,
    countries: nextState.main_data.countries,
    category: nextState.blogpost_data.blogCategories,
    languages: nextState.main_data.languages,
    accessories: nextState.main_data.accessories,
    therapies: nextState.main_data.therapies,
    localCountries: nextState.main_data.localCountries,
    blog_select_options: [{label: 'terapija', value: 'terapija'}, {label: 'dodatek', value: 'dodatek'}]
  }
}

//export default connect(mapStateToProps, mapDispatchToProps)(Blog);

export default compose(
  reduxForm({
    form: 'BlogForm',
    enableReinitialize: true
  }), connect(mapStateToProps, mapDispatchToProps)
)(Blog);
