import React, {Component} from 'react';
import 'moment/locale/sl';
import {browserHistory} from 'react-router';
import {connect} from 'react-redux';
import Select from 'react-select';
import StatisticChart from '../../components/StatisticBars/StatisticBars.js';
import {checkedCountry, toggleCountry} from '../../actions/customer_profile_actions';
import {getOrderStatistics} from '../../actions/statistics_actions';
import {setLocalStatuses} from '../../actions/main_actions';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);

class OrderStatistics extends Component {
    constructor(props) {
      super(props);

      var dateFrom = new Date(new Date().getTime() - 2592000000);
      var dateTo = new Date();

      dateFrom.setHours(0);
      dateFrom.setMinutes(0);

      dateTo.setHours(23);
      dateTo.setMinutes(59);

      this.state = {tab:'', selectedStatuses:[], selectedAccessories: [], selectedProducts:[], selectedUTM:null, selectedCountries:[],
      startDateFrom: dateFrom, startDateTo: dateTo, activeDateType: 'from_to', activeYear: new Date().getFullYear()};
    }

    componentDidMount()
    {
      var location = browserHistory.getCurrentLocation();
      var selectedCountries;
      if(!location.query.countries)
      {
        location.query.countries = this.props.localCountries.map(c => {return c});
        selectedCountries = this.props.localCountries.map(c => {return {label: c, value: c}});
        this.setState({selectedCountries})
      }
      else {
        if (typeof location.query.countries != 'string')
        {
          selectedCountries = location.query.countries.map(c => {return {label: c, value: c}});
          this.setState({selectedCountries})
        }
        else
        {
          this.setState({selectedCountries: [location.query.countries]})
        }
      }

      if(!location.query.opt) {
        location.query.opt = 'from_to'
      } else {
        this.setState({activeDateType: location.query.opt})
      }

      if(location.query.year) {
        this.setState({activeYear: parseInt(location.query.year)})
      }

      if(!location.query.tab) {
        location.query.tab = this.props.tabs[0].value;
        this.setState({tab: this.props.tabs[0].value})
      }
      else {
        this.setState({tab: location.query.tab})
      }

      if(!location.query.utm_type) {
        location.query.utm_type = this.props.utms[0].value;
        this.setState({selectedUTM: this.props.utms[0].value})
      }
      else {
        var find_utm = this.props.utms.find(u => {return u.value == location.query.utm_type})
        this.setState({selectedUTM: find_utm.value})
      }
      var selectedStatuses;
      if(!location.query.orderStatuses)
      {
        var localStatuses = this.props.order_statuses.filter(s => {return s.name !=  "Vse"});
        location.query.orderStatuses = localStatuses.map(o => {return o.id});
        selectedStatuses = localStatuses.map(o => {return {label: o.name, value: o.id}});
        this.setState({selectedStatuses})
      }
      else {
        if (typeof location.query.orderStatuses != 'string')
        {
          selectedStatuses = [];
          location.query.orderStatuses.map(c => {
            var find_status = this.props.order_statuses.find(o => {
              return o.id == c;
            })
            selectedStatuses.push({label: find_status.name, value: find_status.id})
          });
          this.setState({selectedStatuses})
        }
        else
        {
          selectedStatuses = [];
          var find_status = this.props.order_statuses.find(o => {
            return o.id == location.query.orderStatuses;
          })
          this.setState({selectedStatuses: [{label: find_status.name, value: find_status.id}]})
        }
      }
      var selectedProducts;
      if(!location.query.products)
      {
        location.query.products = [];
        selectedProducts = [];
        this.props.products.map(p => {
          if (p.category === "tattoo" || p.category === "cream" || p.category === "eyelash" || p.category === "aqua" || p.category === "royal" || p.category === "caviar" || p.category === "lotion"  || p.category === "procollagen") {
            location.query.products.push(p.id)
            selectedProducts.push({label: p.name, value: p.id})
          }
        });
        this.setState({selectedProducts})
      }
      else {
        var find_product;
        if (typeof location.query.products != 'string')
        {
          selectedProducts = [];
          location.query.products.map(p => {
            find_product = this.props.products.find(pp => {
              return pp.id == p;
            })
            selectedProducts.push({label: find_product.name, value: find_product.id})
          });
          this.setState({selectedProducts})
        }
        else
        {
          selectedProducts = [];
          find_product = this.props.products.find(p => {
            return p.id == location.query.products;
          })
          this.setState({selectedProducts: [{label: find_product.name, value: find_product.id}]})
        }
      }
      var selectedAccessories;
      if(!location.query.accessories)
      {
        location.query.accessories = this.props.accessories.map(p => {return p.id});
        selectedAccessories = this.props.accessories.map(p => {return {label: p.name, value: p.id}});
        this.setState({selectedAccessories})
      }
      else {
        if (typeof location.query.accessories != 'string')
        {
          selectedAccessories = [];
          location.query.accessories.map(p => {
            find_product = this.props.accessories.find(pp => {
              return pp.id == p;
            })
            selectedAccessories.push({label: find_product.name, value: find_product.id})
          });
          this.setState({selectedAccessories})
        }
        else
        {
          selectedAccessories = [];
          find_product = this.props.accessories.find(p => {
            return p.id == location.query.accessories;
          })
          this.setState({selectedAccessories: [{label: find_product.name, value: find_product.id}]})
        }
      }

      if(location.query.fromDate)
        this.setState({startDateFrom: new Date(parseInt(location.query.fromDate))});
      else
        location.query.fromDate = this.state.startDateFrom.getTime();

      if(location.query.toDate) {
        this.setState({startDateTo: new Date(parseInt(location.query.toDate))})
      } else {
        location.query.toDate = this.state.startDateTo.getTime();
      }

      browserHistory.replace(location);
      this.props.getOrderStatistics();
    };

