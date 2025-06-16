import React, {Component} from 'react';
import Moment from 'moment';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {compose} from 'redux';
import Switch from 'react-switch';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import {getDiscounts, createDiscount, setInitialValuesDiscount, editDiscount, deleteDiscount, getDiscountDetails} from '../../actions/discounts_actions';
import {getOrderDetails} from '../../actions/order_details_actions';
import {connect} from 'react-redux';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);

import { Field, reduxForm } from 'redux-form/immutable';
import NewDiscount from './new_discount.js';
import EditDiscount from './edit_discount.js';

class Discounts extends Component {
    constructor(props) {
      super(props);

      var dateFrom = new Date(new Date().getTime() - 2592000000)
      var dateTo = new Date()

      this.state = {newModal: false, editModal: false, search:'', pageNumber:1, pageLimit:15, selectedCountry:null,
      active:1, discountID:null, pageNumberOrders:1, pageLimitOrders:10, selectedStatus: [],
      startDateFrom: dateFrom, startDateTo: dateTo, thisDiscount: null};
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

      if (location.query.search) {
        delete location.query.search;
      }

      if(location.query.active) {
        this.setState({active: location.query.active});
      } else {
        location.query.active = 1;
      }

      if(location.query.type) {
        this.setState({dType: location.query.type});
      } else {
        this.setState({dType: "all"})
      }

      if(location.query.country)
      {
        this.setState({selectedCountry: {label: location.query.country, value: location.query.country}})
      }

      browserHistory.replace(location);
      this.props.getDiscounts();
    };

    resetPageNumber(location){
      location.query.pageNumber = 1;
      this.setState({pageNumber:1});
      return location;
    }

    resetPageNumberOrders(location){
      location.query.pageNumberOrders = 1;
      this.setState({pageNumberOrders:1});
      return location;
    }

    pageChange(pageNumber) {
      let location = browserHistory.getCurrentLocation();
      location.query.pageNumber = pageNumber;
      browserHistory.replace(location);
      this.props.getDiscounts();
      this.setState({pageNumber});
      this.setState({discountID:null})
      this.setState({selectedStatus:[]})
    }

    pageChangeOrders(pageNumberOrders) {
      let location = browserHistory.getCurrentLocation();
      location.query.pageNumberOrders = pageNumberOrders;
      browserHistory.replace(location);
      this.props.getDiscountDetails(this.state.discountID);
      this.setState({pageNumberOrders});
    }

    setSearch(data) {
      this.setState({discountID:null})
      this.setState({selectedStatus:[]})
      data = data.toJS();
      let location = browserHistory.getCurrentLocation();
      this.resetPageNumber(location);
      if(data.searchString=="")
        delete location.query.search;
      else
        location.query.search = data.searchString;
      this.resetPageNumber(location);
      browserHistory.replace(location);
      this.props.getDiscounts();
    }

    openNewModal() {
      this.setState({newModal: true});
    }

    closeNewModal() {
      this.setState({newModal: false})
    }

    createNewDiscount(obj) {
      this.props.createDiscount(obj, this.props.user, this.props.socket);
      this.closeNewModal();
    }

