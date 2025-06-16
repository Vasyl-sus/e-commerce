import React, { useState, useEffect } from 'react';
import {Link, browserHistory} from 'react-router';
import { useDispatch, useSelector } from "react-redux"
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import Moment from "moment";
import {getCustomerProfiles, createProfile, editProfile, deleteProfile, registerInfoBip,
showCustomerData, setInitialValuesNewOrder} from '../../actions/customer_profile_actions';
import { selectLocalCountries } from "../orders_dashboard/selector";
import { selectCustomer, selectBadges, selectDeliveryMethods, selectPaymentMethods, selectCustomers, selectCustomerFormValues, selecteditCustomerFormValues, selectCustomersCount, selectCountries } from "./selectors"
import {getOrderDetails} from '../../actions/order_details_actions';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import NewProfile from './new_profile_customer_modal.js';
import EditProfile from './edit_profile_customer_modal.js';
import Search from "../../components/DashboardSearch";
//import Snowfall from 'react-snowfall';


const CustomerProfiles = ({ setTimeout }) => {
  const dispatch = useDispatch();
  var location;

  const [selectedCustomer, setselectedCustomer] = useState(null);
  const [newModal, setnewModal] = useState(false);
  const [editModal, seteditModal] = useState(false);
  const [activeRow, setactiveRow] = useState(null);
  const [enabled, setenabled] = useState(false);
  const [activeStar, setactiveStar] = useState(0);
  const [selectedCountries, setselectedCountries] = useState([]);
  const [activeFilter, setactiveFilter] = useState(false);
  const [searchString, setsearchString] = useState("");
  const [pageNumber, setpageNumber] = useState(1);
  const [pageLimit, setpageLimit] = useState(15);
  const [count, setcount] = useState(0);
  const [customer_rating, setcustomer_rating] = useState(0);
  const [customerDataModal, setcustomerDataModal] = useState(false);
  const [showCustomerDetailsDiv, setshowCustomerDetailsDiv] = useState(false);
  const [customerID, setcustomerID] = useState(null);
  const [addBadgeBtn, setaddBadgeBtn] = useState(false);

  const localCountries = useSelector(selectLocalCountries);
  const customer_data = useSelector(selectCustomer)
  const badges = useSelector(selectBadges)
  const deliverymethods = useSelector(selectDeliveryMethods)
  const paymentmethods = useSelector(selectPaymentMethods)
  const customers = useSelector(selectCustomers)
  const customersCount = useSelector(selectCustomersCount)
  const customerFormValues = useSelector(selectCustomerFormValues)
  const editCustomerFormValues = useSelector(selecteditCustomerFormValues)
  const countries = useSelector(selectCountries)

  const mountFunction = () => {
    location = browserHistory.getCurrentLocation();
    if(location.query.pageLimit)
      setpageLimit(location.query.pageLimit);
    else
      location.query.pageLimit = 15;

    if(location.query.pageNumber)
      setpageNumber(location.query.pageNumber);
    else
      location.query.pageNumber = 1;

    var selectedCountries;
    if(!location.query.countries)
    {
      location.query.countries = localCountries;
      selectedCountries = localCountries.map(o => {return {label: o, value: o}});
      setselectedCountries(selectedCountries)
    }
    else {
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

    if(location.query.search)
    {
      delete location.query.search;
    }

    if(localStorage.getItem('customer')) {
      setcustomerID(JSON.parse(localStorage.getItem('customer')).id)
      dispatch(showCustomerData(JSON.parse(localStorage.getItem('customer')).id));
    }

    browserHistory.replace(location);
    dispatch(getCustomerProfiles());

    return () => {
      localStorage.removeItem("customer");
    };
  }

  useEffect(mountFunction, [])


  const _getOrderDetails = (id) => () => {
    browserHistory.push("/order_details?id=" + id);
    dispatch(getOrderDetails(id));
  }

  const changeCustomerSubscription = (customer, flag) => () => {
    if (flag) {
      dispatch(editProfile(customer.id, {subscribe_action: 'subscribe'}))
    } else {
      dispatch(editProfile(customer.id, {subscribe_action: 'unsubscribe'}))
    }
  }

  const _registerInfoBip = (flag) => () => {
    if (flag) {
      dispatch(registerInfoBip(customer.id, {subscribe_action: 'subscribe'}))
    } else {
      dispatch(registerInfoBip(customer.id, {subscribe_action: 'unsubscribe'}))
    }
  }

  const renderSingleCustomer = (customer, index) => {
    var subscribedText = "";
    var cust = customer_data.toJS();
    
    // Debug logging for Klaviyo data
    console.log('Customer data:', {
      customerId: customer.id,
      selectedId: customerID,
      isSelected: customerID === customer.id,
      customerData: cust,
      klaviyoData: cust.klaviyo,
      lists: cust.klaviyo?.lists
    });

    // Only show Klaviyo data for the selected customer
    const isSelected = customerID === customer.id;
    
    // Check Klaviyo lists and overall status
    if (isSelected && cust.klaviyo && cust.klaviyo.lists && cust.klaviyo.lists.length > 0) {
      // If customer is in any list, show as subscribed
      const subscribedToAnyList = cust.klaviyo.lists.some(list => list.status === 'subscribed');
      console.log('Lists subscription status:', {
        lists: cust.klaviyo.lists.map(list => ({
          name: list.name,
          status: list.status
        })),
        subscribedToAnyList
      });
      
      if (subscribedToAnyList) {
        subscribedText = 'Prijavljen';
      } else {
        subscribedText = 'Odjavljen';
      }
    } else if (customer.subscribed == 404) {
      subscribedText = 'Ni prijavljen';
    } else if (customer.subscribed == 'subscribed') {
      subscribedText = 'Prijavljen';
    } else if (customer.subscribed == 'pending') {
      subscribedText = 'V čakanju';
    } else if (customer.subscribed == 'unsubscribed') {
      subscribedText = 'Odjavljen';
    }

    var infobipText = "";
    if (customer.infoBipSubscribe == 404) {
      infobipText = 'Ni v bazi'
    } else if (customer.infoBipSubscribe == 'unsubscribed') {
      infobipText = 'Odjavljen'
    } else if (customer.infoBipSubscribe == 'nosubscribe') {
      infobipText = 'Odjavljen'
    } else if (customer.infoBipSubscribe == 'subscribed') {
      infobipText = 'Prijavljen'
    }

    var color = '#fff'
    if (index % 2 != 0) {
      color = "#fbfbfb"
    }

    return (
      <tbody style={{backgroundColor: color}} key={index}>
        <tr className="pointer">
          <td onClick={showCustomerProfileData(customer)}>
            <img width="20px" src={`/images/flags/${customer.country && customer.country.toLowerCase()}.svg`} />
          </td>
          <td onClick={showCustomerProfileData(customer)}>{customer.first_name} {customer.last_name}</td>
          <td onClick={showCustomerProfileData(customer)}>{customer.email}</td>
          <td onClick={showCustomerProfileData(customer)}>{customer.telephone}</td>
          <td onClick={showCustomerProfileData(customer)}>{customer.address}</td>
          <td onClick={showCustomerProfileData(customer)}>{customer.city}</td>
          <td onClick={showCustomerProfileData(customer)}>
            {customer.upsale_count>0 && <span className="customer-flags gold-badge">{customer.upsale_count}x UPSELL</span>}
            {customer.no_upsale_count>0 && <span className="customer-flags red">{customer.no_upsale_count}x BREZ UPSELL</span>}
            {customer.declined_count >0 && <span className="customer-flags red">{customer.declined_count}x NEPREVZEM</span>}
            {customer.badges &&
              customer.badges.map((u, index) => {
                return (
                  <span key={index} className="customer-flags" style={{borderColor: u.color, color: u.color}}>{u.name}</span>
                )
              })
            }
          </td>
          <td onClick={newOrderCustomerDetails(customer)}>
            <Link to={{pathname: '/new_order', query: {customer_id: customer.id}}}>
              <i className="fas fa-plus-circle fa-big" style={{color: "var(--main-color)"}} aria-hidden="true"></i>
            </Link>
          </td>
          <td onClick={openEditModal(customer)}>
            <i className="fa fa-edit" aria-hidden="true" style={{color: "var(--main-color)"}}></i>
          </td>
          <td onClick={DeleteCustomerProfile(customer)}>
            <i className="fas fa-trash" aria-hidden="true" style={{color: "var(--main-color)"}}></i>
          </td>
        </tr>
        <tr>
          <td className={`hidden-tr ${customerID == customer.id ? '' : 'closed'}`} colSpan="12">
            <div className="main-hidden container-fluid">
              <div className="d-flex align-items-center row customer-name">
                <h3>{customer.first_name} {customer.last_name}</h3>
                {customer.upsale_count>0 && <span className="customer-flags gold-badge">{customer.upsale_count}x UPSELL</span>}
                {customer.no_upsale_count>0 && <span className="customer-flags red">{customer.no_upsale_count}x BREZ UPSELL</span>}
                {customer.declined_count > 0 && <span className="customer-flags red">{customer.declined_count}x NEPREVZEM</span>}
                {customer.badges &&
                  customer.badges.map((u, index) => {
                    return (
                      <span key={index} className="customer-flags" style={{backgroundColor: u.color}}>{u.name} <i className="x-button" onClick={deleteBadge(u, customer)}>X</i></span>
                    )
                  })
                }

                {!addBadgeBtn ? <button className="btn btn-tag btn-sm" onClick={addBadgeClick}>Dodaj značko</button>: ''}
                {addBadgeBtn &&
                <select name="order_status" className={`form-control new-select-badges`} onChange={newBadge.bind(this, customer)} >
                  <option key="12" value=""></option>
                  {badges.map((u, index) => {
                    return (
                      <option key={index} value={u.id}>{u.name}</option>
                    )
                  })}
                </select> }
                <div className="p-2 ml-auto">
                  <button className="btn btn-primary btn-lg m-r-10"><Link to={{pathname: '/new_order', query: {customer_id: customer.id}}}>Dodaj naročilo</Link></button>
                  <button className="btn btn-secondary btn-lg" onClick={openEditModal(customer)}>Uredi</button>
                </div>
              </div>
              <div className="row d-flex align-items-center justify-content-start">
                <div className="customer-info">
                  <span className="details-up-cust">ulica in hišna številka</span><br/>
                  <span className="details-bot-cust">{customer.address}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">poštna št.</span><br/>
                  <span className="details-bot-cust">{customer.postcode}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">mesto</span><br/>
                  <span className="details-bot-cust">{customer.city}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">država</span><br/>
                  <span className="details-bot-cust">{customer.country}</span>
                </div>
              </div>
              <div className="row m-t-20 d-flex align-items-center justify-content-start">
                <div className="customer-info">
                  <span className="details-up-cust">telefon</span><br/>
                  <span className="details-bot-cust">{customer.telephone}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">e-pošta</span><br/>
                  <span className="details-bot-cust">{customer.email}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">rojstni datum</span><br/>
                  <span className="details-bot-cust">{customer.birthdate == null ? "/" : Moment (customer.birthdate).format("DD. MM. YYYY")}</span>
                </div>
              </div>
              <div className="row m-t-30 d-flex">
                  <span className="shipping-title">Podatki za dostavo</span>
              </div>
              <div className="row mt-2 d-flex align-items-center justify-content-start">
                <div className="customer-info">
                  <span className="details-up-cust">ulica in hišna številka</span><br/>
                  <span className="details-bot-cust">{customer.shipping_address}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">poštna št.</span><br/>
                  <span className="details-bot-cust">{customer.shipping_postcode}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">mesto</span><br/>
                  <span className="details-bot-cust">{customer.shipping_city}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">država</span><br/>
                  <span className="details-bot-cust">{customer.shipping_country}</span>
                </div>
              </div>
              <div className="row m-t-20 d-flex align-items-center">
                <div className="subscribed-info">
                  <span className="details-up-cust">Klaviyo status</span><br/>
                  <span className="details-bot-cust">{subscribedText}</span>
                  {isSelected ? (
                    <>
                      <div className="d-block">
                        <div className="details-bot-cust" style={{fontWeight: 'bold', marginTop: '8px'}}>Seznami:</div>
                        {cust.klaviyo && cust.klaviyo.lists && cust.klaviyo.lists.map((list, index) => (
                          <div key={index} className="details-bot-cust small" style={{marginBottom: '4px'}}>
                            {list.name}: {list.status === 'subscribed' ? 'Prijavljen' : 'Odjavljen'}
                          </div>
                        ))}
                      </div>
                      <div className="d-block">
                        <div className="details-bot-cust" style={{fontWeight: 'bold', marginTop: '8px'}}>Segmenti:</div>
                        {cust.klaviyo && cust.klaviyo.active_segments && cust.klaviyo.active_segments.map((segment, index) => (
                          <div key={index} className="details-bot-cust small" style={{marginBottom: '4px'}}>
                            {segment}
                          </div>
                        ))}
                      </div>
                      <div className="d-block">
                        {(!cust.klaviyo || !cust.klaviyo.lists || cust.klaviyo.lists.length === 0 || 
                          !cust.klaviyo.lists.some(list => list.status === 'subscribed')) ? (
                          <span onClick={changeCustomerSubscription(customer, 1)} className="pointer customer-flags red">Prijavi</span>
                        ) : (
                          <span onClick={changeCustomerSubscription(customer, 0)} className="pointer customer-flags red">Odjavi</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="d-block">
                      <span className="details-bot-cust small">Click to view subscription details</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="row d-flex flex-column mt-4">
                <h5 className="customer-orders-title">Naročila</h5>
                <div className="row">
                  <div className="col-md-6 overflow-table">
                    <table className="table table-cust table-tr-hover transparent table-customer-orders">
                      <thead>
                        <tr>
                          <th className="left table-pad-l-8">datum</th>
                          <th className="left table-pad-l-8">št. naročila</th>
                          <th className="left table-pad-l-8">znesek</th>
                          <th className="left table-pad-l-8">izdelki</th>
                          <th className="left table-pad-l-8">značke</th>
                          <th className="left table-pad-l-8">status</th>
                        </tr>
                      </thead>
                      <tbody onLoad={() => setTimeout(3000)}>
                        {cust.orders && cust.orders.map(renderCustomerOrders)}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  const addBadgeClick = () => {
    setaddBadgeBtn(true)
  }

  const newBadge = (customer, data) => {
    var badge = data.target.value;
    var tmp = [];
    if(customer.badges){
      for(var i=0; i<customer.badges.length; i++)
        tmp.push(customer.badges[i].id)
    }
    tmp.push(badge);
    if(badge!=""){
      dispatch(editProfile(customer.id, {badges:tmp}))
      setaddBadgeBtn(false)
    }
  }

  const deleteBadge = (badge, customer) => () => {
    var badges = customer.badges.filter(b => {
      return b.id != badge.id
    })
    badges = badges.map(b => {
      return b.id
    })
    if (window.confirm('Ali ste sigurni da hočete izbrisati značko?'))
      dispatch(editProfile(customer.id, {badges}))
  }

  const showCustomerProfileData = (customer) => () => {
    if(customer.id != customerID){
      setcustomerID(customer.id);
      dispatch(showCustomerData(customer.id));
    }
    else {
      setcustomerID(null);
    }
  }

  const changeCountriesSelect = (event) => {
    setselectedCountries(event)
    var names = event.map(e => { return e.value });
    location = browserHistory.getCurrentLocation();
    location.query.countries = names;
    resetPageNumber(location);
    browserHistory.replace(location)
    dispatch(getCustomerProfiles());
  }

  const renderCustomerOrders = (customer_order, index) => {
    return(
      <tr key={index} className="pointer" onClick={_getOrderDetails(customer_order.id)}>
        <td>{Moment(customer_order.date_added).format("DD. MM. YYYY")}</td>
        <td># {customer_order.order_id2}</td>
        <td>{parseInt(customer_order.total).toFixed(2)} {customer_order.currency_symbol}</td>
        <td>{customer_order.products.length > 0 ? customer_order.products.map(p => {return p.name}).join(", ") : ""}</td>
        <td>{customer_order.hasUpsale == 1 ? <span className="customer-flags gold-badge m-t-0">UPSELL</span> : ''}</td>
        <td>{customer_order.order_status}</td>
      </tr>
    )
  }

  const setSearch = (data) => {
    location = browserHistory.getCurrentLocation();
    resetPageNumber(location);
    if(data.searchString=="")
      delete location.query.search;
    else
      location.query.search = data.searchString;
    browserHistory.replace(location);
    dispatch(getCustomerProfiles());
  }

  const resetPageNumber = (location) => {
    location.query.pageNumber = 1;
    setpageNumber(1);
    return location;
  }

  const pageChange = (pageNumber) => {
    location = browserHistory.getCurrentLocation();
    location.query.pageNumber = pageNumber;
    browserHistory.replace(location);
    dispatch(getCustomerProfiles());
    setpageNumber(pageNumber);
  }

  const openNewModal = () => {
    setnewModal(true);
  }

  const closeNewModal = () => {
    setnewModal(false)
  }

  const createCustomerProfile = (obj) => {
    dispatch(createProfile(obj));
    closeNewModal();
  }

  const openEditModal = (customer) => () => {
    seteditModal(true)
    setcustomer_rating(customer.rating)
    var edit_customer_profile = {};
    edit_customer_profile.address = customer.address;
    edit_customer_profile.id = customer.id;
    var data = customer;
    edit_customer_profile.birthdate = customer.birthdate == null ? null : Moment(new Date(data.birthdate)).format('DD.MM.YYYY');
    edit_customer_profile.city = customer.city;
    edit_customer_profile.comment = customer.comment;
    edit_customer_profile.country = customer.country;
    edit_customer_profile.email = customer.email;
    edit_customer_profile.first_name = customer.first_name;
    edit_customer_profile.last_name = customer.last_name;
    edit_customer_profile.postcode = customer.postcode;
    edit_customer_profile.telephone = customer.telephone;

    edit_customer_profile.shipping_city = customer.shipping_city;
    edit_customer_profile.shipping_address = customer.shipping_address;
    edit_customer_profile.shipping_country = customer.shipping_country;
    edit_customer_profile.shipping_email = customer.shipping_email;
    edit_customer_profile.shipping_first_name = customer.shipping_first_name;
    edit_customer_profile.shipping_last_name = customer.shipping_last_name;
    edit_customer_profile.shipping_postcode = customer.shipping_postcode;
    edit_customer_profile.shipping_telephone = customer.shipping_telephone;
    setselectedCustomer(edit_customer_profile)
  }

  const newOrderCustomerDetails = (customer) => () => {
    var deliverymethod = deliverymethods.filter(d => {return d.country == customer.country});
    var paymentmethod = [];
    for(var i=0; i<paymentmethods.length; i++) {
      if(paymentmethods[i].countries.includes(customer.country)) {
        paymentmethod.push(paymentmethods[i]);
      }
    }
    customer.utm_source = null;
    customer.utm_medium = null;
    customer.order_type = "inbound";
    dispatch(setInitialValuesNewOrder(customer, {paymentmethod: paymentmethod[0].code, deliverymethod: deliverymethod[0].code}));
  }

  const closeEditModal = () => {
    seteditModal(false)
  }

  const EditCustomerProfile = (customer) => {
    var id = customer.id;
    delete customer.id;
    dispatch(editProfile(id, customer));
    closeEditModal();
  }

  const DeleteCustomerProfile = (customer) => () => {
    var id = customer.id;
    if (window.confirm('Ali ste sigurni da hočete izbrisati stranko?'))
      dispatch(deleteProfile(id));
  }

  const c = localCountries.map(c => { return {label: c, value: c}});

  return(
    <div className="content-wrapper container-fluid">
    {/*  <Snowfall color="#fff" snowflakeCount={250} /> */}


      <div className="row">
        <div className="col-md-12 d-flex justify-content-between align-items-center">
          <h2 className="box-title">Stranke</h2>
          <button onClick={openNewModal} className="btn btn-white-header">Dodaj stranko</button>
        </div>
      </div>
      <div className="box box-default">
        <div className="row main-box-head">
          <div className="col-md-4 search-div">
            <Search setSearch={setSearch} />
          </div>
          <div className="col-md-4">
            <Select
              className="form-white"
              name=""
              placeholder="Izberi države..."
              value={selectedCountries}
              options={c}
              multi={true}
              onChange={changeCountriesSelect}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive no-padding">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-pad-l-8 left"></th>
                    <th className="table-pad-l-8 left">Ime in priimek</th>
                    <th className="table-pad-l-8 left">E-pošta</th>
                    <th className="table-pad-l-8 left">Telefon</th>
                    <th className="table-pad-l-8 left">Ulica in hišna št.</th>
                    <th className="table-pad-l-8 left">Mesto</th>
                    <th className="table-pad-l-8 left">Značke</th>
                    <th className="table-pad-l-8 left"></th>
                    <th className="table-pad-l-8 left"></th>
                    <th className="table-pad-l-8 left"></th>
                  </tr>
                </thead>
                {customers.map(renderSingleCustomer)}
              </table>
            </div>
            <div className="box-footer w-100 pb-3">
              <div className="row w-100">
                <div className="col-sm-6 col-xs-8 w-100">
                  <div className="pagination-block">
                    <Pagination defaultPageSize={parseInt(pageLimit)} defaultCurrent={parseInt(pageNumber)} onChange={pageChange} total={customersCount} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NewProfile customerFormValues={customerFormValues} newModal={newModal} countries={countries} closeNewModal={closeNewModal} createCustomerProfile={createCustomerProfile}/>
      {editModal && <EditProfile customerFormValues={editCustomerFormValues} initialValues={Immutable.fromJS(selectedCustomer)} countries={countries} customer_rating={customer_rating}
      closeEditModal={closeEditModal} editModal={editModal} EditCustomerProfile={EditCustomerProfile} />}
    </div>
  );
}

export default CustomerProfiles;
