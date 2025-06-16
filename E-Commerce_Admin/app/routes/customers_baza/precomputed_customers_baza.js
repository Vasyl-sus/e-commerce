import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import { editProfile, setInitialValuesProfile, deleteProfile, setInitialValuesNewOrder, getCustomerDetails, showCustomerData } from '../../actions/customer_profile_actions';
import { getPrecomputedBazaCustomers } from '../../actions/customers_bd_actions';
import { getOrderDetails } from '../../actions/order_details_actions';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form/immutable';
import Select from 'react-select';
import "rc-pagination/assets/index.css";
import { callCustomer } from '../../actions/order_details_actions';
import EditProfile from '../customer_profile/edit_profile_customer_modal.js';
import Moment from 'moment';

class PrecomputedCustomersBaza extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputDate: Moment(new Date()),
      newModal: false,
      editModal: false,
      activeRow: null,
      enabled: false,
      activeStar: 0,
      activeFilter: false,
      searchString: '',
      pageNumber: 1,
      pageLimit: 15,
      count: 0,
      customerID: null,
      addBadgeBtn: false,
      selectedCountries: [],
      selectedCriteria: this.props.criteria[0]
    };
  }

  componentDidMount(){
    var location = browserHistory.getCurrentLocation();

    if(location.query.pageLimit)
      this.setState({pageLimit: location.query.pageLimit});
    else
      location.query.pageLimit = 15;

    if(location.query.pageNumber)
      this.setState({pageNumber: location.query.pageNumber});
    else
      location.query.pageNumber = 1;

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

    if(location.query.search)
    {
      delete location.query.search;
    }

    browserHistory.replace(location)
    this.props.getPrecomputedBazaCustomers(this.state.selectedCriteria.value);
  };

  addBadgeClick() {
    this.setState({ addBadgeBtn: true })
  }

  newBadge(customer, data) {
    var status = data.target.value;
    var tmp = [];
    if (customer.badges) {
      for (var i = 0; i < customer.badges.length; i++)
        tmp.push(customer.badges[i].id)
    }
    tmp.push(status);
    if (status != "") {
      this.props.editProfile(customer.id, { badges: tmp })
      this.setState({ addBadgeBtn: false })
    }
  }

  deleteBadge(badge, customer) {
    var badges = customer.badges.filter(b => {
      return b.id != badge.id
    })
    badges = badges.map(b => {
      return b.id
    })
    if (window.confirm('Ali ste sigurni da hočete izbrisati značko?'))
      this.props.editProfile(customer.id, { badges })
  }

  showCustomerProfileData(customer) {
    if (customer.id != this.state.customerID) {
      this.setState({ customerID: customer.id });
      this.props.showCustomerData(customer.id);
    } else
      this.setState({ customerID: null })
  }

  getOrderDetails(id) {
    browserHistory.push("/order_details?id=" + id);
    this.props.getOrderDetails(id);
  }

  openEditModal(customer) {
    this.setState({ editModal: true })
    this.setState({ customer_rating: customer.rating })
    this.props.setInitialValuesProfile(customer);
  }

  newOrderCustomerDetails(customer) {
    var deliverymethod = this.props.deliverymethods.filter(d => { return d.country == customer.country });
    customer.utm_source = null;
    customer.utm_medium = null;
    customer.order_type = "baza";
    this.props.setInitialValuesNewOrder(customer, { paymentmethod: this.props.paymentmethods[0].code, deliverymethod: deliverymethod[0].code });
  }

  closeEditModal() {
    this.setState({ editModal: false })
  }

  EditCustomerProfile(customer) {
    var id = customer.id;
    delete customer.id;
    this.props.editProfile(id, customer);
    this.closeEditModal();
  }

  DeleteCustomerProfile(customer) {
    var id = customer.id;
    if (window.confirm('Ali ste sigurni da hočete izbrisati stranko?'))
      this.props.deleteProfile(id);
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
    this.props.getPrecomputedBazaCustomers(this.state.selectedCriteria.value);
  }

  resetPageNumber(location){
    location.query.pageNumber = 1;
    this.setState({pageNumber:1});
    return location;
  }

  pageChange(pageNumber) {
    let location = browserHistory.getCurrentLocation();
    location.query.pageNumber = pageNumber;
    browserHistory.replace(location);
    this.props.getPrecomputedBazaCustomers(this.state.selectedCriteria.value);
    this.setState({pageNumber});
  }

  changeCountriesSelect(event) {
    this.setState({selectedCountries: event})
    var names = event.map(e => { return e.value });
    var location = browserHistory.getCurrentLocation();
    location.query.countries = names;
    this.resetPageNumber(location);
    browserHistory.replace(location)
    this.props.getPrecomputedBazaCustomers(this.state.selectedCriteria.value);
  }

  renderCustomerOrders(customer_order, index) {
    return (
      <tr key={index} className="pointer" onClick={this.getOrderDetails.bind(this, customer_order.id)}>
        <td>{Moment(customer_order.date_added).format("DD. MM. YYYY")}</td>
        <td># {customer_order.order_id}</td>
        <td>{parseInt(customer_order.total).toFixed(2)} {customer_order.currency_symbol}</td>
        <td>{customer_order.products.length > 0 ? customer_order.products.map(p => { return p.name }).join(", ") : ""}</td>
        <td>{customer_order.hasUpsale == 1 ? <span className="customer-flags gold-badge m-t-0">UPSELL</span> : ''}</td>
        <td>{customer_order.order_status}</td>
      </tr>
    )
  }

  changeCustomerSubscription(flag) {
    if (flag) {
      this.props.editProfile(this.props.customer_details.id, { subscribe_action: 'subscribe' })
    } else {
      this.props.editProfile(this.props.customer_details.id, { subscribe_action: 'unsubscribe' })
    }
  }

  call(customer, flag) {
    if (flag) {
      localStorage.setItem('callingOrder', '0');
      this.props.callCustomer(null,
        flag, customer.telephone,
        this.props.user.vcc_username,
        customer.country,
        {
          name: `${customer.first_name} ${customer.last_name}`,
          email: customer.email,
        }
      )
    } else {
      localStorage.setItem('callingOrder', '1');
      this.props.endCall();
    }
  }

  renderSingleCustomer(customer, index) {
    var subscribedText = "";
    if (this.props.customer.subscribed == 404) {
      subscribedText = 'Ni prijavljen'
    } else if (this.props.customer.subscribed == 'subscribed') {
      subscribedText = 'Prijavljen'
    } else if (this.props.customer.subscribed == 'pending') {
      subscribedText = 'V čakanju'
    } else if (this.props.customer.subscribed == 'unsubscribed') {
      subscribedText = 'Odjavljen'
    }
    var color = '#fff'
    if (index % 2 != 0) {
      color = "#fbfbfb"
    }

    return (
      <tbody style={{ backgroundColor: color }} key={index}>
        <tr className="pointer">
          <td onClick={this.showCustomerProfileData.bind(this, customer)}>
            <img width="20px" src={`/images/flags/${customer.country && customer.country.toLowerCase()}.svg`} />
          </td>
          <td onClick={this.showCustomerProfileData.bind(this, customer)}>{customer.first_name} {customer.last_name}</td>
          <td onClick={this.showCustomerProfileData.bind(this, customer)}>{customer.email}</td>
          <td onClick={this.showCustomerProfileData.bind(this, customer)}>{customer.telephone}</td>
          <td onClick={this.showCustomerProfileData.bind(this, customer)}>{customer.address}</td>
          <td onClick={this.showCustomerProfileData.bind(this, customer)}>{customer.city}</td>
          <td onClick={this.showCustomerProfileData.bind(this, customer)}>
            {customer.upsale_count > 0 && <span className="customer-flags gold-badge">{customer.upsale_count}x UPSELL</span>}
            {customer.no_upsale_count > 0 && <span className="customer-flags red">{customer.no_upsale_count}x BREZ UPSELL</span>}
            {customer.declined_count > 0 && <span className="customer-flags red">{customer.declined_count}x NEPREVZEM</span>}
            {customer.badges &&
              customer.badges.map((u, index) => {
                return (
                  <span key={index} className="customer-flags" style={{ borderColor: u.color, color: u.color }}>{u.name}</span>
                )
              })
            }
          </td>
          <td>
            <button type="button" className="btn call-pink-btn" onClick={this.call.bind(this, customer, true)}>KLIČI</button>
          </td>
          <td onClick={this.newOrderCustomerDetails.bind(this, customer)}>
            <Link to={{ pathname: '/new_order', query: { customer_id: customer.id } }}>
              <i className="fas fa-plus-circle fa-big" style={{ color: "var(--main-color)" }} aria-hidden="true"></i>
            </Link>
          </td>
          <td onClick={this.openEditModal.bind(this, customer)}>
            <i className="fa fa-edit" aria-hidden="true" style={{ color: "var(--main-color)" }}></i>
          </td>
          <td onClick={this.DeleteCustomerProfile.bind(this, customer)}>
            <i className="fas fa-trash" aria-hidden="true" style={{ color: "var(--main-color)" }}></i>
          </td>
        </tr>
        <tr>
          <td className={`hidden-tr ${this.state.customerID == customer.id ? '' : 'closed'}`} colSpan="12">
            <div className="main-hidden container-fluid">
              <div className="d-flex align-items-center row customer-name">
                <h3>{customer.first_name} {customer.last_name}</h3>
                {customer.upsale_count > 0 && <span className="customer-flags gold-badge">{customer.upsale_count}x UPSELL</span>}
                {customer.no_upsale_count > 0 && <span className="customer-flags red">{customer.no_upsale_count}x BREZ UPSELL</span>}
                {customer.declined_count > 0 && <span className="customer-flags red">{customer.declined_count}x NEPREVZEM</span>}
                {customer.badges &&
                  customer.badges.map((u, index) => {
                    return (
                      <span key={index} className="customer-flags" style={{ backgroundColor: u.color }}>{u.name} <i className="x-button" onClick={this.deleteBadge.bind(this, u, customer)}>X</i></span>
                    )
                  })
                }

                {!this.state.addBadgeBtn ? <button className="btn btn-tag btn-sm" onClick={this.addBadgeClick.bind(this)}>Dodaj značko</button> : ''}
                {this.state.addBadgeBtn ?
                  <Field name="order_status" className={`form-control new-select-badges`} component='select' onChange={this.newBadge.bind(this, customer)} >
                    <option key="12" value=""></option>
                    {this.props.badges.map((u, index) => {
                      return (
                        <option key={index} value={u.id}>{u.name}</option>
                      )
                    })}
                  </Field> : ''}
                <div className="p-2 ml-auto">
                  <button className="btn btn-primary btn-lg m-r-10"><Link to={{ pathname: '/new_order', query: { customer_id: customer.id } }}>Dodaj naročilo</Link></button>
                  <button className="btn btn-secondary btn-lg" onClick={this.openEditModal.bind(this, customer)}>Uredi</button>
                </div>
              </div>
              <div className="row d-flex align-items-center justify-content-start">
                <div className="customer-info">
                  <span className="details-up-cust">ulica in hišna številka</span><br />
                  <span className="details-bot-cust">{customer.address}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">poštna št.</span><br />
                  <span className="details-bot-cust">{customer.postcode}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">mesto</span><br />
                  <span className="details-bot-cust">{customer.city}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">država</span><br />
                  <span className="details-bot-cust">{customer.country}</span>
                </div>
              </div>
              <div className="row m-t-20 d-flex align-items-center justify-content-start">
                <div className="customer-info">
                  <span className="details-up-cust">telefon</span><br />
                  <span className="details-bot-cust">{customer.telephone}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">e-pošta</span><br />
                  <span className="details-bot-cust">{customer.email}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">rojstni datum</span><br />
                  <span className="details-bot-cust">{customer.birthdate == null ? "/" : Moment(customer.birthdate).format("DD. MM. YYYY")}</span>
                </div>
              </div>
              <div className="row m-t-30 d-flex">
                <span className="shipping-title">Podatki za dostavo</span>
              </div>
              <div className="row mt-2 d-flex align-items-center justify-content-start">
                <div className="customer-info">
                  <span className="details-up-cust">ulica in hišna številka</span><br />
                  <span className="details-bot-cust">{customer.shipping_address}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">poštna št.</span><br />
                  <span className="details-bot-cust">{customer.shipping_postcode}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">mesto</span><br />
                  <span className="details-bot-cust">{customer.shipping_city}</span>
                </div>
                <div className="customer-info">
                  <span className="details-up-cust">država</span><br />
                  <span className="details-bot-cust">{customer.shipping_country}</span>
                </div>
              </div>
              <div className="row m-t-20 d-flex align-items-center">
                <div className="subscribed-info">
                  <span className="details-up-cust">MailChimp status</span><br />
                  <span className="details-bot-cust">{subscribedText}</span>
                  <div className="d-block">
                    {this.props.customer.subscribed == 404 || this.props.customer.subscribed == 'unsubscribed' ?
                      <span onClick={this.changeCustomerSubscription.bind(this, 1)} className="pointer customer-flags red">Prijavi</span>
                      :
                      this.props.customer.subscribed == 'subscribed' ?
                        <span onClick={this.changeCustomerSubscription.bind(this, 0)} className="pointer customer-flags red">Odjavi</span>
                        : ''
                    }
                  </div>
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
                        <tbody onLoad={() => this.props.setTimeout(3000)}>
                          {this.props.customer.orders && this.props.customer.orders.map(this.renderCustomerOrders.bind(this))}
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

    changeCriteria(event) {
      this.setState({ selectedCriteria: event });
      var criteria = event.value;
      if (criteria == '1' || criteria == '2' || criteria == '3' || criteria == '4') {
        var location = browserHistory.getCurrentLocation();
        browserHistory.replace(location);
        this.resetPageNumber(location);
        this.props.getPrecomputedBazaCustomers(criteria); // Pass the criteria to the function
      }
    }

      render() {
        const { customers, handleSubmit, localCountries } = this.props;
        const c = localCountries.map(c => { return { label: c, value: c } });
      
        return (
          <div className="content-wrapper container-fluid">
            <div className="row">
              <div className="col-md-12">
                <h2 className="box-title">Stranke - Baza (nova verzija)</h2>
              </div>
            </div>
            <div className="box box-default">
              <div className="row main-box-head">
                <div className="col-md-4 search-div">
                  <form onSubmit={handleSubmit(this.setSearch.bind(this))}>
                    <Field place="Išči stranke..." name="searchString" type="text" component={renderField}></Field>
                    <button type="submit" className="btn btn-secondary btn-search">IŠČI</button>
                  </form>
                </div>
                <div className="col-md-4">
                  <Select
                    className="form-white"
                    name=""
                    placeholder="Izberi države..."
                    value={this.state.selectedCountries}
                    onChange={this.changeCountriesSelect.bind(this)}
                    options={c}
                    multi={true}
                  />
                </div>
                <div className="col-md-4">
                  <Select
                    className="form-white select-criterij"
                    name=""
                    placeholder="Izberi kriterij..."
                    value={this.state.selectedCriteria}
                    onChange={this.changeCriteria.bind(this)}
                    options={this.props.criteria}
                    multi={false}
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
                        {customers && customers.map(this.renderSingleCustomer.bind(this))}
                    </table>
                  </div>
                  <div className="box-footer w-100 pb-3">
                    <div className="row w-100">
                      <div className="col-sm-6 col-xs-8 w-100">
                        <div className="pagination-block">
                          <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.customersCount} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {this.state.editModal && <EditProfile initialValues={Immutable.fromJS(this.props.initialValuesCustomer)} countries={this.props.countries} customer_rating={this.state.customer_rating}
              closeEditModal={this.closeEditModal.bind(this)} editModal={this.state.editModal} EditCustomerProfile={this.EditCustomerProfile.bind(this)} />}
          </div>
        );
      }
    
 }

 const renderField = ({ input, label, inputclass, place, type, meta: { touched, error, warning } }) => (
  <div className={inputclass}>
    <input type={type} placeholder={place} {...input} className={`${touched && (error || warning) ? 'input_error' : ''} new-search-input`} />
  </div>
 )

 const mapDispatchToProps = (dispatch) => {
    return {
      getPrecomputedBazaCustomers: (criteria) => {
        dispatch(getPrecomputedBazaCustomers(criteria));
      },
      getCustomerDetails: (id) => {
        dispatch(getCustomerDetails(id));
      },
      createProfile: (obj) => {
        dispatch(createProfile(obj));
      },
      setInitialValuesProfile: (customer) => {
        dispatch(setInitialValuesProfile(customer));
      },
      setInitialValuesNewOrder: (customer, data) => {
        dispatch(setInitialValuesNewOrder(customer, data));
      },
      editProfile: (id, customer) => {
        dispatch(editProfile(id, customer));
      },
      deleteProfile: (id) => {
        dispatch(deleteProfile(id));
      },
      callCustomer: (id, flag, tel, username, country, data) => {
        dispatch(callCustomer(id, flag, tel, username, country, data));
      },
      showCustomerData: (id) => {
        dispatch(showCustomerData(id));
      },
      getOrderDetails: (id) => {
        dispatch(getOrderDetails(id));
      }
    };
  };

  function mapStateToProps(state) {
    var nextState = state.toJS();
    return {
      customers: nextState.customers_bd_data.precomputed_customers_baza || [],
      customer_details: nextState.customer_profile_data.customer,
      customersCount: nextState.customers_bd_data.precomputedCustomersCount_baza || 0,
      user: nextState.main_data.user,
      customer: nextState.customer_profile_data.customer,
      countries: nextState.main_data.countries,
      initialValuesCustomer: nextState.customer_profile_data.initialValuesCustomer,
      initialValuesNewOrder: nextState.customer_profile_data.initialValuesNewOrder,
      badges: nextState.main_data.badges,
      paymentmethods: nextState.main_data.paymentmethods,
      deliverymethods: nextState.main_data.deliverymethods,
      localCountries: nextState.main_data.localCountries,
      criteria: [
        { label: '1. kriterij - 6m brez naročila (1x v 6-12m)', value: '1' },
        { label: '2. kriterij - 6m brez naročila (2x ali več v 6-24m)', value: '2' },
        { label: '3. kriterij - 4m brez naročila (3x ali več v 4-24 MES.)', value: '3' },
        { label: '4. kriterij - 6m brez naročila (3x ali več v 6-36 MES.)', value: '4' }
      ]
    };
  }

export default compose(
  reduxForm({
    form: 'CustomerProfileForm',
    enableReinitialize: true
  }), connect(mapStateToProps, mapDispatchToProps)
)(PrecomputedCustomersBaza);
