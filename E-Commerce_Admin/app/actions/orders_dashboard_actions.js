import axios from 'axios'
import {browserHistory} from 'react-router'
import {createNotification, errorNotification} from '../App.js'
import {ROOT_URL, GET_ORDERS_DASHBOARD, CHECK_ORDER, CHECK_ALL_ORDERS, CLEAR_SELECTED_ORDERS,
CHANGE_SELECTED_ORDERS, SHOW_COLORS, CHECK_COUNTRY_DASHBOARD, TOGGLE_COUNTRY_DASHBOARD, LOADING, NEW_ORDER, API_URL} from '../config/constants'

export function getDashboardOrders()
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.order_statuses)
  {
    query+=`order_statuses[]=${location.query.order_statuses}`;
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

  if(location.query.from_date)
  {
    query+=`&from_date=${location.query.from_date}`;
  }

  if(location.query.to_date)
  {
    query+=`&to_date=${location.query.to_date}`;
  }

  if(location.query.search)
  {
    query+=`&search=${location.query.search}`;
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
    query+=`&pageLimit=10`;
  }

  if(location.query.view)
  {
    query+=`&view=${location.query.view}`;
  }

  if(location.query.influencer)
  {
    query+=`&influencer=${location.query.influencer}`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/order${query}`)
		.then((response) => {
			dispatch({type: GET_ORDERS_DASHBOARD, payload: response.data})
			dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function editOrder(ids, obj, flag) {

  return function (dispatch) {
    for(var i=0; i<ids.length; i++) {
    		dispatch({type:LOADING, payload:true})
  		  axios.put(`${ROOT_URL}/admin/order/${ids[i]}`, obj)
  		.then((response) => {
        if(response.data.success) {
          //dispatch(getDashboardOrders());
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
}

export function changeOrderStatus(id, status, flag) {
  var obj = {
    ids: id,
    new_status: status
  }
  return function (dispatch) {
      var user = JSON.parse(localStorage.getItem('user'))
      const config = { headers: { 'authorization': user.session_id } };
      dispatch({type:LOADING, payload:true})
		  axios.post(`${API_URL}/order/status`, obj, config)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili status izbranih naročil!');
        if(flag == 1) {
          dispatch(getDashboardOrders());
        }
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

export function toggleCheckBox(id) {
  return function (dispatch) {
    dispatch({type:CHECK_ORDER, payload:id})
  }
}

export function checkAllOrders(flag) {
  return function (dispatch) {
    dispatch({type:CHECK_ALL_ORDERS, payload: flag})
  }
}

export function clear_selected_orders() {
  return function (dispatch) {
    dispatch({type:CLEAR_SELECTED_ORDERS, payload:true})
  }
}

export function show_color(id) {
  return function (dispatch) {
    dispatch({type:SHOW_COLORS, payload: id})
  }
}

export function checkedCountry()
{
  return function (dispatch) {
    dispatch({type:CHECK_COUNTRY_DASHBOARD, payload:null})
  }
}

export function toggleCountry(id, flag)
{
  return function (dispatch) {
    dispatch({type:TOGGLE_COUNTRY_DASHBOARD, payload:{id, flag}})
  }
}

export function addNewOrder(data) {
  return function (dispatch) {
    dispatch({type:NEW_ORDER, payload: data})
  }
}

export function add_color(ids, color, flag) {
  var data = {
    color_id: color.id,
    color_value: color.value,
    order_ids: ids
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.post(`${ROOT_URL}/admin/order/setColor`, data)
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili barvo izbranih naročil!');
        if(flag == 1) {
          dispatch(getDashboardOrders());
        }
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

export function change_selected_orders(event) {
  return function (dispatch) {
    dispatch({type:CHANGE_SELECTED_ORDERS, payload: event})
  }
}


export function printInvoices(ids) {
  const orderIds = ids.map((i) => i.id);

  return function (dispatch) {
    dispatch({ type: LOADING, payload: true });

    axios.post(`${ROOT_URL}/admin/order/invoice`, { ids: orderIds }, { responseType: 'arraybuffer' })
      .then((response) => {
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = 'Invoice.pdf';
        a.click();

        createNotification('success', 'Successfully exported selected orders as PDF!');
        dispatch({ type: LOADING, payload: false });
      })
      .catch((error) => {
        dispatch({ type: LOADING, payload: false });
        console.error("Error:", error);
        errorNotification(error.response?.data?.message || "An error occurred");
      });
  };
}

export function printInvoicesKnjizara(ids) {
  const orderIds = ids.map((i) => i.id);

  return function (dispatch) {
    dispatch({ type: LOADING, payload: true });

    axios.post(`${ROOT_URL}/admin/order/invoiceknjizara`, { ids: orderIds }, { responseType: 'arraybuffer' })
      .then((response) => {
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = 'InvoiceKnjizara.pdf';
        a.click();

        createNotification('success', 'Successfully exported selected orders as PDF!');
        dispatch({ type: LOADING, payload: false });
      })
      .catch((error) => {
        dispatch({ type: LOADING, payload: false });
        console.error("Error:", error);
        errorNotification(error.response?.data?.message || "An error occurred");
      });
  };
}

export function printPreInvoices(ids) {
  const orderIds = ids.map((i) => i.id);

  return function (dispatch) {
    dispatch({ type: LOADING, payload: true });

    axios.post(`${ROOT_URL}/admin/order/proforma`, { ids: orderIds }, { responseType: 'arraybuffer' })
      .then((response) => {
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = 'ProformaInvoices.pdf';
        a.click();

        createNotification('success', 'Successfully exported selected orders as PDF!');
        dispatch({ type: LOADING, payload: false });
      })
      .catch((error) => {
        dispatch({ type: LOADING, payload: false });
        console.error("Error:", error);
        errorNotification(error.response?.data?.message || "An error occurred");
      });
  };
}



export function printThankYou(ids) {
  ids = ids.map(i => {
    return i.id;
  });
  return function (dispatch) {
    dispatch({ type: LOADING, payload: true });
    axios.post(`${ROOT_URL}/admin/order/thankyou`, { ids }, { responseType: 'arraybuffer' })
      .then((response) => {
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = 'ThankYouLetter.pdf';
        a.click();
        createNotification('success', 'PDF successfully generated!');
        dispatch({type:LOADING, payload:false})
      })
      .catch((error) => {
        console.error('Error:', error);
        errorNotification(error.response?.data?.message || 'An error occurred');
      });
  };
}

export function printGLS(ids) {
  ids = ids.map(i => {
    return i.id
  })
  return function (dispatch) {
      dispatch({type:LOADING, payload:true})
      axios.post(`${ROOT_URL}/admin/order/excelgls`, {ids})
    .then((response) => {
      var buffer = response.data.result.data

      var a = document.createElement("a");
      document.body.appendChild(a);

      var arrayBuffer = new ArrayBuffer(buffer.length);
      var view = new Uint8Array(arrayBuffer);
      for ( var i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
      }

      var file = new Blob([arrayBuffer], {type: 'application/vnd.ms-excel'});

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file, 'ExportGLS.csv');
      }
      else {
          var fileURL = URL.createObjectURL(file);
          a.href = fileURL;
          a.target = '_blank';
          a.download = 'ExportGLS.csv';
          a.click();
      }
      createNotification('success','Uspešno ste izvozili izbrana naročila v CSV datoteki za GLS!');
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}



export function printZasilkovna(ids) {
  ids = ids.map(i => {
    return i.id
  })
  return function (dispatch) {
      dispatch({type:LOADING, payload:true})
      axios.post(`${ROOT_URL}/admin/order/excelzasilkovna`, {ids})
    .then((response) => {
      var buffer = response.data.result.data

      var a = document.createElement("a");
      document.body.appendChild(a);

      var arrayBuffer = new ArrayBuffer(buffer.length);
      var view = new Uint8Array(arrayBuffer);
      for ( var i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
      }

      var file = new Blob([arrayBuffer], {type: 'application/vnd.ms-excel'});

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file, 'ExportZasilkovna.xlsx');
      }
      else {
          var fileURL = URL.createObjectURL(file);
          a.href = fileURL;
          a.target = '_blank';
          a.download = 'ExportZasilkovna.xlsx';
          a.click();
      }
      createNotification('success','Uspešno ste izvozili izbrana naročila v XLSX datoteki za Zasilkovno!');
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}

export function printExpedico(ids) {
  ids = ids.map(i => {
    return i.id
  })
  return function (dispatch) {
      dispatch({type:LOADING, payload:true})
      axios.post(`${ROOT_URL}/admin/order/excelexpedico`, {ids})
    .then((response) => {
      var buffer = response.data.result.data

      var a = document.createElement("a");
      document.body.appendChild(a);

      var arrayBuffer = new ArrayBuffer(buffer.length);
      var view = new Uint8Array(arrayBuffer);
      for ( var i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
      }

      var file = new Blob([arrayBuffer], {type: 'application/vnd.ms-excel'});

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file, 'ExportExpedico.csv');
      }
      else {
          var fileURL = URL.createObjectURL(file);
          a.href = fileURL;
          a.target = '_blank';
          a.download = 'ExportExpedico.csv';
          a.click();
      }
      createNotification('success','Uspešno ste izvozili izbrana naročila v CSV datoteki za Expedico!');
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}


export function printCustomList(ids) {
  ids = ids.map(i => {
    return i.id
  })
  return function (dispatch) {
      dispatch({type:LOADING, payload:true})
      axios.post(`${ROOT_URL}/admin/order/excelcustomlist`, {ids})
    .then((response) => {
      var buffer = response.data.result.data

      var a = document.createElement("a");
      document.body.appendChild(a);

      var arrayBuffer = new ArrayBuffer(buffer.length);
      var view = new Uint8Array(arrayBuffer);
      for ( var i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
      }

      var file = new Blob([arrayBuffer], {type: 'application/vnd.ms-excel'});

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file, 'ExportCustomList.xlsx');
      }
      else {
          var fileURL = URL.createObjectURL(file);
          a.href = fileURL;
          a.target = '_blank';
          a.download = 'ExportCustomList.xlsx';
          a.click();
      }
      createNotification('success','Uspešno ste izvozili izbrana naročila v Excel datoteki!');
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}

export function printStornoList(ids) {
  ids = ids.map(i => {
    return i.id
  })
  return function (dispatch) {
      dispatch({type:LOADING, payload:true})
      axios.post(`${ROOT_URL}/admin/order/excelstornolist`, {ids})
    .then((response) => {
      var buffer = response.data.result.data

      var a = document.createElement("a");
      document.body.appendChild(a);

      var arrayBuffer = new ArrayBuffer(buffer.length);
      var view = new Uint8Array(arrayBuffer);
      for ( var i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
      }

      var file = new Blob([arrayBuffer], {type: 'application/vnd.ms-excel'});

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file, 'ExportStornoList.xlsx');
      }
      else {
          var fileURL = URL.createObjectURL(file);
          a.href = fileURL;
          a.target = '_blank';
          a.download = 'ExportStornoList.xlsx';
          a.click();
      }
      createNotification('success','Uspešno ste izvozili izbrana naročila v Excel datoteki!');
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}


export function printTaxList(ids) {
  ids = ids.map(i => {
    return i.id
  })
  return function (dispatch) {
      dispatch({type:LOADING, payload:true})
      axios.post(`${ROOT_URL}/admin/order/exceltaxlist`, {ids})
    .then((response) => {
      var buffer = response.data.result.data

      var a = document.createElement("a");
      document.body.appendChild(a);

      var arrayBuffer = new ArrayBuffer(buffer.length);
      var view = new Uint8Array(arrayBuffer);
      for ( var i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
      }

      var file = new Blob([arrayBuffer], {type: 'application/vnd.ms-excel'});

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file, 'ExcelTaxList.xlsx');
      }
      else {
          var fileURL = URL.createObjectURL(file);
          a.href = fileURL;
          a.target = '_blank';
          a.download = 'ExcelTaxList.xlsx';
          a.click();
      }
      createNotification('success','Uspešno ste izvozili izbrana naročila v Excel datoteki!');
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}


export function printPS(ids) {
  ids = ids.map(i => {
    return i.id
  })
  return function (dispatch) {
      dispatch({type:LOADING, payload:true})
      axios.post(`${ROOT_URL}/admin/order/excelposta`, {ids})
    .then((response) => {
      var buffer = response.data.result.data

      var a = document.createElement("a");
      document.body.appendChild(a);

      var arrayBuffer = new ArrayBuffer(buffer.length);
      var view = new Uint8Array(arrayBuffer);
      for ( var i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
      }

      var file = new Blob([arrayBuffer], {type: 'application/vnd.ms-excel'});

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file, 'ExportPosta.csv');
      }
      else {
          var fileURL = URL.createObjectURL(file);
          a.href = fileURL;
          a.target = '_blank';
          a.download = 'ExportPosta.csv';
          a.click();
      }
      createNotification('success','Uspešno ste izvozili izbrana naročila v CSV datoteki za Pošto Slovenije!');
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}

export function printPC(ids) {
  ids = ids.map(i => {
    return i.id
  })
  return function (dispatch) {
      dispatch({type:LOADING, payload:true})
      axios.post(`${ROOT_URL}/admin/order/excelpostacroatia`, {ids})
    .then((response) => {
      var buffer = response.data.result.data

      var a = document.createElement("a");
      document.body.appendChild(a);

      var arrayBuffer = new ArrayBuffer(buffer.length);
      var view = new Uint8Array(arrayBuffer);
      for ( var i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
      }

      var file = new Blob([arrayBuffer], {type: 'application/vnd.ms-excel'});

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file, 'ExportPostaCroatia.xls');
      }
      else {
          var fileURL = URL.createObjectURL(file);
          a.href = fileURL;
          a.target = '_blank';
          a.download = 'ExportPostaCroatia.xls';
          a.click();
      }
      createNotification('success','Uspešno ste izvozili izbrana naročila v Excel datoteki za pošto!');
      dispatch({type:LOADING, payload:false})
    })
    .catch((response) => {
      dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
    })
  }
}
