import React, {Component} from 'react';
import Moment from 'moment';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {connect} from 'react-redux';
import {getProducts, setInitialValuesProductStock, getStockChanges, editProductStock, getAllStockChanges} from '../../actions/products_actions';
import NewProductStock from './add_product_stock.js';
import EditProductStock from './edit_product_stock.js';
import ProductHistory from '../products/product_history.js';

class Stock extends Component {
    constructor(props) {
      super(props);

      this.state = {newModalProduct: false, editModalProduct: false, product_data: null, pageNumber: 1, pageLimit: 15,
      pageNumberStock:1, pageLimitStock: 20, historyModal: false};
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

      if(location.query.pageLimitStock)
        this.setState({pageLimitStock: location.query.pageLimitStock});
      else
        location.query.pageLimitStock = 15;

      if(location.query.pageNumberStock)
        this.setState({pageNumberStock: location.query.pageNumberStock});
      else
        location.query.pageNumberStock = 1;

      browserHistory.replace(location);
      this.props.getProducts();
      this.props.getAllStockChanges();
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
      this.props.getProducts();
    }

    pageChangeStock(pageNumberStock) {
      let location = browserHistory.getCurrentLocation();
      location.query.pageNumberStock = pageNumberStock;
      browserHistory.replace(location);
      this.props.getAllStockChanges();
    }

    openNewModalProduct(product)
    {
      this.setState({product_data: product})
      this.setState({newModalProduct: true});
    }

    closeNewModalProduct()
    {
      this.setState({newModalProduct: false})
    }

    openHistoryModal(id) {
      this.props.getStockChanges(id)
      this.setState({historyModal: true})
    }

    closeHistoryModal() {
      this.setState({historyModal: false})
    }

    openEditModalProduct(product)
    {
      this.setState({editModalProduct: true});
      this.setState({product_data: product})

      var data = {};
      data.value = product.amount;
      this.props.setInitialValuesProductStock(data);
    }

    closeEditModalProduct()
    {
      this.setState({editModalProduct: false})
    }

    addProductStock(id, data) {
      this.props.editProductStock(id, data)
      this.closeNewModalProduct();
    }

    EditProductStock(id, data)
    {
      this.props.editProductStock(id, data)
      this.closeEditModalProduct();
    }

    renderProducts(product, index)
    {
      return(
        <tr key={index}>
          <td>{product.name}</td>
          <td className="center">{product.amount}</td>
          <td className="center pointer">
            <span onClick={this.openNewModalProduct.bind(this, product)} className="fas fa-plus"></span>
          </td>
          <td className="center">
            <span onClick={this.openEditModalProduct.bind(this, product)} className="fas fa-edit pointer"></span>
          </td>
          <td className="center">
            <span onClick={this.openHistoryModal.bind(this, product.id)} className="fa fa-clock-o pointer"></span>
          </td>
        </tr>
      )
    }

    renderAllStockChanges(stockchange, index)
    {
      return(
        <tr key={index}>
          <td>{stockchange.id}</td>
          <td className="center">{Moment(stockchange.date).format("DD. MM. YYYY")}</td>
          <td>{stockchange.product_name}</td>
          <td className="center">{stockchange.value}</td>
        </tr>
      )
    }

    render(){
      const { products, all_stock_changes } = this.props;

      return (
        <div className="content-wrapper container-fluid">
          <div>
            <div className="row">
              <div className="col-md-12">
                <h2 className="box-title">Zaloga</h2>
              </div>
            </div>
            <div className="box box-default">
              <div className="row">
                <div className="col-md-12">
                  <div className="table-responsive no-padding">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th className="left table-pad-l-8">Produkt</th>
                          <th className="center table-pad-l-8">Količina</th>
                          <th className="center table-pad-l-8">Dodaj zalogo</th>
                          <th className="center table-pad-l-8">Zmanjšaj zalogo</th>
                          <th className="center table-pad-l-8">Zgodovina produkta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(this.renderProducts.bind(this))}
                      </tbody>
                    </table>
                  </div>
                  <div className="box-footer w-100 pb-3">
                    <div className="row w-100">
                      <div className="col-sm-6 col-xs-8 w-100">
                        <div className="pagination-block">
                          <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.productsCount}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {this.state.newModalProduct && <NewProductStock product={this.state.product_data} newModalProduct={this.state.newModalProduct}
            closeNewModalProduct={this.closeNewModalProduct.bind(this)} addProductStock={this.addProductStock.bind(this)}/>}
            {this.state.historyModal && <ProductHistory historyModal={this.state.historyModal} closeHistoryModal={this.closeHistoryModal.bind(this)}/>}
            {this.state.editModalProduct && <EditProductStock initialValues={Immutable.fromJS(this.props.initialValuesProductStock)}
            editModalProduct={this.state.editModalProduct} closeEditModalProduct={this.closeEditModalProduct.bind(this)}
            EditProductStock={this.EditProductStock.bind(this)} product={this.state.product_data}/>}
          </div>
          <div>
            <div className="row">
              <div className="col-md-12">
                <h2 className="box-title">Seznam odpisov</h2>
              </div>
            </div>
            <div className="box box-default">
              <div className="row">
                <div className="col-md-12">
                  <div className="table-responsive no-padding">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th className="left table-pad-l-8">Št. odpisa</th>
                          <th className="center table-pad-l-8">Datum odpisa</th>
                          <th className="left table-pad-l-8">Produkt</th>
                          <th className="center table-pad-l-8">Količina</th>
                        </tr>
                      </thead>
                      <tbody>
                        {all_stock_changes.map(this.renderAllStockChanges.bind(this))}
                      </tbody>
                    </table>
                  </div>
                  <div className="box-footer w-100 pb-3">
                    <div className="row w-100">
                      <div className="col-sm-6 col-xs-8 w-100">
                        <div className="pagination-block">
                          <Pagination defaultPageSize={parseInt(this.state.pageLimitStock)} defaultCurrent={parseInt(this.state.pageNumberStock)} onChange={this.pageChangeStock.bind(this)} total={this.props.all_stock_changes_count}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getProducts: () => {
      dispatch(getProducts());
    },

    editProductStock: (id, obj) => {
      dispatch(editProductStock(id, obj))
    },

    getStockChanges: (id) => {
      dispatch(getStockChanges(id))
    },

    setInitialValuesProductStock: (obj) => {
      dispatch(setInitialValuesProductStock(obj))
    },

    getAllStockChanges: () => {
      dispatch(getAllStockChanges())
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();
  return {
    products: nextState.products_data.products,
    productsCount: nextState.products_data.productsCount,
    initialValuesProductStock: nextState.products_data.initialValuesProductStock,
    all_stock_changes: nextState.products_data.all_stock_changes,
    all_stock_changes_count: nextState.products_data.all_stock_changes_count
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Stock);
