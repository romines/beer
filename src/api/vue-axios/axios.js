/* global localStorage */

import axios from 'axios'
import leaderboardConfig from '../../leaderboardConfig'

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

export default cmsAxios