    openEditModal(discount)
    {
      // this.props.setInitialValuesDiscount(discount);
      var edit_discount = {};
			edit_discount.active = discount.active;
			edit_discount.date_start = discount.date_start;
			edit_discount.date_end = discount.date_end;
			edit_discount.name = discount.name;
			edit_discount.dodatni_naziv = discount.dodatni_naziv;
			edit_discount.id = discount.id;
			edit_discount.type = discount.type;
			edit_discount.utm_medium = discount.utm_medium;
			edit_discount.utm_source = discount.utm_source;
			edit_discount.discount_type = discount.discount_type;
			edit_discount.discount_value = discount.discount_value;
      edit_discount.min_order_amount = discount.min_order_amount;
			var therapies = [];
			var countries = [];
			var ttt = [];
			for (var i = 0; i < discount.therapies.length; i++) {
				therapies.push({value: discount.therapies[i].id, label: discount.therapies[i].name})
			}
			for (var i = 0; i < discount.countries.length; i++) {
				countries.push({value: discount.countries[i], label: discount.countries[i]})
			}
      var free_therapies = [];
      var free_accessories = [];
      for (var i = 0; i < discount.free_therapies.length; i++) {
        free_therapies.push({value: discount.free_therapies[i].id, label: discount.free_therapies[i].name})
      }
      for (var i = 0; i < discount.free_accessories.length; i++) {
        free_accessories.push({value: discount.free_accessories[i].id, label: discount.free_accessories[i].name})
      }
			edit_discount.therapies = therapies;
			edit_discount.countries = countries;
      edit_discount.free_therapies = free_therapies;
      edit_discount.free_accessories = free_accessories;
      this.setState({thisDiscount: edit_discount})
      this.setState({editModal: true});
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditExistingDiscount(discount)
    {
      var id = discount.id;
      delete discount.id;
      this.props.editDiscount(id, discount, this.props.user, this.props.socket);
      this.closeEditModal();
    }

    DeactivateDiscount(discount)
    {
      var id = discount.id;
      if(window.confirm("Ali ste prepričani, da hočete deaktivirati kupon za popust?"))
      this.props.deleteDiscount(id, this.props.user, this.props.socket);
    }

    changeCountrySelect(event) {
      this.setState({discountID:null})
      this.setState({selectedStatus:[]})
      this.setState({selectedCountry: event})
      var location = browserHistory.getCurrentLocation();
      if(event != null) {
        location.query.country = event.value;
      } else {
        delete location.query.country;
      }
      this.resetPageNumber(location);
      browserHistory.replace(location)
      this.props.getDiscounts();
    }

    changeStatusSelect(event) {
      this.setState({selectedStatus: event})
      var location = browserHistory.getCurrentLocation();
      var local_s = [];
      var names = event.map(e => {return e.label})
      if(event.length > 0) {
        if(names.includes("Vse")) {
          var selected = this.props.order_statuses.filter(s => { return s.name != "Vse" })
          location.query.status = selected.map(s => {return s.id});
          var selectedStatuses = selected.map(s => {return {label: s.name, value: s.id}})
          this.setState({selectedStatus: selectedStatuses})
          // this.props.setLocalStatuses(selected);
        } else {
          var ids = event.map(e => { return e.value })
          ids.map(s_id => {
            var selected = this.props.order_statuses.find(s => { return s.id == s_id })
            local_s.push(selected);
          });
          location.query.status = ids;
          this.setState({selectedStatus: event})
          // this.props.setLocalStatuses(local_s);
        }
      }
      this.resetPageNumberOrders(location);
      browserHistory.replace(location);
      this.props.getDiscountDetails(this.state.discountID);
    }

    handleChangeStart = (dates) => {
      const [start, end] = dates;
      this.setState({ startDateFrom: start, startDateTo: end }, () => {
        if (end) {
          let location = browserHistory.getCurrentLocation();
          location.query.date_from = Moment(start).format('YYYY-MM-DD');
          location.query.date_to = Moment(end).format('YYYY-MM-DD');
          browserHistory.replace(location);
          this.props.getDiscountDetails(this.state.discountID);
        }
      });
    };



    isActive(flag) {
      this.setState({active: flag})
      this.setState({discountID:null})
      this.setState({selectedStatus:null})
      let location = browserHistory.getCurrentLocation();
      location.query.active = flag;
      this.resetPageNumber(location);
      browserHistory.replace(location);
      this.props.getDiscounts();
    }

    discountType(type) {
      this.setState({dType: type})
      this.setState({discountID:null})
      this.setState({selectedStatus:null})
      let location = browserHistory.getCurrentLocation();
      if(type == "general") {
        location.query.type = "general";
      }
      if(type == "individual") {
        location.query.type = "individual";
      }
      if(type == "shipping") {
        location.query.type = "shipping";
      }
      if(type == "free product") {
        location.query.type = "free product";
      }
      if(type == "all") {
        delete location.query.type;
      }
      this.resetPageNumber(location);
      browserHistory.replace(location);
      this.props.getDiscounts();
    }

    getOrderDetails(id) {
      window.open("/order_details?id=" + id);
      this.props.getOrderDetails(id);
    }

    getDiscountDetails(discount) {
      if(discount.id != this.state.discountID){
        this.setState({discountID: discount.id});
        var location = browserHistory.getCurrentLocation();

        if(location.query.pageLimitOrders)
          this.setState({pageLimitOrders: location.query.pageLimitOrders});
        else
          location.query.pageLimitOrders = 10;

        if(location.query.pageNumberOrders)
          this.setState({pageNumberOrders: location.query.pageNumberOrders});
        else
          location.query.pageNumberOrders = 1;

        if(location.query.date_from)
          this.setState({ startDateFrom: Moment(location.query.date_from).toDate() });
        else
          location.query.date_from = Moment(this.state.startDateFrom).format('YYYY-MM-DD');

        if(location.query.date_to)
          this.setState({ startDateTo: Moment(location.query.date_to).toDate() });
        else
          location.query.date_to = Moment(this.state.startDateTo).format('YYYY-MM-DD');

        if(location.query.status)
        {
          delete location.query.status
        }

        this.resetPageNumberOrders(location);
        browserHistory.replace(location);
        this.props.getDiscountDetails(discount.id);
      }
      else {
        this.setState({discountID:null})
        this.setState({selectedStatus:null})
      }
    }

    renderDiscountOrders(discount_order, index) {
      return (
        <tr key={index} className="pointer" style={{borderBottom: '1px solid #e0e0e0'}} onClick={this.getOrderDetails.bind(this, discount_order.id)}>
          <td className="left">{discount_order.order_id2 ? discount_order.order_id2 : "/"}</td>
          <td className="left">{discount_order.shipping_first_name ? discount_order.shipping_first_name : "/"} {discount_order.shipping_last_name ? discount_order.shipping_last_name : "/"}</td>
          <td className="left">{discount_order.therapies && discount_order.therapies.length > 0 ? discount_order.therapies.map(t => {return t.name}).join(", ") : "/"}</td>
          <td className="center">{discount_order.shipping_country ? discount_order.shipping_country : ""}</td>
          <td className="center">{discount_order.upsaleData ? parseFloat(discount_order.upsaleData.initial_total).toFixed(2) : parseFloat(0).toFixed(2)} {discount_order.currency_symbol}</td>
          <td className="center">{discount_order.upsaleData ? parseFloat(discount_order.upsaleData.upsale).toFixed(2) : parseFloat(0).toFixed(2)} {discount_order.currency_symbol}</td>
          <td className="center">{discount_order.upsaleData ? parseFloat(discount_order.upsaleData.total).toFixed(2) : parseFloat(discount_order.total).toFixed(2)} {discount_order.currency_symbol}</td>
          <td className="center">{discount_order.date_added != null ? Moment(discount_order.date_added).format("DD. MM. YYYY") : ""}</td>
          <td className="center">{discount_order.order_status_name ? discount_order.order_status_name : ""}</td>
        </tr>
      )
    }

    renderSingleDiscount(discount, index){
      var status = this.props.order_statuses.map(p => { return {label : p.name, value : p.id}});

      return(
        <tbody style={{borderBottom: '1px solid #e0e0e0'}} key={index}>
          <tr className="pointer">
            <td onClick={this.getDiscountDetails.bind(this, discount)}>{discount.name}</td>
            <td onClick={this.getDiscountDetails.bind(this, discount)}>{discount.dodatni_naziv}</td>
            <td onClick={this.getDiscountDetails.bind(this, discount)}>{Moment (discount.date_start).format("DD. MM. YYYY")}</td>
            <td onClick={this.getDiscountDetails.bind(this, discount)}>{Moment (discount.date_end).format("DD. MM. YYYY")}</td>
            <td onClick={this.getDiscountDetails.bind(this, discount)}>{discount.discount_value == null ? 0 : discount.discount_value}</td>
            <td onClick={this.getDiscountDetails.bind(this, discount)}>
              <Switch readOnly={true} checked={discount.active} className="form-white" />
            </td>
            <td onClick={this.getDiscountDetails.bind(this, discount)}>{discount.discount_type == null ? "/" : discount.discount_type}</td>
            <td className="center">
              <span onClick={this.openEditModal.bind(this, discount)} className="fas fa-pencil-alt pointer"></span>
            </td>
            <td className="center">
              <span onClick={this.getDiscountDetails.bind(this, discount)} className="fa fa-search pointer"></span>
            </td>
            <td className="center">
              <span onClick={this.DeactivateDiscount.bind(this, discount)} className="fas fa-trash pointer"></span>
            </td>
          </tr>
          <tr>
            <td className={`hidden-tr ${this.state.discountID == discount.id ? '' : 'closed'}`} colSpan="8">
              <div className="main-hidden container-fluid row">
                <div className="col-3">
                  <h3 className="pb-3">{discount.name}</h3>
                  <h5>{discount.dodatni_naziv}</h5>
                </div>
                <div className="col-md-4 py-2">
                  <label>Datum</label>
                   <DatePicker
                    selected={this.state.startDateFrom}
                    onChange={this.handleChangeStart}
                    startDate={this.state.startDateFrom}
                    endDate={this.state.startDateTo}
                    selectsRange
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Izberi obdobje"
                    maxDate={dateMax}
                    className="multi-dateinput"
                    locale="sl"
                    showIcon
                  />
                </div>
                <div className="col-md-5 py-2">
                  <label>Statusi</label>
                  <Select
                    className="form-white"
                    name=""
                    placeholder="Izberi statuse..."
                    value={this.state.selectedStatus}
                    options={status}
                    multi={true}
                    onChange={this.changeStatusSelect.bind(this)}
                  />
                </div>
                <div className="col-md-12 py-5">
                  <div className="row">
                    <div className="agent-sums col-md-3">
                      <span className="agent-stat-title prvotni-text w-100">PRVOTNI ZNESEK NAROČIL</span>
                      <span className="agent-stat-num prvotni-num w-100">{this.props.discount.initialSum} €</span>
                    </div>
                    <div className="agent-sums col-md-3">
                      <span className="agent-stat-title upsell-text w-100">UPSELL ZNESEK</span>
                      <span className="agent-stat-num upsell-num w-100">{this.props.discount.upsaleSum} €</span>
                    </div>
                    <div className="agent-sums col-md-3">
                      <span className="agent-stat-title total-text w-100">SKUPNI ZNESEK NAROČIL</span>
                      <span className="agent-stat-num total-num w-100">{this.props.discount.totalSum} €</span>
                    </div>
                    <div className="agent-sums col-md-3">
                      <span className="agent-stat-title total-text w-100">SKUPNO ŠT. NAROČIL</span>
                      <span className="agent-stat-num total-num w-100">{this.props.discount.discountOrdersCount} </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="row py-3">
                    <h4 className="col-md-12 pb-3">Seznam naročil</h4>
                    <div className="col-md-12">
                      <div className="table-responsive">
                        <table className="table table-tr-hover">
                          <thead>
                            <tr>
                              <th className="left table-pad-l-8">ID</th>
                              <th className="left table-pad-l-8">Stranka</th>
                              <th className="left table-pad-l-8">Terapije</th>
                              <th className="center table-pad-l-8">Država</th>
                              <th className="center table-pad-l-8">Prvotni znesek</th>
                              <th className="center table-pad-l-8">Upsell</th>
                              <th className="center table-pad-l-8">Skupni znesek</th>
                              <th className="center table-pad-l-8">Datum naročila</th>
                              <th className="center table-pad-l-8">Status naročila</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.props.discount.orders && this.props.discount.orders.length > 0 ? this.props.discount.orders.map(this.renderDiscountOrders.bind(this)) : ""}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td className="center"><b>{parseFloat(this.props.discount.initialSum).toFixed(2)} €</b></td>
                              <td className="center"><b>{parseFloat(this.props.discount.upsaleSum).toFixed(2)} €</b></td>
                              <td className="center"><b>{parseFloat(this.props.discount.totalSumOrders).toFixed(2)} €</b></td>
                            </tr>
                          </tfoot>
                        </table>
                        <Pagination defaultPageSize={parseInt(this.state.pageLimitOrders)} current={parseInt(this.state.pageNumberOrders)} onChange={this.pageChangeOrders.bind(this)} total={this.props.discount.discountOrdersCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      )
    }

    render(){
      const { discounts, localCountries } = this.props;
      const { handleSubmit } = this.props;

      const c = localCountries.map(c => { return {label: c, value: c}});

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12 d-flex justify-content-between align-items-center">
                <h2 className="box-title">Kuponi za popust</h2>
                <button onClick={this.openNewModal.bind(this)} className="btn btn-white-header">Dodaj kupon</button>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-md-4 mb-4 search-div">
                <form onSubmit={handleSubmit(this.setSearch.bind(this))}>
                  <Field place="Išči kupone..." name="searchString" type="text" component={renderField}></Field>
                  <button type="submit" className="btn btn-secondary btn-search">IŠČI</button>
                </form>
              </div>
              <div className="col-md-4">
                <Select
                  className="form-white"
                  name=""
                  placeholder="Izberi državo..."
                  value={this.state.selectedCountry}
                  options={c}
                  multi={false}
                  onChange={this.changeCountrySelect.bind(this)}
                />
              </div>
              <div className="col-md-12 pb-3">
                <div className="row">
                  <div className="col-md-4">
                    <div style={{borderRight: '1px solid #cccccc'}} className="row">
                      <div className="mx-4 my-3">
                        <input onChange={this.discountType.bind(this, "individual")} checked={this.state.dType == "individual" ? true : false} type="checkbox" className="mr-2 pointer"/>
                        <label>Individual</label>
                      </div>
                      <div className="mx-4 my-3">
                        <input onChange={this.discountType.bind(this, "general")} checked={this.state.dType == "general" ? true : false} type="checkbox" className="mr-2 pointer"/>
                        <label>General</label>
                      </div>
                      <div className="mx-4 my-3">
                        <input onChange={this.discountType.bind(this, "shipping")} checked={this.state.dType == "shipping" ? true : false} type="checkbox" className="mr-2 pointer"/>
                        <label>Shipping</label>
                      </div>
                      <div className="mx-4 my-3">
                        <input onChange={this.discountType.bind(this, "free product")} checked={this.state.dType == "free product" ? true : false} type="checkbox" className="mr-2 pointer"/>
                        <label>Free Product</label>
                      </div>
                      <div className="mx-4 my-3">
                        <input onChange={this.discountType.bind(this, "all")} checked={this.state.dType == "all" ? true : false} type="checkbox" className="mr-2 pointer"/>
                        <label>Vse</label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="row">
                      <div className="my-3 mx-4">
                        <input onClick={this.isActive.bind(this, 1)} checked={this.state.active == 1 ? true : false} type="checkbox" className="mr-2 pointer"/>
                        <label>Aktivni</label>
                      </div>
                      <div className="mx-4 my-3">
                        <input onClick={this.isActive.bind(this, 0)} checked={this.state.active == 0 ? true : false} type="checkbox" className="mr-2 pointer"/>
                        <label>Neaktivni</label>
                      </div>
                      <div className="mx-4 my-3">
                        <input onClick={this.isActive.bind(this, 2)} checked={this.state.active == 2 ? true : false} type="checkbox" className="mr-2 pointer"/>
                        <label>Vse</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="left table-pad-l-8">Ime</th>
                        <th className="left table-pad-l-8">Dodatni naziv</th>
                        <th className="left table-pad-l-8">Velja od</th>
                        <th className="left table-pad-l-8">Velja do</th>
                        <th className="left table-pad-l-8">Vrednost</th>
                        <th className="left table-pad-l-8">Aktiven</th>
                        <th className="left table-pad-l-8">Tip popusta</th>
                        <th className="center table-pad-l-8"></th>
                        <th className="center table-pad-l-8"></th>
                        <th className="center table-pad-l-8"></th>
                      </tr>
                    </thead>
                    {discounts.map(this.renderSingleDiscount.bind(this))}
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} current={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.discountsCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal ? <NewDiscount newModal={this.state.newModal} therapies={this.props.therapies} free_therapies={this.props.free_therapies} free_accessories={this.props.free_accessories} discount_options={this.props.discount_options} utmmedia={this.props.utmmedia}
          discount_types={this.props.discount_types} discount_coupon_types={this.props.discount_coupon_types} countries={this.props.countries} closeNewModal={this.closeNewModal.bind(this)} createNewDiscount={this.createNewDiscount.bind(this)}/> : ""}
          {this.state.editModal && <EditDiscount initialValues={Immutable.fromJS(this.state.thisDiscount)} closeEditModal={this.closeEditModal.bind(this)} editModal={this.state.editModal} EditExistingDiscount={this.EditExistingDiscount.bind(this)} discount_options={this.props.discount_options} therapies={this.props.therapies} free_therapies={this.props.free_therapies} free_accessories={this.props.free_accessories} utmmedia={this.props.utmmedia} countries={this.props.countries}
          discount_types={this.props.discount_types} discount_coupon_types={this.props.discount_coupon_types} /> }
        </div>
      )
    }
 }

 const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning } }) => (
   <div className={inputclass}>
    <input type={type} placeholder={place} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} new-search-input`} />
   </div>
 )

const mapDispatchToProps = (dispatch) => {
  return {
    getDiscounts: () => {
      dispatch(getDiscounts());
    },

    getDiscountDetails: (id) => {
      dispatch(getDiscountDetails(id));
    },

    getOrderDetails: (id) => {
      dispatch(getOrderDetails(id));
    },

    createDiscount: (obj, user, socket) => {
      dispatch(createDiscount(obj, user, socket));
    },

    setInitialValuesDiscount: (discount) => {
      dispatch(setInitialValuesDiscount(discount));
    },

    editDiscount: (id, discount, user, socket) => {
      dispatch(editDiscount(id, discount, user, socket));
    },

    deleteDiscount: (id, user, socket) => {
      dispatch(deleteDiscount(id, user, socket));
    }
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    discounts: nextState.discounts_data.discountss,
    discountsCount: nextState.discounts_data.discountssCount,
    discount: nextState.discounts_data.discount,
    countries: nextState.main_data.countries,
    discount_coupon_types: ['General', 'Individual', 'Shipping', 'Free product'],
    discount_types: [{value : 'amount', label : 'Vsota'}, {value : 'percent', label : 'Procent'}],
    utmmedia: nextState.main_data.utmmedia,
    initialValuesDiscount: nextState.discounts_data.initialValuesDiscount,
    therapies: nextState.main_data.therapies,
    free_therapies: nextState.main_data.therapies,
    free_accessories: nextState.main_data.accessories,
    user: nextState.main_data.user,
    socket: nextState.main_data.socket,
    localCountries: nextState.main_data.localCountries,
    order_statuses: nextState.main_data.orderstatuses,
    total_discount_orders: nextState.discounts_data.total_discount_orders
  }
}

export default compose(
  reduxForm({
    form: 'DiscountForm',
    enableReinitialize: true
  }), connect(mapStateToProps, mapDispatchToProps)
)(Discounts);

//export default connect(mapStateToProps, mapDispatchToProps)(Discounts);
