import React, {Component} from 'react';
import {Link, browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import {compose} from 'redux';
import moment from "moment";
import {getDashboardOrders, changeOrderStatus, toggleCheckBox, checkAllOrders, clear_selected_orders,
show_color, add_color, change_selected_orders, printInvoices, printGLS, printZasilkovna, printExpedico, printCustomList, printStornoList, printTaxList, printPS, checkedCountry,
toggleCountry, addNewOrder, editOrder, printPC} from '../../actions/orders_dashboard_actions';
import {getOrderDetails} from '../../actions/order_details_actions';
import {getColorDashboard, createColor, deleteColor} from '../../actions/colors_actions';
import {setLocalCountries} from '../../actions/main_actions.js';
import {connect} from 'react-redux';
import { Field, reduxForm } from 'redux-form/immutable';
import Select from 'react-select';
import SelectedOrders from '../orders_dashboard/selected_orders.js';
import DateNaknadno from '../orders_dashboard/date_naknadno.js';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);



class InfluencerOrders extends Component {
    constructor(props) {
      super(props);

      var dateFrom = new Date(new Date().getTime() - 2592000000)
      var dateTo = new Date()

      dateFrom.setHours(0);
      dateFrom.setMinutes(0);

      dateTo.setHours(23)
      dateTo.setMinutes(59)

      this.state = {selectedOrdersModal: false, selectedCountries: [], selectedTherapies: [], checkAll: false, enabled:false, search:'', pageNumber:1,
      pageLimit:10, count:0, selectedNumber:10, newModal: false, newColorModal: false, startDateFrom: dateFrom, naknadnoModal:false,
      startDateTo: dateTo, activeRowColor: "", selected_type:{value: "normal", label: "Normal"}, openedFilters:true, dropdownStatuses:[], selectedDropdown:{}};
    }

    componentDidMount(){
      var location = browserHistory.getCurrentLocation();
      var selectedCountries;
      if(!location.query.countries)
      {
        location.query.countries = this.props.localCountries;
        selectedCountries = this.props.localCountries.map(o => {return {label: o, value: o}});
        this.setState({selectedCountries})
      }
      else {
        if (typeof location.query.countries != 'string')
        {
          selectedCountries = location.query.countries.map(o => {return {label: o, value: o}});
          this.setState({selectedCountries})
        }
        else
        {
          this.setState({selectedCountries: [location.query.countries]})
        }
      }

      if(!location.query.order_statuses) {
        var status = JSON.parse(localStorage.getItem("orderstatuses"));
        var find_status = status.find(s => {return s.name == "Odobreno"})
        location.query.order_statuses = find_status && find_status.id;
        this.setState({activeRowColor: find_status && find_status.color});
        this.setState({selectedDropdown:{label:find_status && find_status.name, value: find_status && find_status.id}});
      }
      else {
        var st = this.props.orderstatuses.find(s=> {
          return s.id == location.query.order_statuses
        })
        this.setState({activeRowColor: st && st.color});
        this.setState({selectedDropdown:{label:st && st.name, value: st && st.id}});
      }

      if(location.query.pageLimit)
        this.setState({selectedNumber: location.query.pageLimit});

      if(location.query.pageNumber)
        this.setState({pageNumber: location.query.pageNumber});

      if(location.query.from_date)
        this.setState({startDateFrom: new Date(parseInt(location.query.from_date))});
      else
        location.query.from_date = this.state.startDateFrom.getTime();

      if(location.query.to_date)
        this.setState({startDateTo: new Date(parseInt(location.query.to_date))});
      else
        location.query.to_date = this.state.startDateTo.getTime();

      if(!location.query.view) {
        location.query.view = this.props.views[0].value
        this.setState({selected_type: this.props.views[0]})
      } else {
        var find_view;
        if(location.query.view == "upsell") {
          find_view = this.props.views.find(v => {return v.value == "agent"})
          this.setState({selected_type: find_view})
        } else {
          find_view = this.props.views.find(v => {return v.value == location.query.view})
          this.setState({selected_type: find_view})
        }
      }

      if(!location.query.influencer)
        location.query.influencer = 1;

      if(location.query.search)
        delete location.query.search;

      browserHistory.replace(location);
      this.props.getDashboardOrders();
      this.props.getColorDashboard();
      this.listenForNewOrders();

      var statuses = this.props.orderstatuses.filter(s => {return s.name == "Odobreno"
      || s.name == "Poslano" || s.name == "Dostavljeno" || s.name == "Zavrnjeno"});

      var arr=[];
      for(var i=0; i<statuses.length; i++){
        var tmp = {};
        tmp.label = statuses[i].name;
        tmp.value = statuses[i].id;
        tmp.color = statuses[i].color;
        arr.push(tmp);
        this.setState({dropdownStatuses:arr});
      }
    };

