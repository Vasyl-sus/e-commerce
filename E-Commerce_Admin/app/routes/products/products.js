import React, { useState, useEffect } from 'react';
import Moment from 'moment';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import Switch from 'react-switch';
import { useSelector, useDispatch } from 'react-redux';
import {getProducts, deleteProductImage, createProduct, editProduct, deleteProduct} from '../../actions/products_actions';
import {getLanguages} from '../../actions/languages_actions';
import NewProduct from './new_product.js';
import EditProduct from './edit_product.js';

import { selectProducts, selectProductsCount } from "./selectors";
import { selectAllLanguages } from "../languages/selectors";

const Products = (props) => {
  const dispatch = useDispatch();

  const [newModal, setNewModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [picture_link, setPictureLink] = useState(null)
  const [picture_id, setPictureId] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageLimit, setPageLimit] = useState(15)
  const [selectedProduct, setSelectedProduct] = useState({})

  const products = useSelector(selectProducts)
  const productsCount = useSelector(selectProductsCount)
  const allLanguages = useSelector(selectAllLanguages)

  const mountFunction = () => {
    var location = browserHistory.getCurrentLocation();

    if(location.query.pageLimit)
      setPageLimit(location.query.pageLimit)
    else
      location.query.pageLimit = 15;

    if(location.query.pageNumber)
      setPageNumber(location.query.pageNumber)
    else
      location.query.pageNumber = 1;
    
    location.query.showAll = true;
    browserHistory.replace(location);
    dispatch(getProducts());
    dispatch(getLanguages())
  }

  useEffect(mountFunction, [])

  const toggleNewModal = () => {
    setNewModal(!newModal)
  }

  const toggleEditModal = (product) => () => {
    setEditModal(!editModal);
    setSelectedProduct(product)
    if (product && product.post_image) {
      setPictureLink(product.post_image.link)
      setPictureId(product.post_image.id)
    } else {
      setPictureLink(null)
      setPictureId(null)
    }
  }

  const deleteProductt = (id) => () => {
    dispatch(deleteProduct(id))
  }

  const createNewProduct = (data) => {
    dispatch(createProduct(data));
    toggleNewModal();
  }

  const EditProductDetails = (product, data) => {
    var id = product.id;
    dispatch(editProduct(id, data));
  }

  const pageChange = (page) => {
    let location = browserHistory.getCurrentLocation();
    location.query.pageNumber = page;
    browserHistory.replace(location);
    //setPageNumber(page);
    dispatch(getProducts());
  }

  const DeleteProductImage = (id) => {
    dispatch(deleteProductImage(id))
  }

  const changeActiveStatus = (product) => () => {
    var active = product.active == 1 ? 0 : 1
    dispatch(editProduct(product.id, {active}));
  }

  const renderSingleProduct = (product, index) => {
    return(
      <tr key={index}>
        <td>{product.sort_order}</td>
        <td>{product.name}</td>
        <td>{Moment (product.date_added).format("DD. MM. YYYY")}</td>
        <td className="">
        <Switch onChange={changeActiveStatus(product)} checked={product.active == 1} className="form-white" />
        </td>
        <td className="center">{product.amount}</td>
        <td className="center">
          <span onClick={toggleEditModal(product)} className="fas fa-pencil-alt pointer"></span>
        </td>
        <td className="center">
          <span onClick={deleteProductt(product.id)} className="fas fa-trash pointer"></span>
        </td>
      </tr>
    )
  }

  return (
    <div className="content-wrapper container-fluid">
      <div className="row">
        <div className="col-md-12">
          <h2 className="box-title">Produkti</h2>
        </div>
      </div>
      <div className="box box-default">
        <div className="row main-box-head">
          <div className="col-md-12 right">
            <button onClick={toggleNewModal} className="btn btn-default"> Dodaj produkt</button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive no-padding">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th className="left table-pad-l-8">Zap. št.</th>
                    <th className="left table-pad-l-8">Ime produkta</th>
                    <th className="left table-pad-l-8">Datum dodajanja</th>
                    <th className="left table-pad-l-8">Aktiven/Neaktiven</th>
                    <th className="center table-pad-l-8">Količina</th>
                    <th className="center table-pad-l-8">Uredi</th>
                    <th className="center table-pad-l-8">Izbriši</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(renderSingleProduct)}
                </tbody>
              </table>
            </div>
            <div className="box-footer w-100 pb-3">
              <div className="row w-100">
                <div className="col-sm-6 col-xs-8 w-100">
                  <div className="pagination-block">
                    <Pagination defaultPageSize={parseInt(pageLimit)} defaultCurrent={parseInt(pageNumber)} onChange={pageChange} total={productsCount}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {newModal && <NewProduct languages={allLanguages} newModal={newModal} closeNewModal={toggleNewModal} createNewProduct={createNewProduct}/>}

      {editModal && <EditProduct languages={allLanguages} initialValues={Immutable.fromJS(selectedProduct)} deleteProductImage={DeleteProductImage}
      picture_id={picture_id} product_picture={picture_link} editModal={editModal}
      closeEditModal={toggleEditModal(null)} editProduct={EditProductDetails}/>}
    </div>
  )
}
export default Products;
