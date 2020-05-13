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
          const userData = doc.data()

          // if not superAdmin set resortId here to user's primary resort
          if (!userData.primaryResortId) console.log('PRIMARY RESORT ID MISSING')
          if (!userData.superAdmin) commit('SET_RESORT_ID', userData.primaryResortId)

          let newUser = User.build(userData, user.uid)

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

    const user = {
      email:                email,
      primaryResortId:      resortId,
    }

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


  async createUserForResort({ commit, dispatch, rootState }, payload) {
    // This is annoying, but we have to create a new auth instance, because google's default behavior is to set the currentUser to the new user.
    // We don't want that.
    // See this SO: https://stackoverflow.com/questions/37517208/firebase-kicks-out-current-user/38013551#38013551
    const [createError, firebaseUser] = await promiseTo(
      secondaryAuth.createUserWithEmailAndPassword(payload.user.email, payload.user.password)
    )

    if (createError) {
      commit('SET_LOADING_STATE', false)
      return dispatch('showErrorModal', createError.message)
    }

    if (payload.sendPasswordResetEmail) {
      secondaryAuth.sendPasswordResetEmail(payload.user.email).then(() => {
      }).catch((error) => {
        console.log('EMAIL NOT SENT')
        console.log(error)
      })
    }

    const uid = firebaseUser.user.uid

    delete payload.user['password']
    payload.user['primaryResortId'] = rootState.resortId

    return USERS_REF.doc(uid).set(payload.user).then(() => {
      commit('ADD_RESORT_USER', User.build(payload.user, uid))
      return payload.user
    }).catch((error) => {
      commit('SET_LOADING_STATE', false)
      throw new Error(createError.message)
      return false
    })
  },


  async setResortUsers({ commit, rootState, getters }) {
    let users     = []
    let snapshots = await USERS_REF.get()

    snapshots.docs.forEach((userSnapshot) => {
      // Filter users to be those whose primaryResortId is the current resort
      let userData = userSnapshot.data()
      if (userData.primaryResortId === rootState.resortId && !userData.superAdmin && userData.uid !== getters.currentUser.uid) {
        users.push(User.build(userSnapshot.data(), userSnapshot.id))
      }
    })

    commit('SET_RESORT_USERS', users)
  },

  async saveResortUser({ commit, rootState }, user) {
    return USERS_REF.doc(user.uid).update(user).then((error) => {
      let newUser = User.build(user, user.uid)
      if (error) dispatch('showErrorModal', 'User update failed. Please try again')
      else commit('REPLACE_RESORT_USER', newUser)
    })
  },

  async deleteResortUser({ commit, rootState }, user) {
    let baseUrl = functionsBaseUrl + '/deleteFirebaseUser/' + user.uid

    // Delete both the auth user and the RT custom user
    // return Promise.all([
    //   USERS_REF.doc(user.uid).delete(),
    //   axios.delete(baseUrl)
    // ])

    // For some reason the functions call returns error, even though user is deleted. Going with this for now... 4/29/2020
    axios.delete(baseUrl).then(() => {}).catch((error) => {
      console.log(error.response.data)
    })
    return USERS_REF.doc(user.uid).delete().then(() => {
      commit('DELETE_RESORT_USER', user)
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
