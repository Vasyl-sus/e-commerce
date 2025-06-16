import axios from 'axios'
import {browserHistory} from 'react-router'
import {ROOT_URL, LOADING, HISTORY_EXPENSE, GET_DATA_FOR_LANGUAGE, ADD_NEW_EXPENSE, EDIT_EXPENSE, OPEN_NEW_EXPENSE, OPEN_EDIT_EXPENSE, ADD_NEW_EXPENSE_STAT } from '../config/constants'
import {createNotification, errorNotification} from '../App.js'


export function getDataByLang() {
	var location = browserHistory.getCurrentLocation();
  var query = "?"

	if(location.query.country)
  {
    query+=`country=${location.query.country}`;
  }
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.get(`${ROOT_URL}/admin/expense${query}&active=1`)
		.then((response) => {
			dispatch({type:LOADING, payload:false})
			dispatch({type:GET_DATA_FOR_LANGUAGE, payload:response.data.expenses})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function addExpenseToBase(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/expense/add`, obj)
		.then((response) => {
			if(response.data.success){
				createNotification('success','Uspešno ste dodali nov strošek!');
				obj.id = response.data.id;
				dispatch({type:ADD_NEW_EXPENSE_STAT, payload:obj})
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

export function addNewExpense(obj) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${ROOT_URL}/admin/expense`, obj)
		.then((response) => {
			if(response.data.success){
				createNotification('success','Uspešno ste dodali nov strošek!');
				obj.id = response.data.id;
				dispatch({type:ADD_NEW_EXPENSE, payload:obj})
				dispatch(getDataByLang())
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

export function editExpense(obj, id) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.put(`${ROOT_URL}/admin/expense/`+id, obj)
		.then((response) => {
			if(response.data.success){
				createNotification('success','Uspešno ste posodobili stroška!');
				obj.id = id;
				dispatch({type:EDIT_EXPENSE, payload:obj})
				dispatch(getDataByLang())
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

export function deleteExpense(id, country) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.delete(`${ROOT_URL}/admin/expense/`+id)
		.then((response) => {
			if(response.data.success){
				createNotification('success','Uspešno ste odstranili stroška!');
				dispatch(getDataByLang())
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

export function openNewExpense(obj) {
	return function (dispatch) {
		dispatch({type:OPEN_NEW_EXPENSE, payload:obj})
	}
}

export function openEditExpense(obj) {
	return function (dispatch) {
		dispatch({type:OPEN_EDIT_EXPENSE, payload:obj})
	}
}

export function getHistory() {
	var location = browserHistory.getCurrentLocation();
	var query = "?";

	if(location.query.country)
  {
    query+=`country=${location.query.country}`;
  }
	else
  {
     query+=`country=SI`;
  }

	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.get(`${ROOT_URL}/admin/expense/history${query}`)
		.then((response) => {
			dispatch({type:LOADING, payload:false})
			dispatch({type:HISTORY_EXPENSE, payload:response.data})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}