    changeStatusesSelect(event) {
      var location = browserHistory.getCurrentLocation();
      var local_s = [];
      var names = event.map(e => {return e.label})
      var selectedStatuses
      if(event.length > 0) {
        if(names.includes("Vse")) {
          var selected = this.props.order_statuses.filter(s => { return s.name != "Vse" })
          location.query.orderStatuses = selected.map(s => {return s.id});
          selectedStatuses = selected.map(s => {return {label: s.name, value: s.id}})
          this.setState({selectedStatuses})
          //this.props.setLocalStatuses(selected);
        } else {
          var ids = event.map(e => { return e.value })
          ids.map(s_id => {
            var selected = this.props.order_statuses.find(s => { return s.id == s_id })
            local_s.push(selected);
          });
          location.query.orderStatuses = ids;
          this.setState({selectedStatuses: event})
          //this.props.setLocalStatuses(local_s);
        }
      } else {
        var selected = this.props.order_statuses.filter(s => {
          if(s.name != "Vse") {
            local_s.push(s)
          }
        })
        location.query.orderStatuses = local_s.map(s => {return s.id});
        selectedStatuses = local_s.map(s => {return {label: s.name, value: s.id}})
        this.setState({selectedStatuses})
        //this.props.setLocalStatuses(local_s);
      }
      browserHistory.replace(location)
      this.props.getOrderStatistics();
    }

    changeProductsSelect(event) {
      this.setState({selectedProducts: event})
      var ids = event.map(e => { return e.value });
      var location = browserHistory.getCurrentLocation();
      location.query.products = ids;
      browserHistory.replace(location)
      this.props.getOrderStatistics();
    }

    changeAccessoriesSelect(event) {
      this.setState({selectedAccessories: event})
      var ids = event.map(e => { return e.value });
      var location = browserHistory.getCurrentLocation();
      location.query.accessories = ids;
      browserHistory.replace(location)
      this.props.getOrderStatistics();
    }

    changeUTMSelect(event) {
      this.setState({selectedUTM: event.target.value});
      var location = browserHistory.getCurrentLocation();
      location.query.utm_type = event.target.value;
      browserHistory.replace(location)
      this.props.getOrderStatistics();
    }

    changeCountriesSelect(event) {
      var location = browserHistory.getCurrentLocation();
      if(event.length > 0) {
        var names = event.map(e => { return e.value });
        location.query.countries = names;
        this.setState({selectedCountries: event})
      } else {
        location.query.countries = this.props.localCountries[0];
        this.setState({selectedCountries: {label: this.props.localCountries[0], value: this.props.localCountries[0]}})
      }
      browserHistory.replace(location)
      this.props.getOrderStatistics();
    }

