/* global localStorage */

import axios from 'axios'
import leaderboardConfig from '../../leaderboardConfig'
import stringHelper from '../../helpers/stringHelper'

// Set in src/leaderboardConfig.js
const API_URL = leaderboardConfig[process.env.NODE_ENV] || 'http://localhost:3000/api/v1'

let cmsAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// IMPT we have to set the token in our header every single time
cmsAxios.interceptors.request.use(request => {
  // Get token from localStorage
  const token = localStorage.leaderboardToken
  // Update token axios header
  if (token) {
    request.headers['Authorization'] = 'Bearer ' + token
  }
  return request
})

// Add simple global error handling. This is the default and can be overridden during individual API calls.
cmsAxios.interceptors.response.use(response => {
  // all is well, clear any lingering errors
  // store.dispatch('removeError')
  return stringHelper.camelizeResponse(response.data)
}, error => { // display error message
  // Handle network error first
  // if (!error.response) {
  //   store.dispatch('addError', { errorMessage: 'There was a problem connecting to our servers. Please login and try again.', hideDefault: true })
  //   return
  // }
  // // We want to first handle errors for expired tokens
  // if (error.response.data && error.response.data.error === 'INVALID_TOKEN') {
  //   store.dispatch('addError', { errorMessage: 'Your session has expired. Please log in again', hideDefault: true })
  //   return
  // }
  // // Then we want to bypass showing error message for incorrect login
  // if (error.response.status === 401) return Promise.reject(error)
  // // otherwise just show the error!
  // let errorMessage = ''
  // if (error.response.data && error.response.data.error) errorMessage = error.response.data.error
  // else if (error.response && error.response.statusText) errorMessage = error.response.statusText
  // else errorMessage = error.message
  //
  // store.dispatch('addError', { errorMessage: errorMessage })
  // return Promise.reject(error)
})


export default cmsAxios
