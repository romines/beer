import User from './models/User'
import { auth, firestore, database } from '../firebaseInit.js'
import { secondaryAuth } from '../firebaseInitBackup.js'
import { promiseTo } from './utils.js'
import arrayHelper from '../helpers/arrayHelper.js'


const USERS_REF = firestore.collection('users')

const state = {
  user: {}
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
  setCurrentUser({ commit }, user) {
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


  async createUserForResort({ commit, dispatch, rootState }, newUser) {
    // This is annoying, but we have to create a new auth instance, because google's default behavior is to set the currentUser to the new user.
    // We don't want that.
    // See this SO: https://stackoverflow.com/questions/37517208/firebase-kicks-out-current-user/38013551#38013551
    const [createError, firebaseUser] = await promiseTo(
      secondaryAuth.createUserWithEmailAndPassword(newUser.email, newUser.password)
    )

    if (createError) {
      commit('SET_LOADING_STATE', false)
      return dispatch('showErrorModal', createError.message)
    }

    const uid = firebaseUser.user.uid

    delete newUser['password']
    newUser['primaryResortId'] = rootState.resortId

    const [rtdbSaveError] = await promiseTo(
      USERS_REF
        .doc(uid)
        .set(newUser)
    )


    if (rtdbSaveError) {
      commit('SET_LOADING_STATE', false)
      throw new Error(createError.message)
      return false
    } else {
      return newUser
    }
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
  }

}

export default {
  state,
  mutations,
  getters,
  actions
}
