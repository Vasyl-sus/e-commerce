import Immutable from 'immutable';
import {GET_DAILY_STATISTICS, GET_AGENT_STATISTICS, GET_DAILY_INCOME_REPORT, GET_AGENT_ORDERS, CREATE_EXPENSE, GET_EXPENSES,
GET_UTM_STATISTICS, TOGGLE_EXPENSE, CHANGED_UTM_FILTERS, CHANGED_UTM_FILTERS1, CHAGE_EXCHANGE_COUNTRY, GET_UTM_EXPENSE_REPORTS_1,
GET_ORDER_STATISTICS, REPORT_DATA_PARAM} from '../config/constants';

const INITIAL_STATE = Immutable.fromJS({orderStatistics:{totalPromet: 0}, adminStatistics2:{}, adminStatistics3:{}, data_report:{langExpenses: [], statistics: {datasets:[], labels: []}, utm_filters:{utm_campaigns: [], utm_contents: [], utm_mediums: [], utm_sources: []}},
result:{vcc_data: {ordered: {}, success: {}, failed: {}}}, orders:[], ordersCount:0, expense_data:[], expenses:[], utm_stats:{utm_mediums_chart:{}}});

export default function (state = INITIAL_STATE, action)
{
	let nextState = state.toJS();

	switch (action.type)
  {
		case GET_ORDER_STATISTICS:
			nextState.orderStatistics = {...action.payload};
			break;
		case REPORT_DATA_PARAM:
			nextState.reportDataParam = action.payload;
			break;
		case GET_DAILY_STATISTICS:
      var data_report = action.payload.data
			nextState.data_report = data_report
			nextState.data_report.statistics.datasets.map(d => {
				d.label = d.name
				d.backgroundColor = d.color
			})
			var utms = action.payload.utm_filters
			nextState.data_report.utm_filters = {};
			nextState.data_report.utm_filters.utm_campaigns = Object.keys(utms.utm_campaigns).map(u => {
				return {name: u, active: 1, num:utms.utm_campaigns[u]}
			})
			nextState.data_report.utm_filters.utm_contents = Object.keys(utms.utm_contents).map(u => {
				return {name: u, active: 1, num:utms.utm_contents[u]}
			})
			nextState.data_report.utm_filters.utm_mediums = Object.keys(utms.utm_mediums).map(u => {
				return {name: u, active: 1, num:utms.utm_mediums[u]}
			})
			nextState.data_report.utm_filters.utm_sources = Object.keys(utms.utm_sources).map(u => {
				return {name: u, active: 1, num:utms.utm_sources[u]}
			})

			var expenses = nextState.data_report.expenses;
			var categories = [];

			for (var i in expenses) {
				for (var j in expenses[i]) {
					if (expenses[i][j].category) {
						var found = categories.find(cat => {
							return cat.category == expenses[i][j].category
						})
						if (!found) {
							categories.push({
								category: expenses[i][j].category,
								data: [{
									name: j,
									value: expenses[i][j].value,
									id: expenses[i][j].expense_data_id,
									additional_data: expenses[i][j].additional_data,
									expense_id: i,
									country: expenses[i][j].country,
                  product_name: expenses[i][j].product_name
								}]
							})
						} else {
							found.data.push({
								name: j,
								value: expenses[i][j].value,
								id: expenses[i][j].expense_data_id,
								additional_data: expenses[i][j].additional_data,
								expense_id: i,
								country: expenses[i][j].country,
                product_name: expenses[i][j].product_name
							})
						}
					} else {
						for (var k in expenses[i][j]) {
							if (expenses[i][j][k].category) {
								var found = categories.find(cat => {
									return cat.category == expenses[i][j][k].category
								})
								if (!found) {
									categories.push({
										category: expenses[i][j][k].category,
										data: [{
											name: j,
											value: expenses[i][j][k].value,
											id: expenses[i][j][k].expense_data_id,
											additional_data: expenses[i][j][k].additional_data,
											expense_id: i,
											country: expenses[i][j][k].country,
                      product_name: expenses[i][j].product_name
										}]
									})
								} else {
									found.data.push({
										name: j,
										value: expenses[i][j][k].value,
										id: expenses[i][j][k].expense_data_id,
										additional_data: expenses[i][j][k].additional_data,
										expense_id: i,
										country: expenses[i][j][k].country,
                    product_name: expenses[i][j].product_name
									})
								}
							}
						}
					}
				}
			}

			nextState.data_report.expenses = categories;
      if (nextState.data_report.expenses1)
        nextState.data_report.langExpenses = nextState.data_report.expenses1["SI"]

      break;

	  case GET_DAILY_INCOME_REPORT:
				var data_report = action.payload.data
						nextState.data_report = data_report
						nextState.data_report.statistics.datasets.map(d => {
							d.label = d.name
							d.backgroundColor = d.color
						})
						var utms = action.payload.utm_filters
						nextState.data_report.utm_filters = {};
						nextState.data_report.utm_filters.utm_campaigns = Object.keys(utms.utm_campaigns).map(u => {
							return {name: u, active: 1, num:utms.utm_campaigns[u]}
						})
						nextState.data_report.utm_filters.utm_contents = Object.keys(utms.utm_contents).map(u => {
							return {name: u, active: 1, num:utms.utm_contents[u]}
						})
						nextState.data_report.utm_filters.utm_mediums = Object.keys(utms.utm_mediums).map(u => {
							return {name: u, active: 1, num:utms.utm_mediums[u]}
						})
						nextState.data_report.utm_filters.utm_sources = Object.keys(utms.utm_sources).map(u => {
							return {name: u, active: 1, num:utms.utm_sources[u]}
						})
	
				break;

      case CHAGE_EXCHANGE_COUNTRY:
        nextState.data_report.langExpenses = nextState.data_report.expenses1[action.payload]
      break;

      case GET_UTM_EXPENSE_REPORTS_1:

	      var utms = action.payload.utm_filters;

	      var obj2 = nextState.data_report.utm_filters.utm_campaigns
	      nextState.data_report.utm_filters.utm_campaigns = nextState.data_report.utm_filters.utm_campaigns.map(u => {
	        var is_in = null;
	        is_in = Object.keys(utms.utm_campaigns).find(f => {
	          return f == u.name
	        })
	        return Object.assign({name: u.name, active: u.active, num:(is_in?utms.utm_campaigns[is_in]:0), obj2})
	      })

	      var obj3 = nextState.data_report.utm_filters.utm_contents
	      nextState.data_report.utm_filters.utm_contents = nextState.data_report.utm_filters.utm_contents.map(u => {
	        var is_in = null;
	        is_in = Object.keys(utms.utm_contents).find(f => {
	          return f == u.name
	        })
	        return Object.assign({name: u.name, active: u.active, num:(is_in?utms.utm_contents[is_in]:0), obj3})
	      })


	      var obj = nextState.data_report.utm_filters.utm_mediums
	      nextState.data_report.utm_filters.utm_mediums = nextState.data_report.utm_filters.utm_mediums.map(u => {
	        var is_in = null;
	        is_in = Object.keys(utms.utm_mediums).find(f => {
	          return f == u.name
	        })
	        return Object.assign({name: u.name, active: u.active, num:(is_in?utms.utm_mediums[is_in]:0), obj})
	      })

	      var obj1 = nextState.data_report.utm_filters.utm_sources
	      nextState.data_report.utm_filters.utm_sources = nextState.data_report.utm_filters.utm_sources.map(u => {
	        var is_in = null;
	        is_in = Object.keys(utms.utm_sources).find(f => {
	          return f == u.name
	        })
	        return Object.assign({name: u.name, active: u.active, num:(is_in?utms.utm_sources[is_in]:0), obj1})
	      })

	    break;

/*		case SET_CHANGED_FILTERS:
				nextState.expense_reports.utm_filters = action.payload
			break;*/


		case GET_UTM_STATISTICS:
			var utm_stats = action.payload.data;
			nextState.utm_stats = utm_stats;
			nextState.utm_stats.utm_mediums_chart.datasets.map(u => {
				u.label = u.name
				u.backgroundColor = u.color
			})
			break;

		case CHANGED_UTM_FILTERS:
			nextState.data_report.utm_filters = action.payload;
			break;

		case CHANGED_UTM_FILTERS1:
			nextState.data_report.utm_filters = action.payload;
			break;

		case GET_AGENT_STATISTICS:
      var stats = action.payload.result;

	    var tmpO = {};
			var tmpA = [];
			var tmpA1 = [];
			var max = 0;
			for(var x=0; x<stats.statistics2.labels.length; x++){
				var t = {};
				t.x = new Date(stats.statistics2.labels[x]);
				t.y = stats.statistics2.datasets[0].data[x];
				tmpA.push(t);

				if(max<t.y)
					max = t.y;

				var t1 = {};
					t1.x = new Date(stats.statistics2.labels[x]);
					t1.y = stats.statistics2.datasets[1].data[x];
				tmpA1.push(t1);

				if(max<t1.y)
					max = t1.y;

				tmpO.zacetna = tmpA;
				tmpO.upsell = tmpA1;
				tmpO.max = max + 200;
			}
			nextState.adminStatistics2 = tmpO;

			var tmpO2 = {};
			var tmpA2 = [];
			var tmpA12 = [];
			var max = 0;
			for(var x=0; x<stats.statistics3.labels.length; x++){
				var t = {};
				t.x = new Date(stats.statistics3.labels[x]);
				t.y = stats.statistics3.datasets[0].data[x];
				tmpA2.push(t);

				if(max<t.y)
					max = t.y;

				var t1 = {};
					t1.x = new Date(stats.statistics3.labels[x]);
					t1.y = stats.statistics3.datasets[1].data[x];
				tmpA12.push(t1);

				if(max<t1.y)
					max = t1.y;

				tmpO2.neuspesna = tmpA2;
				tmpO2.uspesna = tmpA12;
				tmpO2.max = max + 100;
			}
			nextState.adminStatistics3 = tmpO2;
      nextState.result = stats
      break;

		case GET_AGENT_ORDERS:
      var orders = action.payload.orders
      nextState.orders = orders
			var ordersCount = action.payload.ordersCount
			nextState.ordersCount = ordersCount
      break;

		case CREATE_EXPENSE:
			nextState.expense_data.push(action.payload)
			break;

		case GET_EXPENSES:
			var expenses = action.payload.expenses
			var data = [];
			var tmp = [];
			// tmp = expenses.filter(l => {
			// 		return l.category == 'products/logistics'
			// 	})
			// data.push({title:'IZDELKI IN LOGISTIKA', category:'products/logistics', content:[]});
			// tmp = [];

			tmp = expenses.filter(l => {
					return l.category == 'marketing'
				})
			data.push({title:'MARKETING', category:'marketing', content:tmp});
			tmp = [];

			tmp = expenses.filter(l => {
					return l.category == 'outsourcing'
				})
			data.push({title:'OUTSOURCING', category:'outsourcing', content:tmp});
			tmp = [];

			tmp = expenses.filter(l => {
					return l.category == 'software'
				})
			data.push({title:'SOFTWARE', category:'software', content:tmp});
			tmp = [];

			tmp = expenses.filter(l => {
					return l.category == 'work/office'
				})
			data.push({title:'DELO IN PISARNE', category:'work/office', content:tmp});
			tmp = [];

			nextState.expenses = data
			break;
	}

	return state.merge(nextState);
}
