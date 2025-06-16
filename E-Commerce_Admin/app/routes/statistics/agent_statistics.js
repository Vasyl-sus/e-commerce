import React, {Component} from 'react';
import Moment from 'moment';
import {Link, browserHistory} from 'react-router';
import Pagination from "rc-pagination";
import {connect} from 'react-redux';
import Select from 'react-select';
import StatisticChart from '../../components/StatisticBars/StatisticBars.js';
import {getAgentStatistics, getAgentOrders} from '../../actions/statistics_actions';
import {getOrderDetails} from '../../actions/order_details_actions';
import {setLocalStatuses} from '../../actions/main_actions';
var CanvasJSReact = require('../../components/CanvasJS/canvasjs.react.js');
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {dateMax} from '../../config/constants.js'
import { sl } from 'date-fns/locale';
registerLocale('sl', sl);

class AgentStatistics extends Component {
    constructor(props) {
      super(props);

      var dateFrom = new Date(new Date().getTime() - 2592000000);
      var dateTo = new Date();

      dateFrom.setHours(0);
      dateFrom.setMinutes(0);

      dateTo.setHours(23);
      dateTo.setMinutes(59);


      this.state = {startDateFrom: dateFrom, startDateTo: dateTo, selectedStatuses: [], a_id: null,
      pageNumber:1, pageLimit:50, agent: {}, selectedCountries:[], labels:[],
      dateFrom: Moment(new Date(new Date().getTime() - 2592000000)), dateTo: Moment(new Date()), order_type: {value: 'vse', label: 'Vse'}};

      this.toggleDataSeries = this.toggleDataSeries.bind(this);
    }

    componentDidMount()
    {
      var location = browserHistory.getCurrentLocation();

      this.setState({a_id: location.query.admin_id})

      var admin = JSON.parse(localStorage.getItem('admins'));
      var agent = admin.filter(a => {return a.id == location.query.agent_id})[0]
      this.setState({agent})
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
      var fromD;
      if(location.query.fromDate)
      {
        this.setState({startDateFrom: new Date(parseInt(location.query.fromDate))});
        fromD = Moment(parseInt(location.query.fromDate))
        fromD.locale('sl');
        fromD = fromD.format('dddd, DD. MM. YYYY');
        this.setState({dateFrom: fromD});
      }
      else
      {
        location.query.fromDate = this.state.startDateFrom.getTime();
        fromD = this.state.dateFrom;
        fromD.locale('sl');
        fromD = fromD.format('dddd, DD. MM. YYYY');
        this.setState({dateFrom: fromD});
      }
      var toD;
      if(location.query.toDate)
      {
        this.setState({startDateTo: new Date(parseInt(location.query.toDate))});
        toD = Moment(parseInt(location.query.toDate))
        toD.locale('sl');
        toD = toD.format('dddd, DD. MM. YYYY');
        this.setState({dateTo: toD});
      }
      else
      {
        location.query.toDate = this.state.startDateTo.getTime();
        toD = this.state.dateTo;
        toD.locale('sl');
        toD = toD.format('dddd, DD. MM. YYYY');
        this.setState({dateTo: toD});
      }

      if(location.query.pageLimit)
        this.setState({pageLimit: location.query.pageLimit});
      else
        location.query.pageLimit = 50;

      if(location.query.pageNumber)
        this.setState({pageNumber: location.query.pageNumber});
      else
        location.query.pageNumber = 1;

      if (location.query.order_type) {
        if(location.query.order_type == "vse") {
          delete location.query.order_type;
        } else {
          this.setState({order_type: {value: location.query.order_type, label: location.query.order_type}})
        }
      } else {
        if(this.state.order_type.value == "vse") {
          delete location.query.order_type;
        } else {
          location.query.order_type = this.state.order_type.value;
        }
      }

      this.chart.render();
      this.chart1.render();

      browserHistory.replace(location);
      this.props.getAgentStatistics();
      this.props.getAgentOrders();
    };

    renderReportStatus(status, index)
    {
      return (
        <div key={index}>
          <div className="in-gr">
            <span className="stat-span-inf">{status.name}</span>
            <span className="stat-span-inf2"><b>{status.count}</b> ({status.sum} €)</span>
          </div>
        </div>
      )
    }

