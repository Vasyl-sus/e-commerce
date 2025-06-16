import React, {Component} from 'react';
import Moment from 'moment';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import Switch from 'react-switch';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {getReviews, setInitialValuesReview, editReview, deleteReview} from '../../actions/reviews_actions';
import EditReview from './edit_review.js';

class Reviews extends Component {
    constructor(props) {
      super(props);

      this.state = {editModal: false, pageNumber:1, pageLimit:15, selectedProduct: null};
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

      if(location.query.product_id) {
        var product = this.props.products.find(p => {return p.id == location.query.product_id});
        this.setState({selectedProduct: {label: product.name, value: product.id}});
      }

      browserHistory.replace(location);
      this.props.getReviews();
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
      this.props.getReviews();
      this.setState({pageNumber});
    }

    openEditModal(obj)
    {
      this.setState({editModal: true});
      this.props.setInitialValuesReview(obj);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    editReview(obj)
    {
      var id = obj.id;
      delete obj.id;
      this.props.editReview(id, obj);
      this.closeEditModal();
    }

    changeProductSelect(event) {
      this.setState({selectedProduct: event})
      var location = browserHistory.getCurrentLocation();
      if(event != null) {
        location.query.product_id = event.value;
      } else {
        delete location.query.product_id;
      }
      this.resetPageNumber(location);
      browserHistory.replace(location)
      this.props.getReviews();
    }

    editDirect(review) {
      var data = {};
      data.active = review.active == 1 ? 0 : 1;

      this.props.editReview(review.id, data);
    }

    deleteReview(obj) {
      if(window.confirm("Ali ste sigurni da hočete izbrisati mnenje?"))
        this.props.deleteReview(obj.id);
    }

    renderReviews(review, index)
    {
      return(
        <tr key={index}>
          <td>{review.review}</td>
          <td>{review.product_name}</td>
          <td>
          <Switch onChange={this.editDirect.bind(this, review)} checked={review.active} className="form-white" />
          </td>
          <td>{Moment (review.date_added).format("DD. MM. YYYY")}</td>
          <td>{review.name}</td>
          <td className="center">
            <span onClick={this.openEditModal.bind(this, review)} className="fas fa-pencil-alt pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.deleteReview.bind(this, review)} className="fas fa-trash pointer"></span>
          </td>
        </tr>
      )
    }

    render(){
      const {products, reviews} = this.props;

      const p = products.map(p => { return {label: p.name, value: p.id}});

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Mnenja</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-4">
                <Select
                  className="form-white"
                  name=""
                  placeholder="Izberi produkt..."
                  value={this.state.selectedProduct}
                  options={p}
                  multi={false}
                  onChange={this.changeProductSelect.bind(this)}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Mnenje</th>
                        <th className="left table-pad-l-8">Produkt</th>
                        <th className="left table-pad-l-8">Aktivno</th>
                        <th className="left table-pad-l-8">Datum dodajanja</th>
                        <th className="left table-pad-l-8">Uporabnik</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(this.renderReviews.bind(this))}
                    </tbody>
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} current={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.reviewCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.editModal && <EditReview initialValues={Immutable.fromJS(this.props.initialValuesReview)} editModal={this.state.editModal}
          closeEditModal={this.closeEditModal.bind(this)} editReview={this.editReview.bind(this)}/>}
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getReviews: () => {
      dispatch(getReviews());
    },

    setInitialValuesReview: (obj) => {
      dispatch(setInitialValuesReview(obj));
    },

    editReview: (id, obj) => {
      dispatch(editReview(id, obj));
    },

    deleteReview: (id) => {
      dispatch(deleteReview(id));
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    products: nextState.main_data.products,
    reviews: nextState.reviews_data.reviews,
    reviewCount: nextState.reviews_data.reviewCount,
    initialValuesReview: nextState.reviews_data.initialValuesReview
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Reviews);
