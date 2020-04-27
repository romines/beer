import User from './models/User'
import { auth, firestore } from '../firebaseInit.js'
import { promiseTo } from './utils.js'

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
      authorizedResortIds:  [resortId],
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


  async setResortUsers({ commit, rootState }) {
    let users     = []
    let snapshots = await USERS_REF.get()

    snapshots.docs.forEach((userSnapshot) => {
      // Filter users to be those whose primaryResortId is the current resort
      if (userSnapshot.data().primaryResortId === rootState.resortId) users.push(User.build(userSnapshot.data(), userSnapshot.id))
    })

    commit('SET_RESORT_USERS', users)
  }

}

export default {
  state,
  mutations,
  getters,
  actions
}
