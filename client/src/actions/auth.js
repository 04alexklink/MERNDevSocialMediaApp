import {REGISTER_FAIL, REGISTER_SUCCESS} from './types'
import {setAlert} from './alert'
import axios from 'axios'

export const registerFail = () => {
  return {
    type: REGISTER_FAIL,
  }
}

export const registerSuccess = (token) => {
  return {
    type: REGISTER_SUCCESS,
    payload: token
  }
}

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
  } catch (err) {
    const errors = err.response.data.errors
    if(errors) { 
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
    }
    dispatch(registerFail())
  }
}