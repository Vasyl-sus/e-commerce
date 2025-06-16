import axios from 'axios'
import {LOADING, GET_LANGUAGE, SET_LANGUAGE, GET_LANGUAGES_ALL, ADD_LANGUAGE, SET_SUB_LANGUAGE, SET_T_LANGUAGE, PROD_API_URL } from '../config/constants'
import {createNotification, errorNotification} from '../App.js';

export function getModulesByLang(lang) {
	var user = JSON.parse(localStorage.getItem('user'))
	var config = { headers: { 'authorization': user.session_id } };

	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.get(`${PROD_API_URL}/language/${lang}`, config)
		.then((response) => {
			dispatch({type:LOADING, payload:false})
			dispatch({type:GET_LANGUAGE, payload:response.data})
			dispatch(setEditLanguage('header_footer'))
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function getAllLanguages() {
	var user = JSON.parse(localStorage.getItem('user'))
	var config = { headers: { 'authorization': user.session_id } };

	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.get(`${PROD_API_URL}/lang/all`, config)
		.then((response) => {
			dispatch({type:LOADING, payload:false})
			dispatch({type:GET_LANGUAGES_ALL, payload:response.data})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function addLanguage(obj) {
	var user = JSON.parse(localStorage.getItem('user'))
	var config = { headers: { 'authorization': user.session_id } };

	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${PROD_API_URL}/language`, obj, config)
		.then((response) => {
			if(response.data.success) {
        createNotification('success','Uspešno ste dodali nov jezik!');
				dispatch({type:ADD_LANGUAGE, payload:obj})
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

export function getLanguages() {
	var user = JSON.parse(localStorage.getItem('user'))
	const config = { headers: { 'authorization': user.session_id } };
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.get(`${PROD_API_URL}/lang/all`, config)
		.then((response) => {
			dispatch({type:LOADING, payload:false})
			dispatch({type:GET_LANGUAGES_ALL, payload:response.data})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
			console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function setEditLanguage(lang, flag) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		dispatch({type:SET_LANGUAGE, payload: {lang, flag}})
		dispatch({type:LOADING, payload:false})
	}
}

export function setSubEditLanguage(lang, name) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		dispatch({type:SET_SUB_LANGUAGE, payload: {lang, name}})
		dispatch({type:LOADING, payload:false})
	}
}

export function setTEditLanguage(lang, name) {
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		dispatch({type:SET_T_LANGUAGE, payload: {lang, name}})
		dispatch({type:LOADING, payload:false})
	}
}

export function editLanguage(language) {
	var user = JSON.parse(localStorage.getItem('user'))
	const	config = { headers: { 'authorization': user.session_id } };
	var names = language.map(l => {
		return l.name
	})
	return function (dispatch) {
		dispatch({type:LOADING, payload:true})
		axios.post(`${PROD_API_URL}/language/edit`, {
			language: language[0].language.toUpperCase(),
			names: names,
			datas: language
		}, config)
		.then((response) => {
			if(response.data.success) {
        createNotification('success','Uspešno ste posodobili jezika!');
				dispatch({type:GET_LANGUAGE, payload:response.data})
				dispatch(setEditLanguage('header_footer'))
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