    resetPageNumber(location){
      location.query.pageNumber = 1;
      this.setState({pageNumber:1});
      return location;
    }

    listenForNewOrders(){
      var self = this;
      if(this.props.socket){
        self.props.socket.on('newData',function(order){
          if(order.what == 'newOrder'){
            if(order.order_status){
              if(self.props.orders.length > 0){
                order.order_status = self.props.orders[0].order_status;
                self.props.addNewOrder(order);
              }
              else{
                var orderstatuses = localStorage.getItem('orderstatuses');
                order.order_status = orderstatuses.filter(status => status.name == "Neobdelano");
                self.props.addNewOrder(order);
              }
            }
          }
        });
      }
    }

    pageChange(pageNumber) {
      let location = browserHistory.getCurrentLocation();
      location.query.pageNumber = pageNumber;
      browserHistory.replace(location);
      this.props.getDashboardOrders();
      this.setState({pageNumber, checkAll: false});
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
      this.props.getDashboardOrders();
      this.setState({checkAll: false})
      this.props.clear_selected_orders();
    }

    handleChangeStart(dates) {
      let location = browserHistory.getCurrentLocation();
      var dateFrom = new Date(dates[0]);
      var dateTo = dates[1] ? new Date(dates[1]) : null;

      dateFrom.setHours(0);
      dateFrom.setMinutes(0);
  
      if (dateTo) {
        dateTo.setHours(23);
        dateTo.setMinutes(59);
      }

      location.query.from_date = dateFrom.getTime();
      location.query.to_date = dateTo ? dateTo.getTime() : null; 

      this.setState({startDateFrom: dateFrom});
      this.setState({startDateTo: dateTo});
      if (dateTo) {
        browserHistory.replace(location);
        this.props.getDashboardOrders();
        this.props.clear_selected_orders();
        this.setState({checkAll: false})
      }
    }

    changeNumberOrders(event) {
      var selectedNumber = event.target.value;
      var location = browserHistory.getCurrentLocation();
      location.query.pageLimit = selectedNumber;
      this.resetPageNumber(location);
      browserHistory.replace(location);
      this.props.getDashboardOrders();
      this.setState({checkAll: false});
      this.props.clear_selected_orders();
      this.setState({selectedNumber});
    }

    orderStatusesTabs(e)
    {
      let location = browserHistory.getCurrentLocation();
      if(e.currentTarget.dataset.name!="Vse")
        location.query.order_statuses = e.currentTarget.dataset.id;
      else
        delete location.query.order_statuses;
      this.setState({activeRowColor: e.currentTarget.dataset.color})
      this.setState({activeStatusTab: e.currentTarget.dataset.id})
      this.resetPageNumber(location);
      browserHistory.replace(location);
      this.props.getDashboardOrders();
      this.setState({checkAll: false});
      this.props.clear_selected_orders();
    }

    changeDropdownStatus(data){
      console.log(data);
      let location = browserHistory.getCurrentLocation();
      if(data.label!="Vse")
        location.query.order_statuses = data.value;
      else
        delete location.query.order_statuses;
      this.setState({selectedDropdown:data});
      this.setState({activeRowColor: data.color})
      this.setState({activeStatusTab: data.value})
      this.resetPageNumber(location);
      browserHistory.replace(location);
      this.props.getDashboardOrders();
      this.setState({checkAll: false});
      this.props.clear_selected_orders();
    }

