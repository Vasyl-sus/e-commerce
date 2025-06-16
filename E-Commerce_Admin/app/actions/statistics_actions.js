import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, GET_DAILY_STATISTICS, GET_DAILY_INCOME_REPORT, GET_AGENT_STATISTICS, GET_AGENT_ORDERS, CHANGED_UTM_FILTERS1,
CREATE_EXPENSE, GET_EXPENSES, TOGGLE_EXPENSE, GET_UTM_STATISTICS, CHANGED_UTM_FILTERS, CHAGE_EXCHANGE_COUNTRY, GET_UTM_EXPENSE_REPORTS_1,
GET_ORDER_STATISTICS, LOADING, REPORT_DATA_PARAM} from '../config/constants'
import {createNotification, errorNotification} from '../App.js'

export function getDailyStatistics(type='day')
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  query += `type=${type}&`;

  if (location.query.orderStatuses)
  {
    var order_status = location.query.orderStatuses;

    if (typeof order_status != 'string')
    {
      for(var i=0; i<order_status.length; i++)
      {
        query+=`orderStatuses[]=${order_status[i]}&`;
      }
    }
    else
    {
        query+=`orderStatuses[]=${order_status}&`;
    }
  }

  if (location.query.countries)
  {
    var country = location.query.countries;

    if (typeof country != 'string')
    {
      for(var i=0; i<country.length; i++)
      {
        query+=`countries[]=${country[i]}&`;
      }
    }
    else
    {
      query+=`countries[]=${country}&`;
    }
  }

  if(location.query.inputDate)
  {
    query+=`inputDate=${location.query.inputDate}&`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/expense/report${query}`)
  		.then((response) => {
        var data = response.data;
        var filters = data.utm_filters
        var reportData = {};
        reportData.inputDate = location.query.inputDate;
        reportData.countries = location.query.countries
        reportData.orderStatuses = location.query.orderStatuses;
        reportData.type = type;
        reportData.utm_campaigns = [];
        reportData.utm_contents = [];
        reportData.utm_mediums = [];
        reportData.utm_sources = [];
        for (var i = 0; i < Object.keys(filters.utm_campaigns).length; i++) {
          if(Object.keys(filters.utm_campaigns)[i] == "null")
            reportData.utm_campaigns.push(null)
          else
            reportData.utm_campaigns.push(Object.keys(filters.utm_campaigns)[i])
        }
        for (var i = 0; i < Object.keys(filters.utm_contents).length; i++) {
          if(Object.keys(filters.utm_contents)[i] == "null")
            reportData.utm_contents.push(null)
          else
            reportData.utm_contents.push(Object.keys(filters.utm_contents)[i])
        }
        for (var i = 0; i < Object.keys(filters.utm_mediums).length; i++) {
          if(Object.keys(filters.utm_mediums)[i] == "null")
            reportData.utm_mediums.push(null)
          else
            reportData.utm_mediums.push(Object.keys(filters.utm_mediums)[i]);
        }
        for (var i = 0; i < Object.keys(filters.utm_sources).length; i++) {
          if(Object.keys(filters.utm_sources)[i] == "null")
            reportData.utm_sources.push(null)
          else
            reportData.utm_sources.push(Object.keys(filters.utm_sources)[i])
        }

        dispatch({type: GET_DAILY_STATISTICS, payload: data})
        dispatch({type: REPORT_DATA_PARAM, payload: reportData})
        dispatch({type:LOADING, payload:false})


		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getDailyIncomeReport(type='day') {
  var location = browserHistory.getCurrentLocation();
  var query = "?";
  query += `type=${type}&`;
  if (location.query.orderStatuses) {
    var order_status = location.query.orderStatuses;
    if (typeof order_status != 'string') {
      for (var i = 0; i < order_status.length; i++) {
        query += `orderStatuses[]=${order_status[i]}&`;
      }
    } else {
      query += `orderStatuses[]=${order_status}&`;
    }
  }
  if (location.query.countries) {
    var country = location.query.countries;
    if (typeof country != 'string') {
      for (var i = 0; i < country.length; i++) {
        query += `countries[]=${country[i]}&`;
      }
    } else {
      query += `countries[]=${country}&`;
    }
  }
  if (location.query.inputDate) {
    query += `inputDate=${location.query.inputDate}&`;
  }
  return function (dispatch) {
    dispatch({type: LOADING, payload: true});
    axios.get(`${ROOT_URL}/admin/expense/reportincome${query}`)
      .then((response) => {
        var data = response.data;
        var filters = data.utm_filters;
        var reportData = {};
        reportData.inputDate = location.query.inputDate;
        reportData.countries = location.query.countries;
        reportData.orderStatuses = location.query.orderStatuses;
        reportData.type = type;
        reportData.utm_campaigns = [];
        reportData.utm_contents = [];
        reportData.utm_mediums = [];
        reportData.utm_sources = [];
        for (var i = 0; i < Object.keys(filters.utm_campaigns).length; i++) {
          if (Object.keys(filters.utm_campaigns)[i] == "null")
            reportData.utm_campaigns.push(null);
          else
            reportData.utm_campaigns.push(Object.keys(filters.utm_campaigns)[i]);
        }
        for (var i = 0; i < Object.keys(filters.utm_contents).length; i++) {
          if (Object.keys(filters.utm_contents)[i] == "null")
            reportData.utm_contents.push(null);
          else
            reportData.utm_contents.push(Object.keys(filters.utm_contents)[i]);
        }
        for (var i = 0; i < Object.keys(filters.utm_mediums).length; i++) {
          if (Object.keys(filters.utm_mediums)[i] == "null")
            reportData.utm_mediums.push(null);
          else
            reportData.utm_mediums.push(Object.keys(filters.utm_mediums)[i]);
        }
        for (var i = 0; i < Object.keys(filters.utm_sources).length; i++) {
          if (Object.keys(filters.utm_sources)[i] == "null")
            reportData.utm_sources.push(null);
          else
            reportData.utm_sources.push(Object.keys(filters.utm_sources)[i]);
        }
        dispatch({type: GET_DAILY_INCOME_REPORT, payload: data});
        dispatch({type: REPORT_DATA_PARAM, payload: reportData});
        dispatch({type: LOADING, payload: false});
      })
      .catch((response) => {
        dispatch({type: LOADING, payload: false});
        console.log(2262, response);
        errorNotification(response.response.data.message);
      });
  }
}

export function getUTMStats(reportData)
{
  return function (dispatch) {
    
      dispatch({type:LOADING, payload:true})
    axios.post(`${ROOT_URL}/admin/expense/report1`, reportData)
    .then((response) => {
      dispatch({type: GET_UTM_STATISTICS, payload: response.data})
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
      errorNotification(response.response.data.message);
    })
  }
}

export function changedUTMStatistics(data, type, filters, inputType='day') {
  var location = browserHistory.getCurrentLocation();

  var filter;
  switch (type) {
    case 'medium':
      filter = filters.utm_mediums.find(f => f.name == data.name);
      filter.active = 0;
      break;
    case 'campaign':
      filter = filters.utm_campaigns.find(f => f.name == data.name);
      filter.active = 0;
      break;
    case 'source':
      filter = filters.utm_sources.find(f => f.name == data.name);
      filter.active = 0;
      break;
    case 'content':
      filter = filters.utm_contents.find(f => f.name == data.name);
      filter.active = 0;
      break;
  }

  return function (dispatch) {
    dispatch({ type: CHANGED_UTM_FILTERS, payload: filters });

    filters.utm_campaigns.push("Brez utm");
    filters.utm_contents.push("Brez utm");
    filters.utm_mediums.push("Brez utm");
    filters.utm_sources.push("Brez utm");

    const payload = {
      type: inputType,
      orderStatuses: location.query.orderStatuses,
      countries: location.query.countries,
      inputDate: location.query.inputDate,
      utm_campaigns: filters.utm_campaigns.filter(c => c.active).map(c => c.name === "Brez utm" ? null : c.name),
      utm_contents: filters.utm_contents.filter(c => c.active).map(c => c.name === "Brez utm" ? null : c.name),
      utm_mediums: filters.utm_mediums.filter(c => c.active).map(c => c.name === "Brez utm" ? null : c.name),
      utm_sources: filters.utm_sources.filter(c => c.active).map(c => c.name === "Brez utm" ? null : c.name),
    };

    dispatch({ type: LOADING, payload: true });
    axios.post(`${ROOT_URL}/admin/expense/report1`, payload)
      .then((response) => {
        dispatch({ type: GET_UTM_EXPENSE_REPORTS_1, payload: response.data.data });
        dispatch({ type: GET_UTM_STATISTICS, payload: response.data });
        dispatch({ type: LOADING, payload: false });
      })
      .catch((error) => {
        dispatch({ type: LOADING, payload: false });
        console.log(2262, error);
        if (error.response && error.response.data) {
          errorNotification(error.response.data.message);
        } else {
          errorNotification('An error occurred while fetching the UTM expense reports.');
        }
      });
  };
}

export function changedUTMStatistics1(data, type, filters, inputType='day') {
  var location = browserHistory.getCurrentLocation();

  var filter;
  switch (type) {
    case 'medium':
      filter = filters.utm_mediums.find(f => f.name == data.name);
      filter.active = 1;
      break;
    case 'campaign':
      filter = filters.utm_campaigns.find(f => f.name == data.name);
      filter.active = 1;
      break;
    case 'source':
      filter = filters.utm_sources.find(f => f.name == data.name);
      filter.active = 1;
      break;
    case 'content':
      filter = filters.utm_contents.find(f => f.name == data.name);
      filter.active = 1;
      break;
  }

  return function (dispatch) {
    dispatch({ type: CHANGED_UTM_FILTERS1, payload: filters });

    filters.utm_campaigns.push("Brez utm");
    filters.utm_contents.push("Brez utm");
    filters.utm_mediums.push("Brez utm");
    filters.utm_sources.push("Brez utm");

    const payload = {
      type: inputType,
      orderStatuses: location.query.orderStatuses,
      countries: location.query.countries,
      inputDate: location.query.inputDate,
      utm_campaigns: filters.utm_campaigns.filter(c => c.active).map(c => c.name === "Brez utm" ? null : c.name),
      utm_contents: filters.utm_contents.filter(c => c.active).map(c => c.name === "Brez utm" ? null : c.name),
      utm_mediums: filters.utm_mediums.filter(c => c.active).map(c => c.name === "Brez utm" ? null : c.name),
      utm_sources: filters.utm_sources.filter(c => c.active).map(c => c.name === "Brez utm" ? null : c.name),
    };

    dispatch({ type: LOADING, payload: true });
    axios.post(`${ROOT_URL}/admin/expense/report1`, payload)
      .then((response) => {
        dispatch({ type: GET_UTM_EXPENSE_REPORTS_1, payload: response.data.data });
        dispatch({ type: GET_UTM_STATISTICS, payload: response.data });
        dispatch({ type: LOADING, payload: false });
      })
      .catch((error) => {
        dispatch({ type: LOADING, payload: false });
        console.log(2262, error);
        if (error.response && error.response.data) {
          errorNotification(error.response.data.message);
        } else {
          errorNotification('An error occurred while fetching the UTM expense reports.');
        }
      });
  };
}

export function getExpensesByLang(lang)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/expense?active=1`)
		.then((response) => {
			dispatch({type: GET_EXPENSES, payload: response.data})
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function changeExpenseCountry(country) {
  return function (dispatch) {
    dispatch({type:CHAGE_EXCHANGE_COUNTRY, payload:country})
  }
}

export function addExpense(obj)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.post(`${ROOT_URL}/admin/expense/add/`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov strošek!');
        dispatch({type: CREATE_EXPENSE, payload: obj})
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function editExpense(obj)
{
  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.put(`${ROOT_URL}/admin/expense/edit/`, obj)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste uredili strošek!');
        // dispatch({type: CREATE_EXPENSE, payload: obj})
      }
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getAgentStatistics()
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.agent_id)
  {
    query+=`agent_id=${location.query.agent_id}`;
  }

  if(location.query.fromDate)
  {
    query+=`&fromDate=${location.query.fromDate}`;
  }

  if(location.query.toDate)
  {
    query+=`&toDate=${location.query.toDate}`;
  }

  if(location.query.order_type)
  {
    query+=`&order_type=${location.query.order_type}`;
  }

  if (location.query.countries)
  {
    var country = location.query.countries;

    if (typeof country != 'string')
    {
      for(var i=0; i<country.length; i++)
      {
        query+=`&countries[]=` + country[i];
      }
    }
    else
    {
      query+=`&countries[]=` + country;
    }
  }

  if (location.query.orderStatuses)
  {
    var order_status = location.query.orderStatuses;

    if (typeof order_status != 'string')
    {
      for(var i=0; i<order_status.length; i++)
      {
        query+=`&orderStatuses[]=` + order_status[i];
      }
    }
    else
    {
        query+=`&orderStatuses[]=` + order_status;
    }
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/statistics/agentStatistics${query}`)
		.then((response) => {
			dispatch({type: GET_AGENT_STATISTICS, payload: response.data})
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getAgentOrders()
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.agent_id)
  {
    query+=`agent_id=${location.query.agent_id}`;
  }

  if(location.query.pageNumber)
  {
    query+=`&pageNumber=${location.query.pageNumber}`;
  }
  else
  {
     query+=`&pageNumber=1`;
  }

  if(location.query.pageLimit)
  {
    query+=`&pageLimit=${location.query.pageLimit}`;
  }
  else
  {
    query+=`&pageLimit=5`;
  }

  if(location.query.fromDate)
  {
    query+=`&fromDate=${location.query.fromDate}`;
  }

  if(location.query.toDate)
  {
    query+=`&toDate=${location.query.toDate}`;
  }

  if(location.query.order_type)
  {
    query+=`&order_type=${location.query.order_type}`;
  }

  if (location.query.countries)
  {
    var country = location.query.countries;

    if (typeof country != 'string')
    {
      for(var i=0; i<country.length; i++)
      {
        query+=`&countries[]=` + country[i];
      }
    }
    else
    {
      query+=`&countries[]=` + country;
    }
  }

  if (location.query.orderStatuses)
  {
    var order_status = location.query.orderStatuses;

    if (typeof order_status != 'string')
    {
      for(var i=0; i<order_status.length; i++)
      {
        query+=`&orderStatuses[]=` + order_status[i];
      }
    }
    else
    {
        query+=`&orderStatuses[]=` + order_status;
    }
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/statistics/filterAgentOrders${query}`)
		.then((response) => {
			dispatch({type: GET_AGENT_ORDERS, payload: response.data})
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function toggleExpense(id)
{
  return function (dispatch) {
    dispatch({type:TOGGLE_EXPENSE, payload:{id}})
  }
}

export function getOrderStatistics()
{
  var location = browserHistory.getCurrentLocation();
  // var query = "?";
  var url = "";

  if(location.query.tab == "income") {
    url = "ordersIncomeStatistics";
  }
  else if(location.query.tab == "packet") {
    url = "ordersCountStatistics";
  }
  else if(location.query.tab == "product") {
    url = "productsCountStatistics";
  }
  else if(location.query.tab == "utm") {
    url = "utmStatistics";
  }
  else if(location.query.tab == "discount") {
    url = "discountsUsageStatistics";
  }

  // var reportData = {};
  // reportData = Object.assign(reportData, location.query);

  // if (location.query.opt) {
  //   query += `opt=${location.query.opt}`;
  //   if(location.query.opt == 'year') {
  //     if(location.query.year) {
  //       query += `&year=${location.query.year}`;
  //     }
  //   } else {
  //     delete location.query.year;
  //   }
  // }

  // if(location.query.fromDate)
  // {
  //   query+=`&fromDate=${location.query.fromDate}`;
  // }

  // if(location.query.toDate)
  // {
  //   query+=`&toDate=${location.query.toDate}`;
  // }

  // if(location.query.utm_type)
  // {
  //   query+=`&utm_type=${location.query.utm_type}`;
  // }

  // if (location.query.countries)
  // {
  //   var country = location.query.countries;

  //   if (typeof country != 'string')
  //   {
  //     for(var i=0; i<country.length; i++)
  //     {
  //       query+=`&countries[]=` + country[i];
  //     }
  //   }
  //   else
  //   {
  //     query+=`&countries[]=` + country;
  //   }
  // }

  // if (location.query.orderStatuses)
  // {
  //   var order_status = location.query.orderStatuses;

  //   if (typeof order_status != 'string')
  //   {
  //     for(var i=0; i<order_status.length; i++)
  //     {
  //       query+=`&orderStatuses[]=` + order_status[i];
  //     }
  //   }
  //   else
  //   {
  //       query+=`&orderStatuses[]=` + order_status;
  //   }
  // }

  // if (location.query.products)
  // {
  //   var product = location.query.products;

  //   if (typeof product != 'string')
  //   {
  //     for(var i=0; i<product.length; i++)
  //     {
  //       query+=`&products[]=` + product[i];
  //     }
  //   }
  //   else
  //   {
  //       query+=`&products[]=` + product;
  //   }
  // }

  // if (location.query.accessories)
  // {
  //   var accessory = location.query.accessories;

  //   if (typeof accessory != 'string')
  //   {
  //     for(var i=0; i<accessory.length; i++)
  //     {
  //       query+=`&accessories[]=` + accessory[i];
  //     }
  //   }
  //   else
  //   {
  //       query+=`&accessories[]=` + accessory;
  //   }
  // }

  var reportData = {};
  reportData = Object.assign(reportData, location.query);
  var fields = ['countries','accessories','products','orderStatuses'];
  Object.keys(reportData).forEach(k => {
    if(fields.find(f => {return f==k;})){
      if (typeof reportData[k] == 'string'){
        reportData[k] = [reportData[k]];
      }
    }
    if(k=='toDate'){
      let toDate = new Date(parseInt(reportData[k]));
      toDate.setDate(toDate.getDate()+1);
      reportData[k] = toDate.getTime().toString();
    }
  })

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
      //axios.get(`${ROOT_URL}/admin/statistics/${url}${query}`)
      axios.post(`${ROOT_URL}/admin/statistics/${url}`, reportData)
		.then((response) => {
			dispatch({type: GET_ORDER_STATISTICS, payload: response.data.orderStatistics})
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}
