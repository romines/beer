/* global localStorage */

import axios from 'axios'

// Set in config/prod.env.js
const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1'

let cmsAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// IMPT we have to set the token in our header every single time
// cmsAxios.interceptors.request.use(request => {
//   // Get token from localStorage
//   const token = localStorage.token
//   // Update token axios header
//   if (token) {
//     request.headers['Authorization'] = 'Bearer ' + token
//   }
//   return request
// })

export default cmsAxios