    changeCountriesSelect(event) {
      this.setState({selectedCountries: event})
      var names = event.map(e => { return e.value });
      //localStorage.setItem('localCountries', JSON.stringify(names))
      //this.props.setLocalCountries(names);
      var location = browserHistory.getCurrentLocation();
      location.query.countries = names;
      this.resetPageNumber(location);
      browserHistory.replace(location)
      this.props.getDashboardOrders();
      this.props.clear_selected_orders();
      this.setState({checkAll: false})
    }

    changeOrderStatus(order, flag, event) {
      var status = event.target.value;
      if(status == "Naknadno") {
        this.openNaknadnoModal();
        this.setState({orders_ids: [order.id], change_status: status})
      } else {
        //this.props.editOrder([order.id], {date_naknadno: null}, flag);
        this.props.changeOrderStatus([order.id], status, flag)
      }
    }

    checkOrder(order, event) {
      this.props.toggleCheckBox(order);
      this.setState({checkAll: false})
    }

    checkAll() {
      this.setState({checkAll: !this.state.checkAll})
      this.props.checkAllOrders(!this.state.checkAll);
    }

    openNaknadnoModal()
    {
      this.setState({naknadnoModal: true});
    }

    closeNaknadnoModal()
    {
      this.setState({naknadnoModal: false});
    }

    EditDateNaknadno(obj) {
      this.props.changeOrderStatus(this.state.orders_ids, this.state.change_status, 1)
      this.props.editOrder(this.state.orders_ids, obj, 1);
      this.closeNaknadnoModal();
    }

    openSelectedOrdersModal()
    {
      this.setState({selectedOrdersModal: true});
    }

    closeSelectedOrdersModal()
    {
      this.setState({selectedOrdersModal: false});
    }

    changeSelectedOrdersStatus(status, obj, flag)
    {
      var ids = this.props.selected_orders.map(o => { return o.id });
      this.props.changeOrderStatus(ids, status, flag);
      if(status == "Naknadno") {
        this.props.editOrder(ids, obj, flag);
      }
      //this.clearSelectedOrders();
      //this.closeSelectedOrdersModal();
    }

    change_selected_orders(event)
    {
      this.props.change_selected_orders(event);
      // if(this.state.selected_type.value == "agent") {
      //   this.props.getDashboardOrders("agent");
      // } else {
      //   delete location.query.view;
      //   this.props.getDashboardOrders();
      // }
      this.setState({checkAll: false})
    }

    showColors(row) {
      this.props.show_color(row.id);
    }

    changeOrderColor(row, color, flag) {
      this.props.add_color([row.id], color, flag);
      this.props.show_color(row.id);
    }

    addColor(ids, data, flag) {
      this.props.add_color(ids, data, flag);
    }

    printInvoices()
    {
      this.props.printInvoices(this.props.selected_orders);
    }
    printPC() {
      this.props.printPC(this.props.selected_orders);
    }

    printPS()
    {
      this.props.printPS(this.props.selected_orders);
    }

    printGLS()
    {
      this.props.printGLS(this.props.selected_orders);
    }

    printZasilkovna()
    {
      this.props.printZasilkovna(this.props.selected_orders);
    }

    printExpedico()
    {
      this.props.printExpedico(this.props.selected_orders);
    }

    printCustomList()
    {
      this.props.printCustomList(this.props.selected_orders);
    }

    printStornoList()
    {
      this.props.printStornoList(this.props.selected_orders);
    }

    printTaxList()
    {
      this.props.printTaxList(this.props.selected_orders);
    }

    clearSelectedOrders() {
      this.setState({checkAll: false})
      this.props.clear_selected_orders();
      this.props.getDashboardOrders();
    }

    changeTypeSelect(selected_type) {
      this.setState({selected_type})
      var location = browserHistory.getCurrentLocation();
      if(selected_type.value == "agent") {
        location.query.view = "upsell";
      } else {
        location.query.view = selected_type.value;
      }
      this.resetPageNumber(location);
      browserHistory.replace(location)
      this.props.getDashboardOrders();
      this.props.clear_selected_orders();
      this.setState({checkAll: false})
    }

