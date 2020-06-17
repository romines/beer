import User from './models/User'
import { auth, firestore, database } from '../firebaseInit.js'
import { secondaryAuth } from '../firebaseInitBackup.js'
import { promiseTo } from './utils.js'
import arrayHelper from '../helpers/arrayHelper.js'
import VueAxios from 'vue-axios'
import axios from '../api/vue-axios/axios.js'
import { functionsBaseUrl } from '../firebaseInit.js'

const USERS_REF = firestore.collection('users')

const state = {
  user: null,
  resortUsers: []
}

const mutations = {
  SET_USER (state, user) {
    state.user = user
  },
  SET_RESORT_USERS (state, users) {
    state.resortUsers = users
  },
  REPLACE_RESORT_USER (state, user) {
    arrayHelper.replaceObjectByValue(state.resortUsers, user, user.uid, 'uid')
  },
  DELETE_RESORT_USER (state, user) {
    arrayHelper.removeObjectByValue(state.resortUsers, user.uid, 'uid')
  },
  ADD_RESORT_USER (state, user) {
    state.resortUsers.push(user)
  }
}

const getters = {
  currentUser (state) {
    return state.user
  },
  resortUsers (state) {
    return state.resortUsers
  }
}


const actions = {
  setCurrentUser({ commit, dispatch }, user) {
    console.log('setCurrentUser dispatched . . .')

    return USERS_REF
      .doc(user.uid)
      .get()
      .then(
        doc => {
          const userData  = doc.data()
          let newUser     = User.build(userData, user.uid)

          commit('SET_USER', newUser)

          return Promise.resolve(newUser)
        },
        err => console.log(err)
      )
  },


  clearCurrentUser({commit}) {
    commit('SET_USER', {})
  },


  async createUser({ commit, dispatch }, { email, password, resortId }) {
    const [createError, firebaseUser] = await promiseTo(
      auth.createUserWithEmailAndPassword(email, password)
    )

    if (createError) {
      commit('SET_LOADING_STATE', false)
      return dispatch('showErrorModal', createError.message)
    }

    const uid = firebaseUser.user.uid

    const user = { email: email }

    const [rtdbSaveError] = await promiseTo(
      USERS_REF
        .doc(uid)
        .set(user)
    )

    if (rtdbSaveError) {
      commit('SET_LOADING_STATE', false)
      return dispatch('showErrorModal', createError.message)
    }

    const userForStore = {
      ...user,
      uid,
      superAdmin: false,
    }

    commit('SET_USER', userForStore)

    return { successfulUserCreation: true }
  },


  async lookupUserByEmailAddress({commit, dispatch}, emailAddress) {
    return new Promise((resolve, reject) => {
      var user
      USERS_REF.get().then((snapshot) => {
        snapshot.forEach(userSnapshot => {
          let userData = userSnapshot.data()
          if (userData.email === emailAddress) {
            user = userSnapshot.data()
          }
        })
        resolve(user)
      })
    })
  },


  async createUserForResort({ commit, dispatch, rootState }, payload) {
    // This is annoying, but we have to create a new auth instance, because google's default behavior is to set the currentUser to the new user.
    // We don't want that.
    // See this SO: https://stackoverflow.com/questions/37517208/firebase-kicks-out-current-user/38013551#38013551
    const [createError, firebaseUser] = await promiseTo(
      secondaryAuth.createUserWithEmailAndPassword(payload.user.email, payload.user.password)
    )

    if (createError) {
      commit('SET_LOADING_STATE', false)
      dispatch('showErrorModal', createError.message)
      return
    }

    if (payload.sendPasswordResetEmail) {
      secondaryAuth.sendPasswordResetEmail(payload.user.email).then(() => {
      }).catch((error) => {
        console.log('EMAIL NOT SENT')
        console.log(error)
      })
    }

    const uid = firebaseUser.user.uid
    payload.user['uid'] = uid
    delete payload.user['password'] // don't want to save password on RT user object

    payload.user['superAdmin'] = false
    payload.user['authorizedResorts'] = {}
    payload.user['authorizedResorts'][rootState.currentResort.id] = payload.permissions

    return dispatch('saveUserForCurrentResort', payload.user)
  },


  saveUserForCurrentResort({ commit, rootState }, user) {
    return new Promise((resolve, reject) => {
      USERS_REF.doc(user.uid).set(user).then(() => {
        commit('ADD_RESORT_USER', User.build(user, user.uid))
        commit('SET_LOADING_STATE', false)
        resolve(user)
      }).catch((error) => {
        commit('SET_LOADING_STATE', false)
        throw new Error(error.message)
        console.log(error)
        reject(error)
      })
    })
  },


  async setResortUsers({ commit, rootState, getters }) {
    let users     = []
    let snapshots = await USERS_REF.get()

    snapshots.docs.forEach((userSnapshot) => {
      // Filter users to be those who have currentResort in their authorizedResorts
      let userData = userSnapshot.data()
      if (!userData.authorizedResorts) return
      if (Object.keys(userData.authorizedResorts).includes(rootState.currentResort.id) && !userData.superAdmin && userData.uid !== getters.currentUser.uid) {
        users.push(User.build(userSnapshot.data(), userSnapshot.id))
      }
    })

    commit('SET_RESORT_USERS', users)
  },


  saveResortUser({ commit, rootState }, user) {
    return new Promise((resolve, reject) => {
      USERS_REF.doc(user.uid).update(user).then((error) => {
        let newUser = User.build(user, user.uid)
        if (error) {
          dispatch('showErrorModal', 'User update failed. Please try again')
          reject(error)
        } else {
          resolve(newUser)
        }
      }).catch((err) => {
        reject(err)
      })
    })
  },


  deleteResortUser({ commit, rootState }, user) {
    return new Promise((resolve, reject) => {
      let baseUrl = functionsBaseUrl + '/deleteFirebaseUser/' + user.uid

      // Delete both the auth user and the RT custom user
      Promise.all([
        USERS_REF.doc(user.uid).delete(),
        axios.delete(baseUrl)
      ]).then(() => {
        commit('DELETE_RESORT_USER', user)
        resolve()
      }).catch((err) => {
        reject(err)
      })
    })
  },


  removeResortFromUser({ commit, rootState, dispatch }, user) {
    return new Promise((resolve, reject) => {
      // Delete resort from authorizedResorts list
      delete user.authorizedResorts[rootState.currentResort.id]

      if (user.authorizedResortCount() === 0) {
        // delete user completely
        return dispatch('deleteResortUser', user).then(() => {
          resolve()
        })
      } else {
        // Save user's current state. Cannot be a custom User object, so parse and stringify
        return dispatch('saveResortUser', JSON.parse(JSON.stringify(user))).then((user) => {
          commit('DELETE_RESORT_USER', user) // Remove user from current
          resolve(user)
        })
      }
    })
  },


  setUserPassword({ commit, rootState }, payload) {
    return new Promise((resolve, reject) => {
      // This method is not ideal but reauthenticateWithCredential would not work :(
      auth.signInWithEmailAndPassword(auth.currentUser.email, payload.currentPassword).then(() => {
        auth.currentUser.updatePassword(payload.newPassword).then(function() {
          // Update successful.
          resolve()
        }).catch((error) => {
          reject(error)
        });
      }).catch((error) => {
        reject(error)
      })
    })
  },

}

export default {
  state,
  mutations,
  getters,
  actions
}
