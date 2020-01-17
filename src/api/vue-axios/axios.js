/* global localStorage */

import axios from 'axios'

// Set in config/prod.env.js
// const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1'

export default axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
})
