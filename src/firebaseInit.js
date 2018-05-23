import Firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

import config from './firebaseConfig.js'

export default Firebase.initializeApp(config)