    renderTabs(orderStatusTab, index)
    {
      var location = browserHistory.getCurrentLocation();
      var activeTab = '';
      if(location.query.order_statuses) {
        activeTab = location.query.order_statuses;
      } else {
        activeTab = this.state.activeStatusTab;
      }

      return(
        <li className={`${activeTab == orderStatusTab.id ? 'active': ''}`} onClick={this.orderStatusesTabs.bind(this)} data-color={orderStatusTab.color} data-name={orderStatusTab.name} data-id={orderStatusTab.id} key={index}
        style={{borderTopColor: orderStatusTab.color}}>
          <a style={{backgroundColor: activeTab == orderStatusTab.id ? orderStatusTab.color : ''}}>{orderStatusTab.name}</a>
        </li>
      )
    }

    renderSingleOrder(order, index){
      let location = browserHistory.getCurrentLocation();
      let selectedStatus = this.props.orderstatuses.find(s => {
        return s.id === location.query.order_statuses
      })
      let color = "";
      if (!selectedStatus) {
        color = order.order_status.color
      }
      return(
        <tr style={{backgroundColor: color}} key={index}>
          <td className="ordersTable center"><input className="input-checkbox-style pointer" onClick={this.checkOrder.bind(this, order)} checked={order.checked} type="checkbox"/></td>
          <td className="ordersTable center">
            { !order.order_color_id ?
              <a onClick={this.showColors.bind(this, order)} className="pointer">
                <span className="show dash-sign"><i className="fas fa-th"></i></span>
              </a>
              :
              <a onClick={this.showColors.bind(this, order)} className="pointer">
                <span style={{backgroundColor: order.order_color_value}} className={`order-color-litle-box ${order.order_color_value ? 'show-litle-box' : 'hidden'}`}></span>
              </a>
            }
            <div className={`pick-color-litle pick-color-litle-style ${order.openColorPicker ? 'show' : 'hidden'}`}>
              <ul>
                {this.props.colors.map((color, index)=>
                  {
                    return(
                      <li onClick={this.changeOrderColor.bind(this, order, color, 1)} key={index} style={{backgroundColor: color.value}}></li>
                    );
                  }
                )}
              </ul>
            </div>
          </td>
          <td className="ordersTable center">{order.order_id2}</td>
          <td className="ordersTable">{order.shipping_first_name} {order.shipping_last_name}</td>
          <td className="ordersTable">{order.therapies.map(t => {return t.name}).join(", ")}</td>
          <td className="ordersTable">{order.accessories.map(a => {return a.name}).join(", ")}</td>
          {this.state.selected_type.value == "marketing" ? <td className="ordersTable">{order.discountData ? order.discountData.name : ""}</td> : ""}
          {this.state.selected_type.value == "marketing" ? <td className="ordersTable">{order.utm_source != null ? order.utm_source : ""}</td> : ""}
          {this.state.selected_type.value == "marketing" ? <td className="ordersTable">{order.utm_medium != null ? order.utm_medium : ""}</td> : ""}
          {this.state.selected_type.value == "marketing" ? <td className="ordersTable">{order.utm_campaign != null ? order.utm_campaign : ""}</td> : ""}
          {this.state.selected_type.value == "marketing" ? <td className="ordersTable">{order.utm_content != null ? order.utm_content : ""}</td> : ""}
          {this.state.selected_type.value == "agent" ? <td className="ordersTable">{order.responsible_agent_username != null ? order.responsible_agent_username : ""}</td> : ""}
          {this.state.selected_type.value == "agent" ? <td className="ordersTable center">{order.upsaleData ? parseFloat(order.upsaleData.initial_total).toFixed(2) : "0.00"} {order.currency_symbol}</td> : ""}
          {this.state.selected_type.value == "agent" ? <td className="ordersTable center">{order.upsaleData ? parseFloat(order.upsaleData.upsale).toFixed(2) : "0.00"} {order.currency_symbol}</td> : ""}
          {this.state.selected_type.value == "agent" ? <td className="ordersTable center">{order.upsaleData ? parseFloat(order.upsaleData.total).toFixed(2) : "0.00"} {order.currency_symbol}</td> : ""}
          {this.state.selected_type.value == "normal" ? <td className="ordersTable">{order.shipping_email}</td> : ""}
          {this.state.selected_type.value == "normal" ? <td className="ordersTable center">{order.shipping_country}</td> : ""}
          {this.state.selected_type.value == "normal" ? <td className="ordersTable center">{parseFloat(order.total).toFixed(2)} {order.currency_symbol}</td> : ""}
          {this.state.selected_type.value == "normal" ? <td className="ordersTable center">{moment (order.date_added).format("DD. MM. YYYY, HH:mm:ss")}</td> : ""}
          {this.state.selected_type.value == "normal" ? <td className="ordersTable center">
            <select onChange={this.changeOrderStatus.bind(this, order, 1)} value={order.order_status.name}>
              <option>{order.order_status.name}</option>
              {order.order_status.next_statuses.map((s, index) => {
                return (<option key={index} value={s}>
                  {s}
                </option>)
              })}
            </select>
          </td> : ""}
          <td className="ordersTable center"><Link target="_blank" to={`/order_details?id=${order.id}`}><span className="fas fa-info-circle pointer"></span></Link></td>
        </tr>
      )
    }

