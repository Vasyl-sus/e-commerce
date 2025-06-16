import {
  ROOT_URL,
  GET_INIT_DATA,
  LOADING,
  GET_INSTA,
  SUBSCRIBE_TO_NEWSLETTER,
  OPEN_LANGUAGES,
  GET_REVIEWS,
  ADD_SEND_BUTTON,
  AKS_US_SUCCESS,
  UNSUBSCRIBE_INFOBIP,
  UNSUBSCRIBE_INFOBIP_ERROR,
} from '../constants/constants.js'
import axios from 'axios'

axios.defaults.headers['Pragma'] = 'no-cache'
export const redirect = (Router, url) => dispatch => {
  Router.push(url)
}

export const initData = () => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .get(`${ROOT_URL}/lang/init`)
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: GET_INIT_DATA, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
    })
}

export const getInsta = () => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .get(
      `https://api.instagram.com/v1/users/self/?access_token=1544622830.1677ed0.fb5dc3473290403b9635b5e3deda22f1`,
    )
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: GET_INSTA, payload: response.data.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
    })
}

export const subscribe = email => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .post(`${ROOT_URL}/subscribe`, email)
    .then(response => {
      dispatch({ 
        type: SUBSCRIBE_TO_NEWSLETTER, 
        payload: { 
          response: { 
            data: response.data.data || { 
              success: true, 
              message: "Subscription successful" 
            } 
          } 
        } 
      })
    })
    .catch(error => {
      dispatch({ 
        type: SUBSCRIBE_TO_NEWSLETTER, 
        payload: { 
          response: { 
            data: error.response?.data?.data || { 
              success: false, 
              message: error.message || "Subscription failed" 
            } 
          } 
        } 
      })
    })
    .finally(() => dispatch({ type: LOADING, payload: false }))
}

export const unsubscribeInfoBip = telephone => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .post(`${ROOT_URL}/subscribe/unsubscribeInfoBip`, { telephone })
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: UNSUBSCRIBE_INFOBIP, payload: response })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: UNSUBSCRIBE_INFOBIP_ERROR, payload: response })
    })
}

export const setLanguage = (country, lang, Router) => dispatch => {
  // dispatch({ type: LOADING, payload: true });
  axios
    .put(`${ROOT_URL}/lang/setlang/`, { country, lang })
    .then(response => {
      Router.push(`/${lang.toLowerCase()}-${country.toLowerCase()}/`)
      // dispatch({ type: LOADING, payload: false });
      // dispatch({ type: GET_REVIEWS, payload: response.data });
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const getReviews = link => dispatch => {
  dispatch({ type: LOADING, payload: true })
  axios
    .get(`${ROOT_URL}/lang/reviews/${link}`)
    .then(response => {
      dispatch({ type: LOADING, payload: false })
      dispatch({ type: GET_REVIEWS, payload: response.data })
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
      console.log(response)
    })
}

export const openLanguages = flag => dispatch => {
  dispatch({ type: OPEN_LANGUAGES, payload: flag })
}

export const verifyCallback = token => dispatch => {
  dispatch({ type: LOADING, payload: true })
  var data = {
    response: token,
  }
  axios
    .post(`${ROOT_URL}/subscribe/verifyReCaptchaToken`, data)
    .then(response => {
      if (response.status == 200) {
        dispatch({ type: ADD_SEND_BUTTON, payload: false })
        dispatch({ type: LOADING, payload: false })
      }
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
    })
}

export const submitInfoData = data => dispatch => {
  dispatch({ type: LOADING, payload: true })

  axios
    .post(`${ROOT_URL}/subscribe/ask-us`, data)
    .then(response => {
      if (response.status == 200) {
        dispatch({ type: AKS_US_SUCCESS, payload: false })
        dispatch({ type: LOADING, payload: false })
      }
    })
    .catch(response => {
      dispatch({ type: LOADING, payload: false })
    })
}