    changeDateType(event) {
      this.setState({activeDateType: event.target.value})
      var location = browserHistory.getCurrentLocation();
      if(event.target.value == 'year') {
        location.query.year = new Date().getFullYear();
      } else {
        delete location.query.year;
        this.setState({activeYear: new Date().getFullYear()})
      }
      location.query.opt = event.target.value;
      browserHistory.replace(location)
      this.props.getOrderStatistics()
    }

    changeYear(value) {
      var year = this.state.activeYear + value;
      this.setState({activeYear: year});
      var location = browserHistory.getCurrentLocation();
      location.query.year = year;
      browserHistory.replace(location);
      this.props.getOrderStatistics()
    }

    Tabs(e)
    {
      let location = browserHistory.getCurrentLocation();
      location.query.tab = e.currentTarget.dataset.id;
      //console.log(e.currentTarget.dataset.id)
      this.setState({tab: e.currentTarget.dataset.id})
      delete location.query.year;
      this.setState({activeDateType: 'from_to'})
      location.query.opt = "from_to";
      this.setState({activeYear: new Date().getFullYear()})
      browserHistory.replace(location);
      this.props.getOrderStatistics();
    }

    handleChangeStart = (dates) => {
      const [start, end] = dates;
      this.setState({ startDateFrom: start, startDateTo: end }, () => {
        if (end) {
          let location = browserHistory.getCurrentLocation();
          location.query.fromDate = start.getTime();
          location.query.toDate = end.getTime();
          browserHistory.replace(location);
          this.props.getOrderStatistics();
        }
      });
    };

    renderTabs(tab, index)
    {
      return(
        <div className={`${this.state.tab == tab.value ? 'mr-10 box-border-style tab-new tab-new-active t-active': 'mr-10 box-border-style tab-new'}`} onClick={this.Tabs.bind(this)} data-id={tab.value} key={index}>
          <p>{tab.label}</p>
        </div>
      )
    }

    renderUTMOption(utm, index) {
      return (
        <option key={index} value={utm.value}>{utm.label}</option>
      );
    }

