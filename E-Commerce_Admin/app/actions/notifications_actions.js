import axios from 'axios'
import {createNotification, errorNotification} from '../App.js'
import {GET_NOTIFICATIONS, PUSH_NOTIFICATION, MARK_AS_READ, ROOT_URL, LOADING, TOGGLE_MENU} from '../config/constants';

export function getNotification(userGroup,from)
{
  return function (dispatch) {
		  axios.get(`${ROOT_URL}/admin/notifications/${userGroup}?from=${from}`)
		  .then((response) => {
			dispatch({type: GET_NOTIFICATIONS, payload: response.data.result})
		})
		.catch((response) => {
			dispatch({type:LOADING, payload:false})
      console.log(2262, response)
			errorNotification(response.response.data.message);
		})
	}
}

export function pushNotification (data) {
	return function(dispatch) {
		dispatch({type: PUSH_NOTIFICATION, payload: data})
    createNotification('success','Uspešno ste dodali novo obvestilo!');
	}
}

export function markReadNotification (notificationId) {
    return function (dispatch) {
        axios.put(`${ROOT_URL}/admin/notifications/${notificationId}`)
        .then((response) => {
          if(response.data.success) {
            dispatch({type: MARK_AS_READ, payload: notificationId})
            createNotification('success','Uspešno ste označili obvestilo kot prebrano!');
          }
        })
        .catch((response) => {
            dispatch({type:LOADING, payload:false})
            console.log(2262, response)
      			errorNotification(response.response.data.message);
        })
    }
}

export function toggleMenu(menuState) {
  return function (dispatch) {
    dispatch({type: TOGGLE_MENU, payload: menuState})
  }
}
