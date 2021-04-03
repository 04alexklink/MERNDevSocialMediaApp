import {REGISTER_FAIL, REGISTER_SUCCESS, AUTH_ERROR, USER_LOADED, LOGIN_SUCCESS, LOGIN_FAIL} from './types'
import {setAlert} from './alert'
import axios from 'axios'
import setAuthToken from '../utils/setAuthToken'

// User load async action creator fn 

export const loadUser = () => async dispatch => {
  if(localStorage.token) {
    setAuthToken(localStorage.token)
  }
  try {
    const res = await axios.get('http://localhost:5000/api/auth')
    dispatch({
      type: USER_LOADED,
      payload: res.data
    })
  } catch (err) {
    dispatch({
      type: AUTH_ERROR
    })
  }
}

// REGISTER_FAIL action creator function
export const registerFail = () => {
  return {
    type: REGISTER_FAIL,
  }
}

// REGISTER_SUCCESS action creator function
export const registerSuccess = (token) => {
  return {
    type: REGISTER_SUCCESS,
    payload: token
  }
}


// register a user
export const register = ({ name, email, password }) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const body = JSON.stringify({name, email, password})
  try {
    const res = await axios.post('http://localhost:5000/api/users', body, config)
   // dispatching the action object for register success directly, instead of creating an action creator fn to deal with 
   // creating the action object:
   // dispatch({
  //    type: REGISTER_SUCCESS;
  //    payload: res.data,
  // })
  
   dispatch(registerSuccess(res.data))
   dispatch(loadUser())
  } catch (err) {
    const errors = err.response.data.errors
    if(errors) { 
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
    }
    dispatch(registerFail())
  }
}
// login User async action creator function
export const login = (email, password) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const body = JSON.stringify({email, password})
  try {
    const res = await axios.post('http://localhost:5000/api/auth', body, config)
   dispatch({
     type: LOGIN_SUCCESS,
     payload: res.data
   })
   dispatch(loadUser())
  } catch (err) {
    const errors = err.response.data.errors
    if(errors) { 
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
    }
    dispatch({
     type: LOGIN_FAIL 
    })
  }
}