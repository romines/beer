import Firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

import config from './firebaseConfig.js'

// NODE_ENV undefined for some reason when set before runnin cypress
const environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'testing'
console.log('Initializing firebase with environment: ' + environment)

let functionsUrl = 'https://us-central1-rta-staging.cloudfunctions.net'
if (environment === 'production') functionsUrl = 'https://us-central1-resorts-tapped-admin.cloudfunctions.net'
if (environment === 'development') functionsUrl = 'http://localhost:5001/rta-staging/us-central1'


const firebase = Firebase.initializeApp(config[environment])

export const firestore = firebase.firestore()
export const database = firebase.database()
export const auth = firebase.auth()
export const storage = firebase.storage()
export const functionsBaseUrl = functionsUrl
