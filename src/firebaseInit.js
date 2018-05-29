import Firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

import config from './firebaseConfig.js'

const environment = (process.env.NODE_ENV === 'production') ? 'production' : 'staging'
console.log('Initializing firebase with environment: ' + environment);

export default Firebase.initializeApp(config[environment])