    renderAgentOrders(agent_order, index) {
      return (
        <tr key={index} className="pointer" scope="row" onClick={this.getOrderDetails.bind(this, agent_order.id)}>
          <td className="left">{agent_order.shipping_country ? agent_order.shipping_country : ""}</td>
          <td className="center">{agent_order.order_id ? agent_order.order_id : "/"}</td>
          <td className="center">{agent_order.date_added != null ? Moment(agent_order.date_added).format("DD. MM. YYYY") : ""}</td>
          <td className="left">{agent_order.shipping_first_name ? agent_order.shipping_first_name : "/"} {agent_order.shipping_last_name ? agent_order.shipping_last_name : "/"}</td>
          <td className="center">{agent_order.initial_total != null ? parseFloat(agent_order.initial_total).toFixed(2) : parseFloat(0).toFixed(2)} {agent_order.currency_symbol}</td>
          <td className="center">{agent_order.upsale != null ? parseFloat(agent_order.upsale).toFixed(2) : parseFloat(0).toFixed(2)} {agent_order.currency_symbol}</td>
          <td className="center">{agent_order.total != null ? parseFloat(agent_order.total).toFixed(2) : parseFloat(0).toFixed(2)} {agent_order.currency_symbol}</td>
        </tr>
      )
    }

    getOrderDetails(id) {
      browserHistory.push("/order_details?id=" + id);
      this.props.getOrderDetails(id);
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

      var toD = Moment(parseInt(location.query.toDate))
      toD.locale('sl');
      toD = toD.format('dddd, DD. MM. YYYY');
      var fromD = Moment(parseInt(location.query.fromDate))
      fromD.locale('sl');
      fromD = fromD.format('dddd, DD. MM. YYYY');

      this.setState({dateFrom: fromD});
      this.setState({dateTo: toD});
      this.setState({startDateFrom: dateFrom});
      this.setState({startDateTo: dateTo});
      if (dateTo) {
        this.resetPageNumber(location);
        browserHistory.replace(location);
        this.props.getAgentStatistics();
        this.props.getAgentOrders();
      }
    }

