import React, { useState, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import {getDashboardOrders, changeOrderStatus, toggleCheckBox, checkAllOrders, clear_selected_orders,
show_color, add_color, change_selected_orders, printInvoices, printInvoicesKnjizara ,printPreInvoices, printGLS, printZasilkovna, printExpedico, printCustomList, printStornoList, printTaxList, printPS, printPC, printThankYou, editOrder} from '../../actions/orders_dashboard_actions';

import { selectLocalCountries, selectOrderStatuses, selectSelectedOrders, selectCollors, selectOrders, selectOrdersCount } from "./selector"
import Search from "../../components/DashboardSearch"

import {getColorDashboard} from '../../actions/colors_actions';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import SelectedOrders from './selected_orders.js';
import DateNaknadno from './date_naknadno.js';
import DashboardTable from "./dashboard_table";

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);

const Dashboard = () => {
  const dispatch = useDispatch();

  var dateFrom = new Date(new Date().getTime() - 2592000000)
  var dateTo = new Date()
  var location = browserHistory.getCurrentLocation();

  dateFrom.setHours(0);
  dateFrom.setMinutes(0);

  dateTo.setHours(23)
  dateTo.setMinutes(59)
  const [selectedOrdersModal, setselectedOrdersModal] = useState(false)
  const [selectedCountries, setselectedCountries] = useState([])
  const [checkAll, setcheckAll] = useState(false)
  const [pageNumber, setpageNumber] = useState(1)
  const [pageLimit, setpageLimit] = useState(10)
  const [selectedNumber, setselectedNumber] = useState(10)
  const [startDateFrom, setstartDateFrom] = useState(dateFrom)
  const [naknadnoModal, setnaknadnoModal] = useState(false)
  const [startDateTo, setstartDateTo] = useState(dateTo)
  const [activeRowColor, setactiveRowColor] = useState("")
  const [selected_type, setselected_type] = useState({label:'Normal view', value:'normal'})
  const [openedFilters, setopenedFilters] = useState(true)
  const [dropdownStatuses, setdropdownStatuses] = useState([])
  const [selectedDropdown, setselectedDropdown] = useState({})
  const [orders_ids, setorders_ids] = useState([])
  const [change_status, setchange_status] = useState(null)
  const [activeStatusTab, setactiveStatusTab] = useState(null)

  const localCountries = useSelector(selectLocalCountries);
  const orderstatuses = useSelector(selectOrderStatuses)
  const views = [{label:'Normal view', value:'normal'}, {label:'Marketing view', value:'marketing'}, {label:'Agent view', value:'agent'}, {label:'Storno view', value:'storno'}]
  const selected_orders = useSelector(selectSelectedOrders)
  const colors = useSelector(selectCollors)
  const orders = useSelector(selectOrders)
  const ordersCount = useSelector(selectOrdersCount)

  const mountFunction = () => {
    var selectedCountries;
    if(!location.query.countries)
    {
      location.query.countries = localCountries;
      selectedCountries = localCountries.map(o => {return {label: o, value: o}});
      setselectedCountries(selectedCountries)
    } else {
      if (typeof location.query.countries != 'string')
      {
        selectedCountries = location.query.countries.map(o => {return {label: o, value: o}});
        setselectedCountries(selectedCountries)
      }
      else
      {
        setselectedCountries([location.query.countries])
      }
    }

    if(!location.query.order_statuses) {
      var find_status = orderstatuses.find(s => {return s.name == "Neobdelano"})
      location.query.order_statuses = find_status && find_status.id;
      setactiveRowColor(find_status && find_status.color);
      setselectedDropdown({label:find_status && find_status.name, value: find_status && find_status.id});
    }
    else {
      var st = orderstatuses.find(s=> {
        return s.id == location.query.order_statuses
      })
      setactiveRowColor(st && st.color);
      setselectedDropdown({label: st && st.name, value: st && st.id});
    }

    if(location.query.pageLimit)
      setselectedNumber(location.query.pageLimit);

    if(location.query.pageNumber)
      setpageNumber(location.query.pageNumber);

    if(location.query.from_date)
      setstartDateFrom(new Date(parseInt(location.query.from_date)));
    else
      location.query.from_date = startDateFrom.getTime();

    if(location.query.to_date)
      setstartDateTo(new Date(parseInt(location.query.to_date)));
    else
      location.query.to_date = startDateTo.getTime();

    if(!location.query.view) {
      location.query.view = views[0].value
      setselected_type(views[0])
    } else {
      var find_view;
      if(location.query.view == "upsell") {
        find_view = views.find(v => {return v.value == "agent"})
        setselected_type(find_view)
      } else {
        find_view = views.find(v => {return v.value == location.query.view})
        setselected_type(find_view)
      }
    }

    if(location.query.search)
      delete location.query.search;

    browserHistory.replace(location);
    dispatch(getDashboardOrders());
    dispatch(getColorDashboard());

    var arr=[];
    for(var i=0; i < orderstatuses.length; i++){
      var tmp = {};
      tmp.label = orderstatuses[i].name;
      tmp.value = orderstatuses[i].id;
      tmp.color = orderstatuses[i].color;
      arr.push(tmp);
      setdropdownStatuses(arr);
    }
  };

  useEffect(mountFunction, [])

  const resetPageNumber = (location) => {
    location.query.pageNumber = 1;
    setpageNumber(1);
    return location;
  }

  const pageChange = (pageNumber) => {
    let location = browserHistory.getCurrentLocation();
    location.query.pageNumber = pageNumber;
    browserHistory.replace(location);
    dispatch(getDashboardOrders());
    setpageNumber(pageNumber)
    setcheckAll(false);
  }

  const setSearch = (data) => {
    let location = browserHistory.getCurrentLocation();
    resetPageNumber(location);
    if(data.searchString=="")
      delete location.query.search;
    else
      location.query.search = data.searchString;

    browserHistory.replace(location);
    orderStatusesTabs({currentTarget: {dataset: {id: "c7d5ab20-1d57-11e9-a1ed-f9390b54a3b5", color: "#414141", name: 'Vse'}}});

    setcheckAll(false)
    dispatch(clear_selected_orders());
  }

  const handleChangeStart = (dates) => {
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
  
    setstartDateFrom(dateFrom);
    setstartDateTo(dateTo);
    if (dateTo) { // Only replace location and dispatch if dateTo is defined
      browserHistory.replace(location);
      dispatch(getDashboardOrders());
      dispatch(clear_selected_orders());
      setcheckAll(false);
    }
  }

  const changeNumberOrders = (event) => {
    var selectedNumber = event.target.value;
    console.log("Selected Number " + selectedNumber);
    location = browserHistory.getCurrentLocation();
    location.query.pageLimit = selectedNumber;
    resetPageNumber(location);
    browserHistory.replace(location);

    dispatch(getDashboardOrders());
    setcheckAll(false);
    dispatch(clear_selected_orders());
    setselectedNumber(selectedNumber);
  }

  const orderStatusesTabs = (e) => {
    let location = browserHistory.getCurrentLocation();
    if(e.currentTarget.dataset.name!="Vse")
      location.query.order_statuses = e.currentTarget.dataset.id;
    else
      delete location.query.order_statuses;
    setactiveRowColor(e.currentTarget.dataset.color)
    setactiveStatusTab(e.currentTarget.dataset.id)
    resetPageNumber(location);
    browserHistory.replace(location);
    dispatch(getDashboardOrders());
    setcheckAll(false);
    dispatch(clear_selected_orders());
  }

  const changeDropdownStatus = (data) => {
    let location = browserHistory.getCurrentLocation();
    if(data.value!="f4377440-3e79-11e8-84c0-37e104967e7a")
      location.query.order_statuses = data.value;
    else
      delete location.query.order_statuses;
    setselectedDropdown(data);
    setactiveRowColor(data.color)
    setactiveStatusTab(data.value)
    resetPageNumber(location);
    browserHistory.replace(location);
    dispatch(getDashboardOrders());
    setcheckAll(false);
    dispatch(clear_selected_orders());
  }

  const changeCountriesSelect = (event) => {
    setselectedCountries(event)
    var names = event.map(e => { return e.value });

    location = browserHistory.getCurrentLocation();
    location.query.countries = names;
    resetPageNumber(location);
    browserHistory.replace(location)
    dispatch(getDashboardOrders());
    dispatch(clear_selected_orders());
    setcheckAll(false)
  }

  const _changeOrderStatus = (order, flag) => (event) => {
    var status = event.target.value;
    if(status == "Naknadno") {
      openNaknadnoModal();
      setorders_ids([order.id])
      setchange_status(status)
    } else {
      dispatch(changeOrderStatus([order.id], status, flag))
    }
  }

  const checkOrder = (order) => () => {
    dispatch(toggleCheckBox(order));
    setcheckAll(false)
  }

  const _checkAll = () => {
    setcheckAll(!checkAll)
    dispatch(checkAllOrders(!checkAll));
  }

  const openNaknadnoModal = () => {
    setnaknadnoModal(true);
  }

  const closeNaknadnoModal = () => {
    setnaknadnoModal(false);
  }

  const EditDateNaknadno = (obj) => {
    dispatch(changeOrderStatus(orders_ids, change_status, 1))
    dispatch(editOrder(orders_ids, obj, 1));
    setnaknadnoModal(false);
  }

  const openSelectedOrdersModal = () => {
    setselectedOrdersModal(true);
  }

  const closeSelectedOrdersModal = () => {
    setselectedOrdersModal(false);
  }

  const changeSelectedOrdersStatus = (status, obj, flag) => {
    var ids = selected_orders.map(o => { return o.id });
    dispatch(changeOrderStatus(ids, status, flag));
    if(status == "Naknadno") {
      dispatch(editOrder(ids, obj, flag));
    }
  }

  const _change_selected_orders = (event) => {
    dispatch(change_selected_orders(event));
    setcheckAll(false)
  }

  const showColors = (row) => () => {
    dispatch(show_color(row.id));
  }

  const _changeOrderColor = (row, color, flag) => () => {
    dispatch(add_color([row.id], color, flag));
    dispatch(show_color(row.id));
  }

  const addColor = (ids, data, flag) => {
    dispatch(add_color(ids, data, flag));
  }

  const _printInvoices = () => {
    dispatch(printInvoices(selected_orders));
  }

  const _printInvoicesKnjizara = () => {
    dispatch(printInvoicesKnjizara(selected_orders));
  }

  const _printPreInvoices = () => {
    dispatch(printPreInvoices(selected_orders));
  }

  const _printPS = () => {
    dispatch(printPS(selected_orders));
  }

  const _printPC = () => {
    dispatch(printPC(selected_orders));
  }

  const _printGLS = () => {
    dispatch(printGLS(selected_orders));
  }

  const _printZasilkovna = () => {
    dispatch(printZasilkovna(selected_orders));
  }

  const _printExpedico = () => {
    dispatch(printExpedico(selected_orders));
  }

  const _printCustomList = () => {
    dispatch(printCustomList(selected_orders));
  }

  const _printStornoList = () => {
    dispatch(printStornoList(selected_orders));
  }

  const _printTaxList = () => {
    dispatch(printTaxList(selected_orders));
  }

  const _printThankYou = () => {
    dispatch(printThankYou(selected_orders));
  }

  const clearSelectedOrders = () => {
    setcheckAll(false)
    dispatch(clear_selected_orders());
    dispatch(getDashboardOrders());
  }

  const changeTypeSelect = (selected_type) => {
    setselected_type(selected_type)
    location = browserHistory.getCurrentLocation();
    if(selected_type.value == "agent") {
      location.query.view = "upsell";
    } else {
      location.query.view = selected_type.value;
    }
    resetPageNumber(location);
    browserHistory.replace(location)

    dispatch(getDashboardOrders());
    dispatch(clear_selected_orders());
    setcheckAll(false)
  }

  const toggleFilter = () => {
    setopenedFilters(!openedFilters)
  }

  const c = localCountries.map(c => { return {label: c, value: c}});

  var nextStatusSelected = location.query.order_statuses ? orderstatuses.find(s => {
    return s.id == location.query.order_statuses
  }) : {}

  return (
    <div className="content-wrapper container-fluid">
{/*  <Snowfall color="#fff" snowflakeCount={250} /> */}

      <div className="row title-row">
        <div className="col-md-10">
          <h2 className="box-title">Naročila</h2>
        </div>
        <div className="col-md-2 align-self-center">
          <Select
            className="form-white"
            name=""
            placeholder="Izberi tip..."
            value={selected_type}
            options={views}
            multi={false}
            onChange={changeTypeSelect}
          />
        </div>
      </div>
      <div className="box box-default">
        <div className="resp-filters mt-3">
          <span className="filter-box-icon pointer" onClick={toggleFilter}>
            <i className="fa fa-filter" aria-hidden="true"></i>
          </span>
        </div>
        <div className={`row ${openedFilters ? 'd-none' : 'd-block'}  d-md-flex main-box-head filter-box`}>
          <div className="col-md-4">
            <div className="form-group">
              <Select
                className="form-white select-box"
                name=""
                placeholder="Izberi države..."
                value={selectedCountries}
                options={c}
                multi={true}
                onChange={changeCountriesSelect}
              />
            </div>
          </div>
          <div className="col-md-2">
            <DatePicker
              selected={startDateFrom}
              onChange={handleChangeStart}
              startDate={startDateFrom}
              endDate={startDateTo}
              selectsRange
              dateFormat="dd.MM.yyyy"
              placeholderText="Izberi obdobje"
              maxDate={dateMax}
              className="multi-dateinput"
              locale="sl"
              showIcon
            />
          </div>
          <div className="col-md-2">
            <Search setSearch={setSearch} />
          </div>
          <div className="col-md-4 right">
            <button disabled={selected_orders.length <= 0} onClick={openSelectedOrdersModal} className="btn btn-primary">{selected_orders.length} izbranih naročil</button>
          </div>
        </div>
        <Select
          className="d-block d-md-none form-white mt-4 status-select"
          name=""
          placeholder="Izberite tip..."
          value={selectedDropdown}
          onChange={changeDropdownStatus}
          options={dropdownStatuses}
          multi={false}
        />
        <DashboardTable
          activeRowColor={activeRowColor}
          checkAll={checkAll}
          _checkAll={_checkAll}
          selected_type={selected_type}
          orders={orders}
          orderstatuses={orderstatuses}
          showColors={showColors}
          colors={colors}
          _changeOrderColor={_changeOrderColor}
          _changeOrderStatus={_changeOrderStatus}
          orderStatusesTabs={orderStatusesTabs}
          checkOrder={checkOrder}
          activeStatusTab={activeStatusTab}
          selected_orders={selected_orders}
        />
        <div className="row box-footer">
          <div className="col-md-4 left">
            <Pagination defaultPageSize={parseInt(selectedNumber)} current={parseInt(pageNumber)} pageSize={parseInt(selectedNumber)} onChange={pageChange} total={ordersCount} />
          </div>
          <div className="col-md-4 text-center">
            <p className="m-l-30">Prikaži: <select className="pointer select_orders" value={parseInt(selectedNumber)} onChange={changeNumberOrders}>
              <option value='10'>10</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
              <option value='150'>150</option>
              <option value='200'>200</option>
              <option value='99999999'>Vse</option>
            </select></p>
          </div>
          <div className="col-md-4 text-right">
            <p>Vsa naročila: {ordersCount}</p>
          </div>
        </div>
      </div>
      {selectedOrdersModal ?
        <SelectedOrders
          printPreInvoices={_printPreInvoices}
          printThankYou={_printThankYou}
          selectedOrdersModal={selectedOrdersModal}
          closeSelectedOrdersModal={closeSelectedOrdersModal}
          nextStatusSelected={nextStatusSelected}
          selected_orders={selected_orders}
          changeSelectedOrdersStatus={changeSelectedOrdersStatus} change_selected_orders={_change_selected_orders}
          addColor={addColor}
          colors={colors}
          printInvoices={_printInvoices}
          printInvoicesKnjizara={_printInvoicesKnjizara}
          printPC={_printPC}
          printPS={_printPS}
          printGLS={_printGLS}
          printZasilkovna={_printZasilkovna}
          printExpedico={_printExpedico}
          printCustomList={_printCustomList}
          printStornoList={_printStornoList}
          printTaxList={_printTaxList}
          clearSelectedOrders={clearSelectedOrders} /> : ""}

      {naknadnoModal ? <DateNaknadno closeNaknadnoModal={closeNaknadnoModal} status={change_status} naknadnoModal={naknadnoModal} EditDateNaknadno={EditDateNaknadno}/> : ""}
    </div>
  )
}

export default memo(Dashboard);
