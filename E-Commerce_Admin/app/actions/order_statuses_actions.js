import axios from 'axios'
import {browserHistory} from 'react-router'
import {setLocalStatuses} from './main_actions';
import {createNotification, errorNotification} from '../App.js'
import {ROOT_URL, GET_ORDER_STATUSES, SET_INITIAL_VALUES_ORDER_STATUS, EDIT_ORDER_STATUS, DELETE_ORDER_STATUS, LOADING} from '../config/constants'

export function getOrderStatuses()
{
  var location = browserHistory.getCurrentLocation();
  var query = "?";

  if(location.query.pageNumber)
  {
    query+=`pageNumber=${location.query.pageNumber}`;
  }
  else
  {
     query+=`pageNumber=1`;
  }

  if(location.query.pageLimit)
  {
    query+=`&pageLimit=${location.query.pageLimit}`;
  }
  else
  {
    query+=`&pageLimit=15`;
  }

  return function (dispatch) {
  		dispatch({type:LOADING, payload:true})
		  axios.get(`${ROOT_URL}/admin/orderstatus${query}`)
		  .then((response) => {
			  dispatch({type: GET_ORDER_STATUSES, payload: response.data})
        dispatch({type:LOADING, payload:false})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function createOrderStatus(obj, user, socket) {
	return function (dispatch) {
    	var statuses = JSON.parse(localStorage.getItem('orderstatuses'))
    	dispatch({type:LOADING, payload:true})
    	axios.post(`${ROOT_URL}/admin/orderstatus`, obj)
    	.then((response) => {
        if(response.data.success) {
          createNotification('success','Uspešno ste dodali nov status!');
          obj.id = response.data.id;
          statuses.push(obj);
          localStorage.setItem('orderstatuses', JSON.stringify(statuses))
          dispatch(setLocalStatuses(statuses));
        }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'orderstatuses', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setInitialValuesOrderStatus(obj) {
	return function (dispatch) {
		dispatch({type:SET_INITIAL_VALUES_ORDER_STATUS, payload:obj})
	}
}

export function editOrderStatus(id, obj, user, socket) {
	var statuses = JSON.parse(localStorage.getItem('orderstatuses'));
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		var newStatuses = [];
		var newSortOrder = obj.new_sort_order;
		var currentSortOrder = obj.sort_order;

		if(newSortOrder || newSortOrder == 0){
			newStatuses = statuses.map(status => {
				if(status.id == id){
					status.sort_order = newSortOrder;
          if(status.color != obj.color) {
            status.color = obj.color
          }
          if(status.name != obj.name) {
            status.name = obj.name
          }
				}
				else if(newSortOrder < currentSortOrder){
					if(status.sort_order >= newSortOrder && status.sort_order <= currentSortOrder){
						status.sort_order++;
					}
				}
				else if(newSortOrder > currentSortOrder){
					if(status.sort_order <= newSortOrder && status.sort_order >= currentSortOrder){
						status.sort_order--;
					}
				}
				return {id: status.id, name: status.name, color: status.color, sort_order: status.sort_order};
			});

      newStatuses = newStatuses.sort((a,b) => (parseInt(a.sort_order) > parseInt(b.sort_order)) ? 1 : ((parseInt(b.sort_order) > parseInt(a.sort_order)) ? -1 : 0));
		}

		delete obj.new_sort_order;

		axios.put(`${ROOT_URL}/admin/orderstatus/${id}`, {orderstatusData: obj, newStatuses: newStatuses})
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste posodobili statusa!');
        dispatch({type: EDIT_ORDER_STATUS, payload: {id, obj}});
        localStorage.setItem('orderstatuses', JSON.stringify(newStatuses))
        dispatch(setLocalStatuses(newStatuses));
      }
      dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'orderstatuses', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function deleteOrderStatus(id, user, socket) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		var statuses = JSON.parse(localStorage.getItem('orderstatuses'));

		var filteredStatuses = statuses.filter(status => status.id != id);

		var deletedStatus = statuses.filter(status => status.id == id);
		deletedStatus = deletedStatus[0];
		var X = deletedStatus.sort_order;

		var newStatuses = filteredStatuses.map(status => {
			if(status.sort_order > X){
				status.sort_order--;
			}
			return {id: status.id, name: status.name, color: status.color, sort_order: status.sort_order};
		});
		axios.delete(`${ROOT_URL}/admin/orderstatus/${id}`, {data: {newStatuses: newStatuses}})
		.then((response) => {
      if(response.data.success) {
        createNotification('success','Uspešno ste odstranili statusa!');
        dispatch({type: DELETE_ORDER_STATUS, payload: {id}});
        localStorage.setItem('orderstatuses', JSON.stringify(newStatuses))
        dispatch(setLocalStatuses(newStatuses));
      }
			dispatch({type:LOADING, payload:false})
			if(socket){
				socket.emit('newDataToServer', { what: 'orderstatuses', client_token: user.token});
			}
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}
