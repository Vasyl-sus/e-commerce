import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import {getBlogCategories, createBlogCategory, setInitialValuesBlogCategory, editBlogCategory, deleteBlogCategory} from '../../actions/blog_categories_actions';
import NewBlogCategory from './new_blog_category.js';
import EditBlogCategory from './edit_blog_category.js';

class BlogCategories extends Component {
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
      this.props.getBlogCategories();
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
      this.props.getBlogCategories();
    }

    openNewModal() {
      this.setState({newModal: true});
    }

    closeNewModal() {
      this.setState({newModal: false})
    }

    CreateBlogCategory(obj)
    {
      this.props.createBlogCategory(obj)
      this.closeNewModal();
    }

    DeleteBlogCategory(blog_category)
    {
      var id = blog_category.id;
      if(window.confirm("Ali ste sigurni da hočete izbrisati blog kategorijo?"))
        this.props.deleteBlogCategory(id);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    openEditModal(blog_category)
    {
      this.setState({editModal: true});
      this.props.setInitialValuesBlogCategory(blog_category);
    }

    EditBlogCategory(blog_category)
    {
      var id = blog_category.id;
      delete blog_category.id;
      this.props.editBlogCategory(id, blog_category);
      this.closeEditModal();
    }

    renderBlogCategories(blog_category, index){
      return(
        <tr key={index}>
          <td>{blog_category.name}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, blog_category)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.DeleteBlogCategory.bind(this, blog_category)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const {blogCategories, languages} = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Blog kategorije</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-12 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj kategorijo</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Kategorija</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogCategories.map(this.renderBlogCategories.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.blogCategoriesCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NewBlogCategory languages={languages} newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} CreateBlogCategory={this.CreateBlogCategory.bind(this)} />
          {this.state.editModal ? <EditBlogCategory languages={languages} initialValues={Immutable.fromJS(this.props.initialValuesBlogCategory)} editModal={this.state.editModal}
          closeEditModal={this.closeEditModal.bind(this)} EditBlogCategory={this.EditBlogCategory.bind(this)} /> : ""}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getBlogCategories: () => {
      dispatch(getBlogCategories())
    },

    createBlogCategory: (obj) => {
      dispatch(createBlogCategory(obj))
    },

    setInitialValuesBlogCategory: (obj) => {
      dispatch(setInitialValuesBlogCategory(obj));
    },

    editBlogCategory: (id, obj) => {
      dispatch(editBlogCategory(id, obj));
    },

    deleteBlogCategory: (id) => {
      dispatch(deleteBlogCategory(id))
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    blogCategories: nextState.blog_categories_data.blogCategories,
    languages: nextState.main_data.languages,
    blogCategoriesCount: nextState.blog_categories_data.blogCategoriesCount,
    initialValuesBlogCategory: nextState.blog_categories_data.initialValuesBlogCategory
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BlogCategories);
