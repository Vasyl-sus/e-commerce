import React, { Component } from 'react';
import { connect } from 'react-redux';
import Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import Boost from 'highcharts/modules/boost';
import debounce from 'lodash/debounce';

// Initialize exporting and boost modules.
if (typeof Exporting === 'function') {
  Exporting(Highcharts);
}
if (typeof Boost === 'function') {
  Boost(Highcharts);
}

const tooltip = {
  formatter: function() {
    let html = '<span style="font-size:13px; z-index: 0; max-height: 350px;">' + this.x + '</span><table>';
    let inner = '';
    const footer = '</table>';
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].y !== 0) {
        inner += '<tr><td style="color:' + this.points[i].point.color + ';padding:2px">' + this.points[i].series.name + ':</td>' +
          '<td style="padding:2px">' + this.points[i].y.toFixed(2) + '</td></tr>';
      }
    }
    return html + inner + footer;
  },
  shared: true,
  useHTML: true
};

class StatisticBars extends Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.renderChart = debounce(this.renderChart.bind(this), 300);
  }

  componentDidUpdate(prevProps) {
    if (this.props.labels !== prevProps.labels || this.props.datasets !== prevProps.datasets) {
      this.renderChart();
    }
  }

  renderChart() {
    if (this.props.labels) {
      Highcharts.chart(this.chartRef.current, {
        chart: {
          type: 'column',
          boost: {
            useGPUTranslations: true,
            usePreAllocated: true
          }
        },
        title: {
          text: ''
        },
        xAxis: {
          categories: this.props.labels
        },
        yAxis: {
          title: {
            text: ''
          }
        },
        tooltip: tooltip,
        plotOptions: {
          column: {
            stacking: this.props.tab === 'income' ? 'normal' : '',
            dataLabels: {
              enabled: false,
              formatter: function() {
                return this.y <= 5 ? '' : this.y;
              },
              color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
              style: {
                textShadow: '0 0 3px black, 0 0 3px black'
              }
            }
          },
          series: this.props.tab === 'utm' ? {
            cursor: 'pointer',
            point: {
              events: {
                // click: function(event) {
                //   this.props.onBarClick(this.state.activeYear, this.state.utmType, event)
                //   this.setState({showUTMModal: true, clickedData: event.point.series.name})
                // }
              }
            },
            events: {
              // legendItemClick: function(event) {
              //   this.props.onLegendClick(this.state.activeCountries, this.state.startDateFrom, this.state.startDateTo, this.state.utmType, event)
              //   this.setState({showUTMModal: true, clickedData: event.target.name})
              //   return false;
              // }
            }
          } : {}
        },
        series: this.props.datasets
      });
    }
  }

  componentDidMount() {
    this.renderChart();
  }

  render() {
    return (
      <div ref={this.chartRef}></div>
    );
  }
}

export default connect(null, null)(StatisticBars);