    render(){
      const { order_statuses, localCountries, products, tabs, utms, orderStatistics, accessories } = this.props;
      const status = order_statuses.map(p => { return {label : p.name, value : p.id};});
      const product = [];
      products.map(p => {
        if (p.category === "tattoo" || p.category === "cream" || p.category === "eyelash" || p.category === "aqua" || p.category === "royal" || p.category === "caviar" || p.category === "lotion" || p.category === "procollagen") {
          product.push({label : p.name, value : p.id});
        }
      });

      const accessory = accessories.map(p => { return {label : p.name, value : p.id};});
      const c = localCountries.map(c => { return {label: c, value: c}});

      var dataset = orderStatistics.datasets ? orderStatistics.datasets : [];
      if (this.state.tab == 'income') {
        if (dataset[0]) {
          dataset[0].color = {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, '#de47ac'],
              [1, '#3023AE']
            ]
          }
        }
      }

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Statistika</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 d-flex nav-tabs-statistics">
                {tabs.map(this.renderTabs.bind(this))}
            </div>
          </div>
          <div className="box box-default box-stats">
            <div className="row main-box-head no-bottom-border d-flex justify-content-between align-items-center">
              <div className="stats-filter mr-5">
                <label className="form-label">Države</label>
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
              <div className="stats-filter">
                {this.state.tab == 'income' ? <div className="d-block">
                  <label className="form-label">Datum</label>
                  <select onChange={this.changeDateType.bind(this)} value={this.state.activeDateType} className={`form-control popust-select`} >
                    <option value='from_to'>Obdobje</option>
                    <option value='year'>Leto</option>
                  </select>
                </div> : ""}
                <div className={`${this.state.activeDateType == 'from_to' ? 'd-block' : 'hidden'}`}>
                  <label className="form-label">Obdobje</label><br/>
                  <DatePicker
                    selected={this.state.startDateFrom}
                    onChange={this.handleChangeStart}
                    startDate={this.state.startDateFrom}
                    endDate={this.state.startDateTo}
                    selectsRange
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Select a date range"
                    maxDate={dateMax}
                    className="multi-dateinput"
                    locale="sl"
                    showIcon
                  />
                </div>
                <div className={`${this.state.activeDateType == 'year' ? 'd-block' : 'hidden'}`}>
                  <label className="form-label">Leto</label>
                  <div className="search-div-new datepick-new mt-2">
                    <i className={`pointer fa fa-chevron-left chev-left-date`} onClick={this.changeYear.bind(this, -1)} aria-hidden="true"></i>
                    <i className="fa fa-calendar-check-o check-check" aria-hidden="true" ></i>
                    <div className="additional-div">
                      <p>{this.state.activeYear}</p>
                    </div>
                    <i className={`pointer fa fa-chevron-right chev-right-date`} onClick={this.changeYear.bind(this, 1)} aria-hidden="true"></i>
                  </div>
                </div>
              </div>
              <div className={`${this.state.tab == 'income' && this.state.activeDateType != 'year' ? 'stats-filter' : 'stats-filter'}`}>
                <label className="form-label">Statusi</label>
                <Select
                  className="form-white"
                  name=""
                  placeholder="Izberi statuse..."
                  value={this.state.selectedStatuses}
                  options={status}
                  multi={true}
                  onChange={this.changeStatusesSelect.bind(this)}
                />
              </div>
              </div>
              <div className="row main-box-head no-bottom-border">
              {this.state.tab == "product" ? <div className="col-md-4">
                <label className="form-label">Izdelki</label>
                <Select
                  className="form-white"
                  name=""
                  placeholder="Izberi izdelke..."
                  value={this.state.selectedProducts}
                  options={product}
                  multi={true}
                  onChange={this.changeProductsSelect.bind(this)}
                />
              </div> : ""}
              {this.state.tab == "product" ? <div className="col-md-8">
                <label className="form-label">Dodatki</label>
                <Select
                  className="form-white"
                  name=""
                  placeholder="Izberi dodatke..."
                  value={this.state.selectedAccessories}
                  options={accessory}
                  multi={true}
                  onChange={this.changeAccessoriesSelect.bind(this)}
                />
              </div> : ""}
              {this.state.tab == "utm" ? <div className="col-md-12">
                <label className="form-label">UTM</label>
                <select className={`form-control`} onChange={this.changeUTMSelect.bind(this)} value={this.state.selectedUTM}>
                  {utms.map(this.renderUTMOption.bind(this))}
                </select>
              </div> : ""}

            </div>
            <div className="row">
              <div className="col-12">
                <StatisticChart datasets={dataset} labels={orderStatistics.labels} />
              </div>
              <div className="col-12 text-center">
                {orderStatistics.totalPromet && <p className="pt-3 pb-3"><b>Skupaj promet - {orderStatistics.totalPromet.toFixed(2)}</b></p>}
              </div>
            </div>
              </div>
            </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    checkedCountry: () => {
      dispatch(checkedCountry())
    },

    toggleCountry: (id, flag) => {
      dispatch(toggleCountry(id, flag))
    },

    getOrderStatistics: () => {
      dispatch(getOrderStatistics())
    },

    setLocalStatuses: (statuses) => {
      dispatch(setLocalStatuses(statuses))
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    admins: nextState.main_data.admins,
    country: nextState.customer_profile_data.countries,
    order_statuses: nextState.main_data.orderstatuses,
    localCountries: nextState.main_data.localCountries,
    localStatuses: nextState.main_data.localStatuses,
    orderStatistics: nextState.statistics_data.orderStatistics,
    products: nextState.main_data.products,
    accessories: nextState.main_data.accessories,
    tabs: [{label: 'Prihodki', value: 'income'}, {label: 'Naročila', value: 'packet'}, {label: 'Izdelki', value: 'product'},
    {label: 'UTM', value: 'utm'}, {label: 'Kuponi', value: 'discount'}],
    utms: [{label: 'medium', value: 'utm_medium'},{label: 'campaign', value: 'utm_campaign'}, {label: 'source', value: 'utm_source'},
    {label: 'content', value: 'utm_content'}],
    user: nextState.main_data.user
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderStatistics);