    getOrderDetails(id) {
      this.props.getOrderDetails(id);
      browserHistory.push("/order_details?id=" + id);
    }

    toggleFilter(){
      this.setState({openedFilters:!this.state.openedFilters})
    }

    render(){
      const { orders, orderstatuses, selected_orders, localCountries, views } = this.props;
      const { handleSubmit } = this.props;

      const c = localCountries.map(c => { return {label: c, value: c}});
      var statuses = JSON.parse(localStorage.getItem("orderstatuses")).filter(s => {return s.name == "Odobreno"
      || s.name == "Poslano" || s.name == "Dostavljeno" || s.name == "Zavrnjeno"});

      let location = browserHistory.getCurrentLocation();
      var nextStatusSelected = location.query.order_statuses ? orderstatuses.find(s => {
        return s.id == location.query.order_statuses
      }) : {}

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-10">
              <h2 className="box-title">Paketi influencerjem</h2>
            </div>
            <div className="col-md-2 align-self-center">
              <Select
                className="form-white"
                name=""
                placeholder="Izberi tip..."
                value={this.state.selected_type}
                options={views}
                multi={false}
                onChange={this.changeTypeSelect.bind(this)}
              />
            </div>
          </div>
          <div className="box box-default">
            <div className="resp-filters mt-3">
              <span className="filter-box-icon pointer" onClick={this.toggleFilter.bind(this)}>
                <i className="fa fa-filter" aria-hidden="true"></i>
              </span>
            </div>
            <div className={`row ${this.state.openedFilters ? 'd-none' : 'd-block'}  d-md-flex main-box-head filter-box`}>
              <div className="col-md-3">
                <div className="form-group">
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
              </div>
              <div className="col-md-3">
                 <DatePicker
                  selected={this.state.startDateFrom}
                  onChange={this.handleChangeStart.bind(this)}
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
              <div className="col-md-3">
                <form onSubmit={handleSubmit(this.setSearch.bind(this))}>
                  <div className="search-div">
                      <Field place="Išči naročila..." name="searchString" type="text" component={renderField}></Field>
                      <button type="submit" className="btn btn-secondary btn-search">IŠČI</button>
                  </div>
                </form>
              </div>
              <div className="col-md-3 right">
                <button onClick={selected_orders.length > 0 ? this.openSelectedOrdersModal.bind(this) : ""} className="btn btn-primary">{selected_orders.length} izbranih naročil</button>
              </div>
            </div>
            <Select
              className="d-block d-md-none form-white mt-4 status-select"
              name=""
              placeholder="Izberite tip..."
              value={this.state.selectedDropdown}
              onChange={this.changeDropdownStatus.bind(this)}
              options={this.state.dropdownStatuses}
              multi={false}
            />
            <div className="row d-none d-md-flex">
              <div className="col-md-12">
                <div className="nav-tabs-custom">
                  <ul className="nav nav-tabs">
                    {statuses.map(this.renderTabs.bind(this))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="table-responsive col-md-12">
                <table className="table table-striped f-size-c">
                  <thead>
                    <tr className="tr-text-color" style={{backgroundColor: this.state.activeRowColor ? this.state.activeRowColor : ""}}>
                      <th className="ordersTable center table-pad-l-8"><input className="pointer" value={this.state.checkAll} checked={this.state.checkAll} onChange={this.checkAll.bind(this)} type="checkbox"/></th>
                      <th className="ordersTable center table-pad-l-8">Barva</th>
                      <th className="ordersTable center table-pad-l-8">ID</th>
                      <th className="ordersTable table-pad-l-8">Influencer</th>
                      <th className="ordersTable table-pad-l-8">Terapije</th>
                      <th className="ordersTable table-pad-l-8">Dodatki</th>
                      {this.state.selected_type.value == "normal" ? <th className="ordersTable table-pad-l-8">E-pošta</th> : ""}
                      {this.state.selected_type.value == "normal" ? <th className="ordersTable table-pad-l-8">Država</th> : ""}
                      {this.state.selected_type.value == "normal" ? <th className="ordersTable center table-pad-l-8">Skupna cena</th> : ""}
                      {this.state.selected_type.value == "normal" ? <th className="ordersTable center table-pad-l-8">Datum oddaje</th> : ""}
                      {this.state.selected_type.value == "normal" ? <th className="ordersTable center table-pad-l-8">Status</th> : ""}
                      {this.state.selected_type.value == "marketing" ? <th className="ordersTable table-pad-l-8">Kupon</th> : ""}
                      {this.state.selected_type.value == "marketing" ? <th className="ordersTable table-pad-l-8">UTM Source</th> : ""}
                      {this.state.selected_type.value == "marketing" ? <th className="ordersTable table-pad-l-8">UTM Medium</th> : ""}
                      {this.state.selected_type.value == "marketing" ? <th className="ordersTable table-pad-l-8">UTM Campaign</th> : ""}
                      {this.state.selected_type.value == "marketing" ? <th className="ordersTable table-pad-l-8">UTM Content</th> : ""}
                      {this.state.selected_type.value == "agent" ? <th className="ordersTable table-pad-l-8">Agent</th> : ""}
                      {this.state.selected_type.value == "agent" ? <th className="ordersTable center table-pad-l-8">Prvotni znesek</th> : ""}
                      {this.state.selected_type.value == "agent" ? <th className="ordersTable center table-pad-l-8">Upsell</th> : ""}
                      {this.state.selected_type.value == "agent" ? <th className="ordersTable center table-pad-l-8">Končni znesek</th> : ""}
                      <th className="ordersTable center table-pad-l-8">Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(this.renderSingleOrder.bind(this))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row box-footer">
              <div className="col-md-4 left">
                <Pagination defaultPageSize={parseInt(this.state.selectedNumber)} current={parseInt(this.state.pageNumber)} pageSize={parseInt(this.state.selectedNumber)} onChange={this.pageChange.bind(this)} total={this.props.ordersCount} />
              </div>
              <div className="col-md-4 text-center">
                <p className="m-l-30">Prikaži: <select className="pointer select_orders" value={parseInt(this.state.selectedNumber)} onChange={this.changeNumberOrders.bind(this)}>
                  <option value='10'>10</option>
                  <option value='20'>20</option>
                  <option value='30'>30</option>
                  <option value='40'>40</option>
                  <option value='50'>50</option>
                </select></p>
              </div>
              <div className="col-md-4 text-right">
                <p>Vsa naročila: {this.props.ordersCount}</p>
              </div>
            </div>
          </div>
          {this.state.selectedOrdersModal ? <SelectedOrders selectedOrdersModal={this.state.selectedOrdersModal} closeSelectedOrdersModal={this.closeSelectedOrdersModal.bind(this)} nextStatusSelected={nextStatusSelected}
          selected_orders={selected_orders} changeSelectedOrdersStatus={this.changeSelectedOrdersStatus.bind(this)} change_selected_orders={this.change_selected_orders.bind(this)} addColor={this.addColor.bind(this)}
          colors={this.props.colors} printInvoices={this.printInvoices.bind(this)} printPS={this.printPS.bind(this)} printPC={this.printPC.bind(this)} printGLS={this.printGLS.bind(this)} printZasilkovna={this.printZasilkovna.bind(this)} printExpedico={this.printExpedico.bind(this)} printCustomList={this.printCustomList.bind(this)} printStornoList={this.printStornoList.bind(this)} printTaxList={this.printTaxList.bind(this)} clearSelectedOrders={this.clearSelectedOrders.bind(this)}/> : ""}
          {this.state.naknadnoModal ? <DateNaknadno closeNaknadnoModal={this.closeNaknadnoModal.bind(this)} status={this.state.change_status} naknadnoModal={this.state.naknadnoModal} EditDateNaknadno={this.EditDateNaknadno.bind(this)}/> : ""}
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
    getDashboardOrders: () => {
      dispatch(getDashboardOrders());
    },

    getColorDashboard: () => {
      dispatch(getColorDashboard());
    },

    editOrder: (id, obj, flag) => {
      dispatch(editOrder(id, obj, flag))
    },

    createColor: (obj) => {
      dispatch(createColor(obj));
    },

    deleteColor: (id) => {
      dispatch(deleteColor(id));
    },

    changeOrderStatus: (id, status, flag) => {
      dispatch(changeOrderStatus(id, status, flag));
    },

    toggleCheckBox: (id) => {
      dispatch(toggleCheckBox(id));
    },

    checkAllOrders: (flag) => {
      dispatch(checkAllOrders(flag));
    },

    clear_selected_orders: () => {
      dispatch(clear_selected_orders());
    },

    show_color: (id) => {
      dispatch(show_color(id));
    },

    add_color: (ids, color, flag) => {
      dispatch(add_color(ids, color, flag));
    },

    change_selected_orders: (event) => {
      dispatch(change_selected_orders(event));
    },

    printInvoices: (ids) => {
      dispatch(printInvoices(ids));
    },

    printPS: (ids) => {
      dispatch(printPS(ids));
    },

    printGLS: (ids) => {
      dispatch(printGLS(ids));
    },

    printZasilkovna: (ids) => {
      dispatch(printZasilkovna(ids));
    },

    printExpedico: (ids) => {
      dispatch(printExpedico(ids));
    },

    printCustomList: (ids) => {
      dispatch(printCustomList(ids));
    },

    printStornoList: (ids) => {
      dispatch(printStornoList(ids));
    },

    printTaxList: (ids) => {
      dispatch(printTaxList(ids));
    },


    checkedCountry: () => {
      dispatch(checkedCountry())
    },

    toggleCountry: (id, flag) => {
      dispatch(toggleCountry(id, flag))
    },

    setLocalCountries: (ids) => {
      dispatch(setLocalCountries(ids))
    },

    addNewOrder: (data) => {
      dispatch(addNewOrder(data))
    },

    getOrderDetails: (id) => {
      dispatch(getOrderDetails(id))
    },

    printPC: (ids) => {
      dispatch(printPC(ids));
    }
  }
}

function mapStateToProps(state) {
  var nextState = state.toJS();
  return {
    orders: nextState.orders_dashboard_data.orders,
    ordersCount: nextState.orders_dashboard_data.ordersCount,
    therapies: nextState.main_data.therapies,
    orderstatuses: nextState.main_data.orderstatuses,
    countries: nextState.main_data.countries,
    colors: nextState.colors_data.colors,
    colorsCount: nextState.colors_data.colorsCount,
    products: nextState.main_data.products,
    selected_orders: nextState.orders_dashboard_data.selected_orders,
    country: nextState.orders_dashboard_data.countries,
    user: nextState.main_data.user,
    localCountries: nextState.main_data.localCountries,
    //localStatuses: nextState.main_data.localStatuses,
    socket: nextState.main_data.socket,
    views: [{label:'Normal view', value:'normal'}, {label:'Marketing view', value:'marketing'}, {label:'Agent view', value:'agent'}]
  }
}

export default compose(
  reduxForm({
    form: 'InfluencerOrdersForm',
    enableReinitialize: true
  }), connect(mapStateToProps, mapDispatchToProps)
)(InfluencerOrders);