    changeStatusesSelect(event) {
      var location = browserHistory.getCurrentLocation();
      var local_s = [];
      var names = event.map(e => {return e.label})
      var selected;
      var selectedStatuses;
      if(event.length > 0) {
        if(names.includes("Vse")) {
          selected = this.props.order_statuses.filter(s => { return s.name != "Vse" })
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
          if(s.name == "Poslano") {
            local_s.push(s)
          }
        })
        location.query.orderStatuses = local_s.map(s => {return s.id});
        selectedStatuses = local_s.map(s => {return {label: s.name, value: s.id}})
        this.setState({selectedStatuses})
        //this.props.setLocalStatuses(local_s);
      }
      browserHistory.replace(location)
      this.props.getAgentStatistics();
      this.props.getAgentOrders();
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
      this.props.getAgentStatistics();
      this.props.getAgentOrders();
    }

    changeOrderType(order_type) {
      this.setState({order_type})
      var location = browserHistory.getCurrentLocation();
      if(order_type.value == "vse") {
        delete location.query.order_type;
      } else {
        location.query.order_type = order_type.value;
      }
      browserHistory.replace(location);
      this.resetPageNumber(location);
      this.props.getAgentStatistics();
      this.props.getAgentOrders();
    }

    resetPageNumber(location){
      location.query.pageNumber = 1;
      this.setState({pageNumber:1});
      return location;
    }

    toggleDataSeries(e){
      if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      }
      else{
        e.dataSeries.visible = true;
      }
      this.chart.render();
      this.chart1.render();
    }

    pageChange(pageNumber) {
      let location = browserHistory.getCurrentLocation();
      location.query.pageNumber = pageNumber;
      browserHistory.replace(location);
      this.props.getAgentStatistics();
      this.props.getAgentOrders();
    }

    render(){
      const { order_statuses, localCountries, result, orders, adminStatistics2, adminStatistics3 } = this.props;
      const {agent} = this.state;
      const status = order_statuses.map(p => { return {label : p.name, value : p.id}});
      const c = localCountries.map(c => { return {label: c, value: c}});

      var dataset3 = [];
      var dataset4 = [];
      dataset3 = adminStatistics2.zacetna
      dataset4 = adminStatistics2.upsell

      var dataset5 = [];
      var dataset6 = [];
      dataset5 = adminStatistics3 && adminStatistics3.neuspesna
      dataset6 = adminStatistics3 && adminStatistics3.uspesna

      const options = {
      theme: "light2",
      animationEnabled: true,
      title:{
        text: "Začetna vrednost - Upsell"
      },
      axisX: {
        title: "Datum",
        valueFormatString:"DD. MM. YYYY"
      },
      axisY: {
        title: "Začetna vrednost",
        titleFontColor: "#6D78AD",
        lineColor: "#6D78AD",
        labelFontColor: "#6D78AD",
        tickColor: "#6D78AD",
        includeZero: false,
        minimum:-200,
        maximum: adminStatistics2.max
      },
      axisY2: {
        title: "Upsell",
        titleFontColor: "#51CDA0",
        lineColor: "#51CDA0",
        labelFontColor: "#51CDA0",
        tickColor: "#51CDA0",
        includeZero: false,
        minimum:-200,
        maximum:adminStatistics2.max
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        itemclick: this.toggleDataSeries
      },
      data: [{
        type: "spline",
        name: "Začetna vrednost",
        showInLegend: true,
        xValueFormatString: "DD. MMM YYYY",
        yValueFormatString: "# ##0.## €",
        dataPoints: dataset3
      },
      {
        type: "spline",
        name: "Upsell",
        axisYType: "secondary",
        showInLegend: true,
        xValueFormatString: "DD. MMM YYYY",
        yValueFormatString: "# ##0.## €",
        dataPoints:dataset4
      }]
    }

    const options1 = {
      theme: "light2",
      animationEnabled: true,
      title:{
        text: "Neuspešno - uspešno"
      },
      axisX: {
        title: "Datum",
        valueFormatString:"DD. MM. YYYY"
      },
      axisY: {
        title: "Neuspešno",
        titleFontColor: "#6D78AD",
        lineColor: "#6D78AD",
        labelFontColor: "#6D78AD",
        tickColor: "#6D78AD",
        includeZero: false,
        minimum:-100,
        maximum: adminStatistics3 && adminStatistics3.max
      },
      axisY2: {
        title: "Uspešno",
        titleFontColor: "#51CDA0",
        lineColor: "#51CDA0",
        labelFontColor: "#51CDA0",
        tickColor: "#51CDA0",
        includeZero: false,
        minimum:-100,
        maximum:adminStatistics3 && adminStatistics3.max
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        itemclick: this.toggleDataSeries
      },
      data: [{
        type: "spline",
        name: "Neuspešno",
        showInLegend: true,
        xValueFormatString: "DD. MMM YYYY",
        yValueFormatString: "# ##0.## €",
        dataPoints: dataset5
      },
      {
        type: "spline",
        name: "Uspešno",
        axisYType: "secondary",
        showInLegend: true,
        xValueFormatString: "DD. MMM YYYY",
        yValueFormatString: "# ##0.## €",
        dataPoints:dataset6
      }]
    }

      return (
        <div className="content-wrapper container-fluid agent-statistics">
          <div className="row">
            <div className="col-md-9">
              <h2 className="box-title">{agent.first_name} {agent.last_name} <span className="agentName">Statistika agenta</span></h2>
            </div>
          </div>
          <div className="box box-default">
            <div className="row main-box-head no-bottom-border">
              <div className="col-md-3">
                <label>Datum</label>
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
                <label>Države</label>
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
              <div className="col-md-6">
                <label>Statusi</label>
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
          </div>
          <div className="row extra-content">
            <div className="col-md-12">
              <div className="nav-tabs-custom nav-tabs-white">
                <ul className="nav nav-tabs">
                  <li className={`${this.state.order_type.value == 'vse' ? 'active' : ''}`}>
                    <a onClick={this.changeOrderType.bind(this, {value: 'vse', label: 'vse'})} className="pointer">Vsa naročila</a>
                  </li>
                  <li className={`${this.state.order_type.value == 'web' ? 'active' : ''}`} >
                    <a onClick={this.changeOrderType.bind(this, {value: 'splet', label: 'spletna_narocila'})} className="pointer">Spletna naročila</a>
                  </li>
                  <li className={`${this.state.order_type.value == 'standardno' ? 'active' : ''}`} >
                    <a onClick={this.changeOrderType.bind(this, {value: 'inbound', label: 'inbound'})} className="pointer">Inbound naročila</a>
                  </li>
                  <li className={`${this.state.order_type.value == 'rojstni_dan' ? 'active' : ''}`} >
                    <a onClick={this.changeOrderType.bind(this, {value: 'rojstni dan', label: 'rojstni_dan'})} className="pointer">Rojstni dnevi</a>
                  </li>
                  <li className={`${this.state.order_type.value == 'baza' ? 'active' : ''}`} >
                    <a onClick={this.changeOrderType.bind(this, {value: 'baza', label: 'baza'})} className="pointer">Baza</a>
                  </li>
                </ul>
              </div>
              <div className="box box box-default box-upper-tabs">
                <div className="box-body">
                  <div className="row">
                    <div className="col-md-2 agent-sums">
                      <span className="agent-stat-title prevzeta-text">PREVZETA NAROČILA</span>
                      <span className="agent-stat-num prevzeta-num">{result.ordersCount}</span>
                      <span className="agent-stat-title prevzeta-text">UPSELL NAROČILA</span>
                      <span className="agent-stat-num prevzeta-num">{result.upsoldOrdersCount}</span>
                      <span className="agent-stat-title prvotni-text">PRVOTNI ZNESEK NAROČIL</span>
                      <span className="agent-stat-num prvotni-num">{result.initialSum} €</span>
                      <span className="agent-stat-title upsell-text">UPSELL ZNESEK</span>
                      <span className="agent-stat-num upsell-num">{result.upsaleSum} €</span>
                      <span className="agent-stat-title total-text">SKUPAJ</span>
                      <span className="agent-stat-num total-num">{result.totalSum} €</span>
                    </div>
                    <div className="col-md-2 agent-sums">
                      <span className="agent-stat-title prvotni-text">ŠTEVILO KLICEV</span>
                      <span className="agent-stat-num prvotni-num">{result.vccCount}</span>
                      <span className="agent-stat-title upsell-text">UNREACHED</span>
                      <span className="agent-stat-num upsell-num">{result.vcc_data.failed.count}</span>
                      <span className="agent-stat-title upsell-text">REACHED</span>
                      <span className="agent-stat-num upsell-num">{result.vcc_data.success.count}</span>
                      <span className="agent-stat-title upsell-text">SUCCESS</span>
                      <span className="agent-stat-num upsell-num">{result.vcc_data.ordered.count}</span>
                    </div>
                    <div className="col-md-3 agent-sums">
                      <span className="agent-stat-title prvotni-text">PRVOTNI ZNESEK REACHED NAROČIL</span>
                      <span className="agent-stat-subtitle upsell-text">reached + success</span>
                      <span className="agent-stat-num prvotni-num">{(result.vcc_data.ordered.initial_value + result.vcc_data.success.initial_value).toFixed(2)} €</span>
                      <span className="agent-stat-title upsell-text">UPSELL ZNESEK REACHED NAROČIL</span>
                      <span className="agent-stat-subtitle upsell-text">reached + success</span>
                      <span className="agent-stat-num upsell-num">{(result.vcc_data.ordered.upsale + result.vcc_data.success.upsale).toFixed(2)} €</span>
                      <span className="agent-stat-title upsell-text">SKUPNI ZNESEK REACHED NAROČIL</span>
                      <span className="agent-stat-subtitle upsell-text">reached + success</span>
                      <span className="agent-stat-num upsell-num">{result.reachedTotalValue} €</span>
                    </div>
                    <div className="col-md-2 agent-sums">
                      <span className="agent-stat-title upsell-text">USPEŠNOST NAROČIL</span>
                      <span className="agent-stat-subtitle upsell-text">upsell naročila / prevzeta naročila</span>
                      <span className="agent-stat-num upsell-num">{result.upsaleNumberSuccess} %</span>
                      <span className="agent-stat-title upsell-text">USPEŠNOST KLICEV</span>
                      <span className="agent-stat-subtitle upsell-text">success / success + reached</span>
                      <span className="agent-stat-num upsell-num">{result.upsaleCountSuccess} %</span>
                      <span className="agent-stat-title total-text greeny">FINANČNA USPEŠNOST</span>
                      <span className="agent-stat-subtitle upsell-text greeny-2">upsell / total - upsell</span>
                      <span className="agent-stat-num total-num greeny-3">{result.upsaleValueSuccess} %</span>
                      <span className="agent-stat-title upsell-text bluby">FINANČNA USPEŠNOST - REACHED</span>
                      <span className="agent-stat-subtitle upsell-text bluby-2">reached upsell / reached total - reached upsell</span>
                      <span className="agent-stat-num upsell-num bluby-3">{result.reachedUpsellValueSuccess} %</span>
                    </div>
                    <div className="col-md-2">
                    {result.reportByStatus &&
                      result.reportByStatus.map(this.renderReportStatus.bind(this))
                    }
                    </div>
                  </div>
                  <div className="row pt-3 mt-3 border-top mb-5 border-bottom">
                    <div className="col-3">
                      <span className="agent-stat-title upsell-text greeny">RAZRED USPEŠNOSTI</span>
                      <span className="agent-stat-subtitle upsell-text greeny-2">finančna uspešnost</span>
                      <span className="agent-stat-num upsell-num greeny-3">{result.financialSuccessClass} %</span>
                    </div>
                    <div className="col-3">
                      <span className="agent-stat-title upsell-text bluby">RAZRED USPEŠNOSTI</span>
                      <span className="agent-stat-subtitle upsell-text bluby-2">finančna uspešnost - reached</span>
                      <span className="agent-stat-num upsell-num bluby-3">{result.financialSuccessClassReached} %</span>
                    </div>
                    <div className="col-3">
                      <span className="agent-stat-title upsell-text greeny">PROVIZIJA</span>
                      <span className="agent-stat-subtitle upsell-text greeny-2">upsell * razred finančne uspešnosti</span>
                      <span className="agent-stat-num upsell-num greeny-3">{result.earnings} €</span>
                    </div>
                    <div className="col-3">
                      <span className="agent-stat-title upsell-text bluby">PROVIZIJA</span>
                      <span className="agent-stat-subtitle upsell-text bluby-2">upsell reached * razred finančne uspešnosti reached</span>
                      <span className="agent-stat-num upsell-num bluby-3">{result.earningsReached} €</span>
                    </div>
                  </div>
                </div>
                <div className="box-body">
                  <div className="row">
                    <div className="col-md-4">
                      {result.statistics != null ? <StatisticChart datasets={result.statistics.datasets} labels={result.statistics.labels} /> : ""}
                    </div>
                    <div className="col-md-8">
                      <CanvasJSChart options = {options}
                         onRef={ref => this.chart = ref}
                      />
                      <div className="mt-5">
                      {adminStatistics3 &&<CanvasJSChart options = {options1}
                         onRef={ref1 => this.chart1 = ref1}
                      />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="box box-default">
            <div className="row px-4">
              <h4>Seznam naročil</h4>
              <div className="table-cust table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th className="left table-pad-l-8" scope="col">Država</th>
                      <th className="center table-pad-l-8" scope="col">ID</th>
                      <th className="center table-pad-l-8" scope="col">Datum</th>
                      <th className="left table-pad-l-8" scope="col">Stranka</th>
                      <th className="center table-pad-l-8" scope="col">Prvotni znesek</th>
                      <th className="center table-pad-l-8" scope="col">Upsell</th>
                      <th className="center table-pad-l-8" scope="col">Skupni znesek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders && orders.length > 0 ? orders.map(this.renderAgentOrders.bind(this)) : ""}
                  </tbody>
                </table>
                <Pagination defaultPageSize={parseInt(this.state.pageLimit)} defaultCurrent={parseInt(this.state.pageNumber)} onChange={this.pageChange.bind(this)} total={this.props.ordersCount}/>
              </div>
            </div>
          </div>
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getAgentStatistics: () => {
      dispatch(getAgentStatistics())
    },

    getAgentOrders: () => {
      dispatch(getAgentOrders())
    },

    setLocalStatuses: (statuses) => {
      dispatch(setLocalStatuses(statuses))
    },

    getOrderDetails: (id) => {
      dispatch(getOrderDetails(id));
    },
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    admins: nextState.main_data.admins,
    orders: nextState.statistics_data.orders,
    ordersCount: nextState.statistics_data.ordersCount,
    adminStatistics2: nextState.statistics_data.adminStatistics2,
    adminStatistics3: nextState.statistics_data.adminStatistics3,
    result: nextState.statistics_data.result,
    order_statuses: nextState.main_data.orderstatuses,
    countries: nextState.main_data.countries,
    localCountries: nextState.main_data.localCountries,
    localStatuses: nextState.main_data.localStatuses,
    user: nextState.main_data.user
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AgentStatistics);
