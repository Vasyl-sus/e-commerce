import React, { useState, useEffect } from 'react';
import {browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { useSelector, useDispatch } from 'react-redux';
import { getSMSCustomers, checkCustomer, checkAllCustomers, getScenarios, createCampaign } from '../../actions/sms_campaign_actions';
import Search from '../../components/Search/Search';
import NewCampaignModal from './new_campaign_modal';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);
import { format } from 'date-fns';

import { selectCustomers, selectCustomersCount, selectLocalLanguagesForSelect, selectScenarios, selectFormValues, selectFormEnabled } from "./selectors";

const SMSCampaign = (props) => {
  const dispatch = useDispatch();
  var dateFrom = new Date(new Date().getTime() - 2592000000)
  var dateTo = new Date()

  dateFrom.setHours(0);
  dateFrom.setMinutes(0);

  dateTo.setHours(23)
  dateTo.setMinutes(59)
  const [pageNumber, setPageNumber] = useState(1) 
  const [pageLimit, setPageLimit] = useState(15);
  const [checkAll, setChekAll] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [startDateFrom, setStartDateFrom] = useState(dateFrom);
  const [startDateTo, setStartDateTo] = useState(dateTo);
  const [countNumber, setCountNumber] = useState(null)
  const [newModal, setNewModal] = useState(false)

  const customers = useSelector(selectCustomers)
  const customersCount = useSelector(selectCustomersCount)
  const localCountries = useSelector(selectLocalLanguagesForSelect)
  const scenarios = useSelector(selectScenarios)
  const selector = useSelector(selectFormValues)
  const formEnabled = useSelector(selectFormEnabled)


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

    if (location.query.country) {
      setSelectedCountry(location.query.country)
    }
    if(location.query.from_date)
      setStartDateFrom(new Date(parseInt(location.query.from_date)));
    else
      location.query.from_date = startDateFrom.getTime();

    if(location.query.to_date)
      setStartDateTo(new Date(parseInt(location.query.to_date)));
    else
      location.query.to_date = startDateTo.getTime();

    browserHistory.replace(location);
    dispatch(getSMSCustomers());
    dispatch(getScenarios());

    return () => {
      dispatch(checkAllCustomers(false));
    }
  }

  useEffect(mountFunction, [])

  const pageChange = (page) => {
    let location = browserHistory.getCurrentLocation();
    location.query.pageNumber = page;
    browserHistory.replace(location);
    setPageNumber(page);
    dispatch(getSMSCustomers());
  }

  const checkOrder = (customer) => () => {
    let selected = selectedCustomers;
    let checked = selected.find(s => {
      return s.id === customer.id
    })
    
    if (!checked) {
      selected.push(customer);
    } else {
      selected = selected.filter(s => {
        return s.id !== customer.id
      })
    }
    setSelectedCustomers(selected);
    dispatch(checkCustomer(customer.id))
  }

  const checkAllF = () => {
    setChekAll(!checkAll);
    let selected = selectedCustomers;
    customers.map(c => {
      let checked = selected.find(s => {
        return s.id === c.id
      })
      if (!checkAll) {
        if (!checked) {
          selected.push(c);
        }
      }
      else {
        selected = selected.filter(s => {
          return s.id !== c.id
        })
      }
    })
    
    setSelectedCustomers(selected);
    
    dispatch(checkAllCustomers(!checkAll));
  }


  const resetPageNumber = (location) => {
    location.query.pageNumber = 1;
    setPageNumber(1);
    return location;
  }

  const changeCountrySelect = (country) => {
    setSelectedCountry(country);
    var location = browserHistory.getCurrentLocation();
    if(country)
      location.query.country = country.value;
    else
      delete location.query.country;
    resetPageNumber(location);
    browserHistory.replace(location)
    dispatch(getSMSCustomers());
  }

  const renderSingleCustomer = (customer, index) => {
    return (
      <tr key={index}>
        <td className="ordersTable center"><input className="input-checkbox-style pointer" value={customer.checked} checked={customer.checked} onChange={checkOrder(customer)} type="checkbox"/></td>
        <td>{customer.first_name} {customer.last_name}</td>
        <td>{customer.email}</td>
        <td>{customer.telephone}</td>
        <td>{customer.country}</td>
        <td className="center">{customer.orders_count}</td>
      </tr>
    )
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

    setStartDateFrom(dateFrom);
    setStartDateTo(dateTo)
    if (dateTo) {
      browserHistory.replace(location);
      dispatch(getSMSCustomers());
    }
  }

  const setSearch = (value) => {
    let location = browserHistory.getCurrentLocation();
    resetPageNumber(location);
    if(value === "")
      delete location.query.num_of_orders;
    else
      location.query.num_of_orders = value;
      
    browserHistory.replace(location);
    dispatch(getSMSCustomers());
  }

  const toggleNewModal = () => {
    setNewModal(!newModal)
  }

  const createCampaignF = (data, flag) => {
    dispatch(createCampaign(data, flag))
  }
  
  return (
    <div className="content-wrapper container-fluid">
      <div className="row">
        <div className="col-md-12">
          <h2 className="box-title">SMS Campaign</h2>
        </div>
      </div>
      <div className="box box-default">
        <div className="row main-box-head">
          <div className="col-md-3">
            <Select
              className="form-white"
              name=""
              placeholder="Izberi državo..."
              value={selectedCountry}
              options={localCountries}
              multi={false}
              onChange={changeCountrySelect}
            />
          </div>
          <div className="col-md-3">
            <div className="mb-3">
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
          </div>
          <div className="col-md-2 search-div">
            <Search setSearch={setSearch} type="number" />
          </div>
          <div className="col-md-3 right">
            <button onClick={toggleNewModal} className="btn btn-default"> Dodaj kampanja {selectedCustomers.length}</button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive no-padding">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th className="ordersTable center table-pad-l-8"><input className="pointer" value={checkAll} checked={checkAll} onChange={checkAllF} type="checkbox"/></th>
                    <th className="left table-pad-l-8">Ime in priiemk</th>
                    <th className="left table-pad-l-8">Email</th>
                    <th className="left table-pad-l-8">Telefon</th>
                    <th className="left table-pad-l-8">Država</th>
                    <th className="center table-pad-l-8">Št. naročil</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(renderSingleCustomer)}
                </tbody>
              </table>
            </div>
            <div className="box-footer w-100 pb-3">
              <div className="row w-100">
                <div className="col-sm-6 col-xs-8 w-100">
                  <div className="pagination-block">
                    <Pagination defaultPageSize={parseInt(pageLimit)} defaultCurrent={parseInt(pageNumber)} onChange={pageChange} total={customersCount}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {newModal && <NewCampaignModal createCampaign={createCampaignF} formEnabled={formEnabled} selector={selector} customers={customers.map(c => {return {value: c.telephone, label: `${c.first_name} ${c.last_name}`}})} initialValues={Immutable.fromJS({destinations: selectedCustomers.map((s => {return {value: s.telephone, label: `${s.first_name} ${s.last_name}`}}))})} scenarios={scenarios} newModal={newModal} closeNewModal={toggleNewModal} />}
    </div>
  )
}
export default SMSCampaign;
