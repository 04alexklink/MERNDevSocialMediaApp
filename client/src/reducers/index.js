import { combineReducers } from 'redux';
import alert from './alert'
import authReducer from './auth'

export default combineReducers({
    alert,
    auth: authReducer
});