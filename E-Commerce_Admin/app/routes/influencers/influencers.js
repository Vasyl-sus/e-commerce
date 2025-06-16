import React, {Component} from 'react';
import Moment from 'moment';
import {Link, browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import Immutable from 'immutable';
import {compose} from 'redux';
import {connect} from 'react-redux';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { Field, reduxForm } from 'redux-form/immutable';
import {getInfluencers, createInfluencer, setInitialValuesInfluencer, editInfluencer,
getInfluencerDetails, deleteInfluencer, createPayment, setInitialValuesNewOrderInfluencer} from '../../actions/influencers_actions';
import NewInfluencer from './new_influencer.js';
import EditInfluencer from './edit_influencer.js';
import NewPayment from './new_payment.js';

class Influencers extends Component {
    constructor(props) {
      super(props);

      this.state = {newModal: false, editModal: false, pageNumber:1, pageLimit:15, selectedCountries:[], influencerID: null, paymentModal: false, selectedInfluencer: null, iState: "active"};
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

      if(location.query.type) {
        this.setState({type: location.query.type});
      } else {
        this.setState({type: "vse"})
      }

      if(location.query.state) {
        this.setState({iState: location.query.state});
      } else {
        this.setState({iState: "active"})
        location.query.state = "active";
      }

      browserHistory.replace(location);
      this.props.getInfluencers();
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
      this.props.getInfluencers();
    }

    changeCountriesSelect(event) {
      this.setState({selectedCountries: event})
      var names = event.map(e => { return e.value });
      var location = browserHistory.getCurrentLocation();
      location.query.countries = names;
      this.resetPageNumber(location);
      browserHistory.replace(location)
      this.props.getInfluencers();
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
      this.props.getInfluencers();
    }

    influencerType(type) {
      this.setState({type: type})
      let location = browserHistory.getCurrentLocation();
      if(type == "ambasador") {
        location.query.type = "ambasador";
      } else if(type == "influencer") {
        location.query.type = "influencer";
      } else if(type == "microinfluencer") {
        location.query.type = "microinfluencer";
      } else if(type == "vse") {
        delete location.query.type;
      }
      this.resetPageNumber(location);
      browserHistory.replace(location);
      this.props.getInfluencers();
    }

    paymentType(type) {
      this.setState({type: type})
      let location = browserHistory.getCurrentLocation();
      if(type == "monthly") {
        location.query.payment_type = "monthly";
      } else if(type == "onetime") {
        location.query.payment_type = "onetime";
      } else if(type == "vse") {
        delete location.query.payment_type;
      }
      this.resetPageNumber(location);
      browserHistory.replace(location);
      this.props.getInfluencers();
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    openPaymentModal()
    {
      this.setState({paymentModal: true});
    }

    closePaymentModal()
    {
      this.setState({paymentModal: false})
    }

    openEditModal(obj)
    {
      this.setState({editModal: true, selectedInfluencer: obj});
      this.setState({profile_image: obj.profile_image, type: obj.type})
      // this.props.setInitialValuesInfluencer(obj);
    }

    closeEditModal()
    {
      this.setState({editModal: false})
    }

    EditInfluencer(obj, data)
    {
      var id = obj.id;
      delete obj.id;
      this.props.editInfluencer(id, data);
      this.closeEditModal();
    }

    createNewInfluencer(data)
    {
      this.props.createInfluencer(data);
      this.closeNewModal();
    }

    createNewPayment(obj)
    {
      var id = this.state.influencerID;
      this.props.createPayment(id, obj);
      this.closePaymentModal();
    }

    DeleteInfluencer(obj)
    {
      if (window.confirm('Ali ste sigurni da hočete izbrisati influencerja?'))
        this.props.deleteInfluencer(obj.id);
    }

    getInfluencerDetails(obj) {
      if(obj.id != this.state.influencerID){
        this.setState({influencerID: obj.id});
        this.props.getInfluencerDetails(obj.id);
      }
      else
        this.setState({influencerID:null})
    }

    newOrderInfluencerDetails(influencer)
    {
      var deliverymethod = this.props.deliverymethods.filter(d => {return d.country == influencer.country && d.is_other == 1});
      var paymentmethods = this.props.paymentmethods.filter(p => {return p.is_other == 1});
      var paymentmethod = [];
      for(var i=0; i<paymentmethods.length; i++) {
        if(paymentmethods[i].countries.includes(influencer.country)) {
          paymentmethod.push(paymentmethods[i]);
        }
      }
      influencer.utm_source = null;
      influencer.utm_medium = null;
      influencer.description = null;
      influencer.tracking_code = null;
      influencer.order_type = "influencer";
      this.props.setInitialValuesNewOrderInfluencer(influencer, {paymentmethod: paymentmethod[0].code, deliverymethod: deliverymethod[0].code});
    }

    renderInfluencerOrders = (influencer_order, index) => {
      return(
        <tr key={index} className="pointer" onClick={_getOrderDetails(influencer_order.id)}>
          <td>{Moment(influencer_order.date_added).format("DD. MM. YYYY")}</td>
          <td># {influencer_order.order_id2}</td>
          <td>{parseInt(influencer_order.total).toFixed(2)} {influencer_order.currency_symbol}</td>
          <td>{influencer_order.products.length > 0 ? influencer_order.products.map(p => {return p.name}).join(", ") : ""}</td>
          <td>{influencer_order.hasUpsale == 1 ? <span className="customer-flags gold-badge m-t-0">UPSELL</span> : ''}</td>
          <td>{influencer_order.order_status}</td>
        </tr>
      )
    }

    renderPayments(payment, index)
    {
      var country = this.props.countries.find(c => {return c.name == this.props.influencer.country})

      return(
        <tr key={index} className="pointer">
          <td>{Moment (payment.date_added).format("DD. MM. YYYY")}</td>
          <td>{parseFloat(payment.price).toFixed(2)} {country.symbol}</td>
          <td>{payment.description}</td>
        </tr>
      )
    }

    renderInfluencers(influencer, index){
      var color = '#fff'
      if (index % 2 != 0) {
        color = "#f5f5f5"
      }

      return(
        <tbody style={{backgroundColor: color}} key={index}>
          <tr key={index} className="pointer">
            <td onClick={this.getInfluencerDetails.bind(this, influencer)}>{influencer.profile_image != null ? <img src={influencer.profile_image} className="accessories-pic-table"/> : ""}</td>
            <td onClick={this.getInfluencerDetails.bind(this, influencer)}>{influencer.first_name} {influencer.last_name}</td>
            <td onClick={this.getInfluencerDetails.bind(this, influencer)}>{influencer.nickname}</td>
            <td onClick={this.getInfluencerDetails.bind(this, influencer)}>{influencer.type}</td>
            <td onClick={this.getInfluencerDetails.bind(this, influencer)}>{influencer.payment_type}</td>
            <td onClick={this.getInfluencerDetails.bind(this, influencer)}>{influencer.country}</td>
            <td onClick={this.getInfluencerDetails.bind(this, influencer)}>
              {new Date(influencer.date_from) < new Date() ? influencer.been_payed == false ?
                <span className="customer-flags red">Ni plačano</span>
                :
                <span style={{color: "#328a4d", borderColor: "#328a4d"}} className="customer-flags">Plačano</span>
                :
                ""
              }
            </td>
            <td className="center" onClick={this.newOrderInfluencerDetails.bind(this, influencer)}>
              <Link to={{pathname: '/influencer_new_order', query: {id: influencer.id}}}>
                <i style={{color: "black"}} className="fa fa-plus" aria-hidden="true"></i>
              </Link>
            </td>
            <td className="center">
              <span onClick={this.openEditModal.bind(this, influencer)} className="fas fa-pencil-alt pointer"></span>
            </td>
            <td className="center">
              <span onClick={this.DeleteInfluencer.bind(this, influencer)} className="fas fa-trash pointer"></span>
            </td>
          </tr>
          <tr>
            <td className={`hidden-tr ${this.state.influencerID == influencer.id ? '' : 'closed'}`} colSpan="13">
              <div className="main-hidden container-fluid mb-3">
                <div className="d-flex align-items-center row customer-name">
                  <h3 className="p-2">{influencer.first_name} {influencer.last_name} - {influencer.nickname}</h3>
                  <div className="p-2 ml-auto">
                    <button className="btn btn-primary btn-lg m-r-10"><Link to={{pathname: '/influencer_new_order', query: {id: influencer.id}}}>Dodaj naročilo</Link></button>
                    <button className="btn btn-secondary btn-lg" onClick={this.openEditModal.bind(this, influencer)}>Uredi stranko</button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-2">
                    <span className="details-up-cust">status</span><br/>
                    <span className="details-bot-cust">{influencer.state}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="details-up-cust">tip</span><br/>
                    <span className="details-bot-cust">{influencer.type}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="details-up-cust">način plačila</span><br/>
                    <span className="details-bot-cust">{influencer.payment_type}</span>
                  </div>
                  <div className="col-md-4">
                    <span className="details-up-cust">Opomba</span><br/>
                    <span className="details-bot-cust">{influencer.opomba}</span>
                  </div>
                </div>
                <div className="row m-t-20">
                  <div className="col-md-2">
                    <span className="details-up-cust">naslov</span><br/>
                    <span className="details-bot-cust">{influencer.address}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="details-up-cust">poštna št.</span><br/>
                    <span className="details-bot-cust">{influencer.postcode}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="details-up-cust">mesto</span><br/>
                    <span className="details-bot-cust">{influencer.city}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="details-up-cust">država</span><br/>
                    <span className="details-bot-cust">{influencer.country}</span>
                  </div>
                </div>
                <div className="row m-t-20">
                  <div className="col-md-2">
                    <span className="details-up-cust">telefon</span><br/>
                    <span className="details-bot-cust">{influencer.telephone}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="details-up-cust">e-pošta</span><br/>
                    <span className="details-bot-cust">{influencer.email}</span>
                  </div>
                </div>
                <div className="row m-t-20">
                  <div className="col-md-2">
                    <span className="details-up-cust">facebook</span><br/>
                    <span className="details-bot-cust">{influencer.facebook_url}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="details-up-cust">Instagram</span><br/>
                    <span className="details-bot-cust">{influencer.instagram_url}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="details-up-cust">youtube</span><br/>
                    <span className="details-bot-cust">{influencer.youtube_url}</span>
                  </div>
                  <div className="col-md-2">
                    <span className="details-up-cust">spletna stran</span><br/>
                    <span className="details-bot-cust">{influencer.webpage_url}</span>
                  </div>
                </div>
                <div className="row">
                  <div className="m-t-60 p-2 col-md-9">
                    <h4 className="bold">Seznam plačil</h4>
                    <div className="row m-t-20">
                      <div className="col-md-6 overflow-table">
                        <table className="table table-cust table-tr-hover transparent">
                          <thead>
                            <tr>
                              <th className="left table-pad-l-8">datum plačila</th>
                              <th className="left table-pad-l-8">znesek plačila</th>
                              <th className="left table-pad-l-8">način plačila</th>
                            </tr>
                          </thead>
                          <tbody onLoad={() => this.props.setTimeout(3000)}>
                            {this.props.payments && this.props.payments.map(this.renderPayments.bind(this))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="m-t-60 p-2 col-md-3 right">
                    <button onClick={this.openPaymentModal.bind(this)} className="btn btn-secondary btn-lg"><i className="fas fa-plus" aria-hidden="true"></i>DODAJ PLAČILO</button>
                  </div>
                </div>
                <div className="row d-flex flex-column mt-4">
                <h5 className="customer-orders-title">Paketi</h5>
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
                        {influencer.orders && influencer.orders.map(this.renderInfluencerOrders.bind(this))}
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

    influencerState = (iState) => () => {
      this.setState({iState})
      let location = browserHistory.getCurrentLocation();
      if(iState == "active") {
        location.query.state = "active";
      } else if(iState == "archived") {
        location.query.state = "archived";
      } else if(iState == "vse") {
        delete location.query.state;
      }
      this.resetPageNumber(location);
      browserHistory.replace(location);
      this.props.getInfluencers();
    }

    render(){
      const {influencers, localCountries, handleSubmit} = this.props;
      const c = localCountries.map(c => { return {label: c, value: c}});

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Influencerji</h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head">
              <div className="col-12 col-lg-2 search-div">
                <form onSubmit={handleSubmit(this.setSearch.bind(this))}>
                  <Field place="Išči influencerje..." name="searchString" type="text" component={renderField}></Field>
                  <button type="submit" className="btn btn-secondary btn-search">IŠČI</button>
                </form>
              </div>
              <div className="col-12 col-lg-2">
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
              <div className="col-12 col-lg-3">
                <div className="row">
                    <div className="mx-2 my-1">
                      <input onChange={this.influencerType.bind(this, "ambasador")} checked={this.state.type == "ambasador" ? true : false} type="checkbox" className="mr-2 pointer"/>
                      <label className="mr-3">Ambasador</label><br/>
                      <input onChange={this.influencerType.bind(this, "influencer")} checked={this.state.type == "influencer" ? true : false} type="checkbox" className="mr-2 pointer"/>
                      <label className="mr-3">Influencer</label>
                    </div>
                    <div className="mx-2 my-1">
                    <input onChange={this.influencerType.bind(this, "microinfluencer")} checked={this.state.type == "microinfluencer" ? true : false} type="checkbox" className="mr-2 pointer"/>
                    <label className="mr-3">Microinfluencer</label><br/>
                    <input onChange={this.influencerType.bind(this, "vse")} checked={this.state.type == "vse" ? true : false} type="checkbox" className="mr-2 pointer"/>
                    <label>Vse</label>
                    </div>
                </div>
              </div>
              <div className="col-12 col-lg-2">
                <div className="row">
                  <div className="mx-2 my-1">
                      <input onChange={this.influencerState("active")} checked={this.state.iState == "active" ? true : false} type="checkbox" className="mr-2 pointer"/>
                      <label className="mr-3">Aktivni</label><br/>
                      <input onChange={this.influencerState("archived")} checked={this.state.iState == "archived" ? true : false} type="checkbox" className="mr-2 pointer"/>
                      <label className="mr-3">Arhivirani</label>
                    </div>
                    <div className="mx-2 my-1">
                      <input onChange={this.influencerState("vse")} checked={this.state.iState == "vse" ? true : false} type="checkbox" className="mr-2 pointer"/>
                      <label>Vse</label>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-2">
                <div className="row">
                  <div className="mx-2 my-3">
                    <input onChange={this.paymentType.bind(this, "onetime")} checked={this.state.type == "onetime" ? true : false} type="checkbox" className="mr-2 pointer"/>
                    <label>onetime</label>
                  </div>
                  <div className="mx-2 my-3">
                    <input onChange={this.paymentType.bind(this, "monthly")} checked={this.state.type == "monthly" ? true : false} type="checkbox" className="mr-2 pointer"/>
                    <label>monthly</label>
                  </div>
                  <div className="mx-2 my-3">
                    <input onChange={this.paymentType.bind(this, "vse")} checked={this.state.type == "vse" ? true : false} type="checkbox" className="mr-2 pointer"/>
                    <label>Vse</label>
                  </div>
                </div>
              </div>
              <div className="col-1 right">
                <button onClick={this.openNewModal.bind(this)} className="btn btn-default"> Dodaj</button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive no-padding">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-pad-l-8 left">Slika</th>
                        <th className="table-pad-l-8 left">Ime in priimek</th>
                        <th className="table-pad-l-8 left">Vzdevek</th>
                        <th className="table-pad-l-8 left">Tip</th>
                        <th className="table-pad-l-8 left">Plačilo</th>
                        <th className="table-pad-l-8 left">Država</th>
                        <th className="table-pad-l-8 left">Plačano</th>
                        <th className="center table-pad-l-8">Naročilo</th>
                        <th className="center table-pad-l-8">Uredi</th>
                        <th className="center table-pad-l-8">Izbriši</th>
                      </tr>
                    </thead>
                    {influencers.map(this.renderInfluencers.bind(this))}
                  </table>
                </div>
                <div className="box-footer w-100 pb-3">
                  <div className="row w-100">
                    <div className="col-sm-6 col-xs-8 w-100">
                      <div className="pagination-block">
                        <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.influencersCount}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.newModal ? <NewInfluencer newModal={this.state.newModal} types={this.props.types} payment_types={this.props.payment_types} closeNewModal={this.closeNewModal.bind(this)} countries={this.props.countries}
          createNewInfluencer={this.createNewInfluencer.bind(this)} /> : ""}
          {this.state.paymentModal ? <NewPayment paymentModal={this.state.paymentModal} closePaymentModal={this.closePaymentModal.bind(this)} createNewPayment={this.createNewPayment.bind(this)} /> : ""}
          {this.state.editModal ? <EditInfluencer editModal={this.state.editModal} types={this.props.types} initialValues={Immutable.fromJS(this.state.selectedInfluencer)} profile_image={this.state.profile_image}
          payment_types={this.props.payment_types} closeEditModal={this.closeEditModal.bind(this)} countries={this.props.countries} type={this.state.type} EditInfluencer={this.EditInfluencer.bind(this)} /> : ""}
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
    getInfluencers: () => {
      dispatch(getInfluencers())
    },

    createInfluencer: (obj) => {
      dispatch(createInfluencer(obj))
    },

    setInitialValuesInfluencer: (obj) => {
      dispatch(setInitialValuesInfluencer(obj))
    },

    editInfluencer: (id, obj) => {
      dispatch(editInfluencer(id, obj))
    },

    deleteInfluencer: (id) => {
      dispatch(deleteInfluencer(id))
    },

    getInfluencerDetails: (id) => {
      dispatch(getInfluencerDetails(id))
    },

    createPayment: (id, obj) => {
      dispatch(createPayment(id, obj))
    },

    setInitialValuesNewOrderInfluencer: (obj, data) => {
      dispatch(setInitialValuesNewOrderInfluencer(obj, data))
    }
  }
}
function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    influencers: nextState.influencers_data.influencers,
    influencersCount: nextState.influencers_data.influencersCount,
    initialValuesInfluencer: nextState.influencers_data.initialValuesInfluencer,
    initialValuesNewOrderInfluencer: nextState.influencers_data.initialValuesNewOrderInfluencer,
    influencer: nextState.influencers_data.influencer,
    localCountries: nextState.main_data.localCountries,
    paymentmethods: nextState.main_data.paymentmethods,
    deliverymethods: nextState.main_data.deliverymethods,
    countries: nextState.main_data.countries,
    payments: nextState.influencers_data.payments,
    types: [{label: "ambasador", value: "ambasador"}, {label: "influencer", value: "influencer"}, {label: "microinfluencer", value: "microinfluencer"}],
    payment_types: [{label: "monthly", value: "monthly"}, {label: "onetime", value: "onetime"}]
  }
}

export default compose(
  reduxForm({
    form: 'InfluencersForm',
    enableReinitialize: true
  }), connect(mapStateToProps, mapDispatchToProps)
)(Influencers);
