import React, {Component} from 'react';
import Moment from 'moment';
import 'moment/locale/sl';
import { browserHistory } from 'react-router';
import {connect} from 'react-redux';
import Select from 'react-select';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import {getDailyIncomeReport, changedUTMStatistics, changedUTMStatistics1, getUTMStats} from '../../actions/statistics_actions';
import {checkedCountry, toggleCountry} from '../../actions/customer_profile_actions';
import {setLocalStatuses} from '../../actions/main_actions';

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

class MonthlyStatistics extends Component {
    constructor(props) {
      super(props);

      this.state = {expenseSelectedCountry: "SI", inputDate: new Date(), selectedStatuses: [], newModal: false, selectedCountries:[], UTMStatsDetails: false};
    }

    componentDidMount()
    {
      var location = browserHistory.getCurrentLocation();
      var selectedStatuses;
      if(!location.query.countries)
      {
        location.query.countries = this.props.localCountries.map(c => {return c});
        var selectedCountries = this.props.localCountries.map(c => {return {label: c, value: c}});
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

      if(!location.query.orderStatuses)
      {
        var localStatuses = this.props.order_statuses.filter(s => {return s && s.name !=  "Vse"});
        location.query.orderStatuses = localStatuses.map(o => {return o.id});
        selectedStatuses = localStatuses.map(o => {return {label: o.name, value: o.id}});
        this.setState({selectedStatuses})
      }
      else {
        selectedStatuses = [];
        if (typeof location.query.orderStatuses != 'string')
        {
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
          var find_status = this.props.order_statuses.find(o => {
            return o.id == location.query.orderStatuses;
          })
          this.setState({selectedStatuses: [{label: find_status.name, value: find_status.id}]})
        }
      }

      if(location.query.inputDate)
      {
        console.log(location.query.inputDate)
        this.setState({inputDate: new Date(parseInt(location.query.inputDate))});
      }
      else
      {
        location.query.inputDate = Moment(new Date()).valueOf();
      }

      browserHistory.replace(location);
      this.props.getDailyIncomeReport('month');
    };

    handleChangeStart(inputDate)
    {
      var location = browserHistory.getCurrentLocation();
      location.query.inputDate = Moment(inputDate).valueOf();
      browserHistory.replace(location);
      this.props.getDailyIncomeReport('month');
      this.setState({inputDate});
    }

    change_date_backward()
    {
      var location = browserHistory.getCurrentLocation();
      var changeDateBackward = Moment(parseInt(location.query.inputDate)).subtract(1, 'months').valueOf();
      location.query.inputDate = changeDateBackward;
      browserHistory.replace(location);
      this.props.getDailyIncomeReport('month');
      this.setState({inputDate: Moment(parseInt(location.query.inputDate))});
    }

    change_date(date) {
      var location = browserHistory.getCurrentLocation();
      var changeDateBackward = new Date(date);
      location.query.inputDate = changeDateBackward.getTime();
      this.setState({UTMStatsDetails: false})
      browserHistory.replace(location);
      this.props.getDailyIncomeReport('month');
      this.setState({inputDate: changeDateBackward});
    }

    change_date_forward()
    {
      var location = browserHistory.getCurrentLocation();
      var changeDateForward = Moment(parseInt(location.query.inputDate)).add(1, 'months').valueOf();
      location.query.inputDate = changeDateForward;
      browserHistory.replace(location);
      this.props.getDailyIncomeReport('month');
      this.setState({inputDate: Moment(parseInt(location.query.inputDate))});
    }

    changeStatusesSelect(event) {
      var location = browserHistory.getCurrentLocation();
      var local_s = [];
      var names = event.map(e => {return e.label})
      var selectedStatuses;
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
      this.setState({UTMStatsDetails: false})
      browserHistory.replace(location)
      this.props.getDailyIncomeReport('month');
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
      this.setState({UTMStatsDetails: false})
      browserHistory.replace(location)
      this.props.getDailyIncomeReport('month');
    }

    changeExpenseCountriesSelect(event) {
      this.setState({expenseSelectedCountry: event.value})
      this.props.changeExpenseCountry(event.value)
    }

    openNewModal()
    {
      this.setState({newModal: true});
    }

    closeNewModal()
    {
      this.setState({newModal: false})
    }

    renderProducts(product, index)
    {
      var obj = this.props.data_report.products[product];
      return (
        <div key={index}>
          <label className="font-size-table text-color-style">{product.toUpperCase()}</label>
          <p className="font-size-expenses border-bottom-p col-md-10 font-style"><b>{obj != null ? obj : "0"}</b></p>
        </div>
      )
    }

    renderProductSub(details, key, index) {
      return (
        <div key={index}>
          <div className="sub-values-report">
            <span className="stat-span-inf daily-stats-inf">{key}</span>
            <span className="stat-span-inf2"><b>{parseFloat(details[key])}</b></span>
          </div>
        </div>
      )
    }

    renderStornoProductSub(details, key, index) {
      return (
        <div key={index}>
          <div className="sub-values-report">
            <span className="stat-span-inf daily-stats-inf">{key} - Storno</span>
            <span className="stat-span-inf2"><b>-{parseFloat(details[key])}</b></span>
          </div>
        </div>
      )
    }

    renderNewSub(details, index){
      return (
        <div key={index} className="col-md-6">
          <div className="expense-categories-report p-t-30">
            <span className="stat-span-inf daily-stats-inf expense-main-title">{details.category}</span>
            {details.data.map((d, ind) => {
              if (d.value !== 0) {
                return (
                  <div key={ind} className="mb-3">
                    <span className="stat-span-inf daily-stats-inf">{d.name}  {d.product_name || ""}</span>
                    <span className="stat-span-inf2"><b>{parseFloat(d.value).toFixed(2)} €</b></span>
                    {d.additional_data && Object.keys(d.additional_data).map((a, i) => {
                      return (
                        <div key={i}>
                          <b>{a}:</b> {d.additional_data[a]}
                        </div>
                      )
                    })}
                  </div>
                )
              }
            })}
          </div>
        </div>
      )
    }

    openUTMStats()
    {
      this.props.getUTMStats(this.props.reportDataParam)
      this.setState({UTMStatsDetails: true})
    }

    renderUTMProducts(product, index)
    {
      var obj = this.props.utm_stats.products[product];
      return (
        <div key={index}>
          <div className="sub-values-report">
            <span className="stat-span-inf daily-stats-inf">{product.toUpperCase()}</span>
            <span className="stat-span-inf2"><b>{obj != null ? obj : "0"}</b></span>
          </div>
        </div>
      )
    }

    renderUTMAccessories(accessory, index)
    {
      var obj = this.props.utm_stats.accessories[accessory];
      return (
        <div key={index}>
          <div className="sub-values-report">
            <span className="stat-span-inf daily-stats-inf">{accessory.toUpperCase()}</span>
            <span className="stat-span-inf2"><b>{obj != null ? obj : "0"}</b></span>
          </div>
        </div>
      )
    }

    renderExpensesData(expense, key, index)
    {
      return (
        Object.keys(expense[key]).map((i, j) => {
          return (
            <div key={j}>
              <label className="font-size-table text-color-style">{i.toUpperCase()}</label><br/>
              <p className="font-size-expenses border-bottom-p col-md-10 font-style"><b>{expense[key][i] != null ? parseFloat(expense[key][i]).toFixed(2) : parseFloat(0).toFixed(2)} €</b></p>
            </div>
          )
        })
      )
    }

    renderUtm(type, details, index){
      return(
        <div key={index}>
          <div className="label-radio new-lab">
            <input type="checkbox" id={details.name} name="test" checked={details.active==1?true:false} readOnly={true}/>
            <span className="checkmark" onClick={this.checkUTM.bind(this, type, details)}></span>
            {details.name == 'null' ? 'Brez utm' : details.name} ({details.num})
          </div>
        </div>
      )
    }

    checkUTM(type, data){
      if(data.active == 1)
        this.props.changedUTMStatistics(data, type, this.props.data_report.utm_filters, 'month')
      else
        this.props.changedUTMStatistics1(data, type, this.props.data_report.utm_filters, 'month')
    }

    renderExpensesInfo(info) {
      return (
        <table className="table">
          <thead>
            <tr>
              <td className="no-padding"><b>Dan</b></td>
              {info && info.map((i, index) => (
                <td key={index} className="no-padding"><b>{i.name}</b></td>
              ))}
            </tr>
          </thead>
          <tbody>
          {info && info[0] && info[0].expenses.map((ie, index) => {
            return (
              <tr key={index}>
                <td key={index} className="no-padding"><b>{index+1}</b></td>
                {info.map((ii, i) => (
                  <td key={i} className="no-padding"><b>{ii.expenses[index].expense_value}</b></td>
                ))}
              </tr>
            )
          })}
          </tbody>
        </table>
      )
    }

    addNewStat1(obj) {
      this.props.addExpense(obj);
      this.setState({expenseSelectedCountry: "SI"})
      setTimeout(
        function() {
          this.props.getDailyIncomeReport('month');
        }
        .bind(this),
        1500
      );
    }

    state = {
  startDate: new Date()
};

handleChange = date => {
  this.setState({
    startDate: date
  });
};



    render(){
      const { order_statuses, data_report, utm_stats, localCountries, user, reportDataParam } = this.props;
      const status = order_statuses.map(p => { return {label : p.name, value : p.id};});
      const c = localCountries.map(c => { return {label: c, value: c}});

      var call_center = user && user.adminGroup && (user.adminGroup.name === "Call center") || false;
      var marketing = user && user.adminGroup && user.adminGroup.permission_names.find(a => {return a == 'expense'}) || false;
      var super_admin = user && user.adminGroup && (user.adminGroup.name === "Super Admin") || false;

      console.log("UTM STATS " + JSON.stringify(utm_stats));
      if (data_report.statistics.datasets[0]) {
        var stats = {
          labels: data_report.statistics.labels,
          datasets: [
            data_report.statistics.datasets[0],
            data_report.statistics.datasets[1]
          ]
        }
      }

      if (utm_stats.utm_mediums_chart.datasets) {
        var data = {
          labels: utm_stats.utm_mediums_chart.labels,
          datasets: utm_stats.utm_mediums_chart.datasets
        };
      }

      const options = {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          x: {
            barPercentage: 0.3,
            categoryPercentage: 1,
          },
          y: {
            barPercentage: 1,
            categoryPercentage: 1,
            beginAtZero: true,
          },
        },
      };

      return (
        <div className="content-wrapper container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h2 className="box-title">Mesečni prihodki</h2>
            </div>
          </div>
          <div className="box box-default pb-5 mb-4">
            <div className="row main-box-head">
              <div className="col-md-3">
                <label>Mesec</label>
                <div className="search-div-new datepick-new">
                  <DatePicker
                    selected={this.state.inputDate}
                    onChange={this.change_date.bind(this)}
                    dateFormat="MM/yyyy"
                    locale="sl-SI"
                    placeholderText="Izberi mesec"
                    showMonthYearPicker
                  />
                </div>
              </div>
              <div className="d-block col-md-4">
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
              <div className="d-block col-md-5">
                <label>Statusi</label>
                <Select
                  className="form-white"
                  name=""
                  placeholder="Izberi statuse..."
                  value={this.state.selectedStatuses}
                  options={status}
                  onChange={this.changeStatusesSelect.bind(this)}
                  multi={true}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-8 p-t-30">
                <div className="row">
                  <div className="col-md-10">
                    <span className="stat-span-inf daily-stats-inf">PRIHODKI</span>
                    <span className="stat-big-num">{data_report.total_income} €</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 p-t-30">
                    <span className="stat-span-inf daily-stats-inf">NAROČILA</span>
                    <span className="stat-big-num">{data_report.orders_count}</span>
                    <div className="sub-values-report">
                      <span className="stat-span-inf daily-stats-inf">AVG. ORDER VALUE</span>
                      <span className="stat-span-inf2"><b>{data_report.orders_avg_value} €</b></span>
                    </div>
                    <div className="sub-values-report">
                      <span className="stat-span-inf daily-stats-inf">UPSELL</span>
                      <span className="stat-span-inf2"><b>{data_report.orders_upsale} €</b></span>
                    </div>
                  </div>
                  <div className="col-md-4 p-t-30">
                    <span className="stat-span-inf daily-stats-inf">IZDELKI</span>
                    <span className="stat-big-num">{data_report.products_count}</span>
                    {data_report.products &&
                      Object.keys(data_report.products).map(this.renderProductSub.bind(this, data_report.products))
                    }
                    {data_report.stornoProducts &&
                      Object.keys(data_report.stornoProducts).map(this.renderStornoProductSub.bind(this, data_report.stornoProducts))
                    }
                  </div>
                  <div className="col-md-4 p-t-30">
                    <span className="stat-span-inf daily-stats-inf">DODATKI</span>
                    <span className="stat-big-num">{data_report.accessories_count}</span>
                    {data_report.accessories &&
                      Object.keys(data_report.accessories).map(this.renderProductSub.bind(this, data_report.accessories))
                    }

                    {data_report.stornoAccessories &&
                      Object.keys(data_report.stornoAccessories).map(this.renderStornoProductSub.bind(this, data_report.stornoAccessories))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="box box-default pt-4 pb-5">
            <div className="row px-3 py-3">
              <div className="col-md-12">
                <span className="no-padding date-stat">UTM medium stats</span><br/><br/><br/><br/>
                {!this.state.UTMStatsDetails && <button className="edit-customer-btn btn-cust-small expenses-cta" onClick={this.openUTMStats.bind(this)}>PODROBNO</button>}
              </div>
              <div className="col-md-2"></div>
                {this.state.UTMStatsDetails && <div className="col-md-8">
                  {data && <Bar options={options} data={data} width={500} height={150} className="bar-ch"/>}
                </div>}
            </div>
              {this.state.UTMStatsDetails && <div className="row px-3 py-3">
                <div className="col-md-12">
                  <span className="no-padding date-stat">UTM filter</span><br/><br/>
                </div>
                <div className="col-md-2 padding-md">
                  <div className="utm-filter-heading">Medium</div>
                  {data_report.utm_filters.utm_mediums.map(this.renderUtm.bind(this, 'medium'))}
                </div>
                <div className="col-md-2 padding-md">
                  <div className="utm-filter-heading">Source</div>
                  {data_report.utm_filters.utm_sources.map(this.renderUtm.bind(this, 'source'))}
                </div>
                <div className="col-md-2 padding-md">
                  <div className="utm-filter-heading">Campaign</div>
                  {data_report.utm_filters.utm_campaigns.map(this.renderUtm.bind(this, 'campaign'))}
                </div>
                <div className="col-md-2 padding-md">
                  <div className="utm-filter-heading">Content</div>
                  {data_report.utm_filters.utm_contents.map(this.renderUtm.bind(this, 'content'))}
                </div>
                <div className="col-md-1">
                </div>
                <div className="col-md-3">
                  <span className="stat-span-inf daily-stats-inf">PRIHODKI</span>
                  <span className="stat-big-num">{parseFloat(utm_stats.total_income).toFixed(2)} €</span>
                  <div className="row m-t-30">
                    <div className="col-md-12">
                      <span className="stat-span-inf daily-stats-inf">NAROČILA</span>
                      <span className="stat-big-num">{utm_stats.orders_count}</span>
                      <div className="sub-values-report">
                        <span className="stat-span-inf daily-stats-inf">AVG. ORDER VALUE</span>
                        <span className="stat-span-inf2"><b>{utm_stats.orders_avg_value} €</b></span>
                      </div>
                    </div>
                  </div>
                  <div className="row m-t-30">
                    <div className="col-md-6">
                      <span className="stat-span-inf daily-stats-inf">IZDELKI</span>
                      <span className="stat-big-num">{utm_stats.products_count}</span>
                      {utm_stats.products != null ? Object.keys(utm_stats.products).map(this.renderUTMProducts.bind(this)) : ""}
                      {utm_stats.stornoProducts &&
                        Object.keys(utm_stats.stornoProducts).map(this.renderStornoProductSub.bind(this, utm_stats.stornoProducts))
                      }
                    </div>
                    <div className="col-md-6">
                      <span className="stat-span-inf daily-stats-inf">DODATKI</span>
                      <span className="stat-big-num">{utm_stats.accessories_count}</span>
                      {utm_stats.accessories != null ? Object.keys(utm_stats.accessories).map(this.renderUTMAccessories.bind(this)) : ""}
                      {utm_stats.stornoAccessories &&
                        Object.keys(utm_stats.stornoAccessories).map(this.renderStornoProductSub.bind(this, utm_stats.stornoAccessories))
                      }
                    </div>
                  </div>
                </div>
              </div>}
          </div>
        </div>
      )
    }
 }

const mapDispatchToProps = (dispatch) => {
  return {
    getDailyIncomeReport: (type) => {
      dispatch(getDailyIncomeReport(type))
    },

    getUTMStats: (reportData) => {
      dispatch(getUTMStats(reportData))
    },

    checkedCountry: () => {
      dispatch(checkedCountry())
    },

    toggleCountry: (id, flag) => {
      dispatch(toggleCountry(id, flag))
    },

    changedUTMStatistics: (data, type, filters, inputType) => {
      dispatch(changedUTMStatistics(data, type, filters, inputType))
    },

    changedUTMStatistics1: (data, type, filters, inputType) => {
      dispatch(changedUTMStatistics1(data, type, filters, inputType))
    },

    addExpense: (obj) => {
      dispatch(addExpense(obj))
    },

    setLocalStatuses: (statuses) => {
      dispatch(setLocalStatuses(statuses))
    },

    changeExpenseCountry: (country) => {
      dispatch(changeExpenseCountry(country))
    }
  }
}

function mapStateToProps(state)
{
  var nextState = state.toJS();

  return {
    data_report: nextState.statistics_data.data_report,
    utm_stats: nextState.statistics_data.utm_stats,
    order_statuses: nextState.main_data.orderstatuses,
    countries: nextState.main_data.countries,
    country: nextState.customer_profile_data.countries,
    user: nextState.main_data.user,
    localCountries: nextState.main_data.localCountries,
    localStatuses: nextState.main_data.localStatuses,
    reportDataParam: nextState.statistics_data.reportDataParam
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MonthlyStatistics);
