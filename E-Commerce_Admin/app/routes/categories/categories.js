import React, {Component} from 'react';
import Immutable from 'immutable';
import "rc-pagination/assets/index.css";
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import {connect} from 'react-redux';
import { getProductCategories, createProductCategory, setInitialValuesProductCategory,
editProductCategory, deleteProductCategory } from '../../actions/categories_actions.js'
import {getLanguages} from '../../actions/languages_actions';
import NewCategory from './new_category.js';
import EditCategory from './edit_category.js';

class ProductCategories extends Component {
  constructor(props) {
    super(props);

    this.state = {pageLimit: 20, pageNumber: 1, newModal: false, editModal: false, thisCategory: null};
  }

  componentDidMount()
  {
    let location = browserHistory.getCurrentLocation();

    if (location.query.pageNumber) {
      this.setState({pageNumber: location.query.pageNumber})
    } else {
      location.query.pageNumber = 1
    }

    if (location.query.pageLimit) {
      this.setState({pageLimit: location.query.pageLimit})
    } else {
      location.query.pageLimit = 20
    }

    browserHistory.replace(location)
    this.props.getProductCategories();
    this.props.getLanguages();
  };

  pageChange(pageNumber) {
    let location = browserHistory.getCurrentLocation();
    location.query.pageNumber = pageNumber;
    browserHistory.replace(location);
    this.props.getProductCategories();
    this.setState({pageNumber});
  }

  openNewModal() {
    this.setState({newModal: true})
  }

  closeNewModal() {
    this.setState({newModal: false})
  }

  openEditModal(category) {
    this.setState({editModal: true, thisCategory: category})
    // this.props.setInitialValuesProductCategory(category);
  }

  closeEditModal() {
    this.setState({editModal: false})
  }

  CreateProductCategory(obj) {
    this.props.createProductCategory(obj);
    this.closeNewModal();
  }

  EditProductCategory(id, obj) {
    this.props.editProductCategory(id, obj);
    this.closeEditModal();
  }

  DeleteProductCategory(obj) {
    var id = obj.id;
    if(window.confirm("Ali ste sigurni da hočete izbrisati kategorijo produkta?"))
      this.props.deleteProductCategory(id);
  }

  renderProductCategory(category, index) {
    return (
      <tr key={index}>
        <td>{category.name}</td>
        <td>{category.sort_order}</td>
        <td onClick={this.openEditModal.bind(this, category)} className="center"><a className="pointer"><i className="fas fa-pencil-alt"></i></a></td>
        <td onClick={this.DeleteProductCategory.bind(this, category)} className="center"><a className="pointer"><i className="fas fa-trash"></i></a></td>
      </tr>
    )
  }

  render(){
    const { categories } = this.props;

    return (
      <div className="content-wrapper container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h2 className="box-title">Kategorije produktov</h2>
          </div>
        </div>
        <div className="box box-default">
          <div className="row main-box-head">
            <div className="col-md-12 right">
              <button onClick={this.openNewModal.bind(this)} className="btn btn-default">Dodaj kategorijo</button>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive no-padding">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th className="left table-pad-l-8">Kategorija</th>
                      <th className="left table-pad-l-8">Zap. št.</th>
                      <th className="center table-pad-l-8">Uredi</th>
                      <th className="center table-pad-l-8">Izbriši</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(this.renderProductCategory.bind(this))}
                  </tbody>
                </table>
              </div>
              <div className="box-footer w-100 pb-3">
                <div className="row w-100">
                  <div className="col-sm-6 col-xs-8 w-100">
                    <div className="pagination-block">
                      <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.categoriesCount}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.state.newModal ? <NewCategory newModal={this.state.newModal} closeNewModal={this.closeNewModal.bind(this)} languages={this.props.allLanguages} CreateProductCategory={this.CreateProductCategory.bind(this)}/> : ""}
        {this.state.editModal ? <EditCategory initialValues={Immutable.fromJS(this.state.thisCategory)} editModal={this.state.editModal}
        closeEditModal={this.closeEditModal.bind(this)} languages={this.props.allLanguages} EditProductCategory={this.EditProductCategory.bind(this)}/> : ""}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getProductCategories: () => {
      dispatch(getProductCategories())
    },

    createProductCategory: (obj) => {
      dispatch(createProductCategory(obj))
    },

    setInitialValuesProductCategory: (obj) => {
      dispatch(setInitialValuesProductCategory(obj))
    },

    editProductCategory: (id, obj) => {
      dispatch(editProductCategory(id, obj))
    },

    deleteProductCategory: (id) => {
      dispatch(deleteProductCategory(id))
    },

    getLanguages: () => {
      dispatch(getLanguages());
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    categories: nextState.categories_data.categories,
    categoriesCount: nextState.categories_data.categoriesCount,
    initialValuesProductCategory: nextState.categories_data.initialValuesProductCategory,
    allLanguages: nextState.language_data.allLanguages
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductCategories);
