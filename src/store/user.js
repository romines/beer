import User from './models/User'
import { auth, firestore } from '../firebaseInit.js'
import { promiseTo } from './utils.js'

const state = {
  user: {}
}

const mutations = {
  SET_USER (state, user) {
    state.user = user
  }
}

const getters = {
  currentUser (state) {
    return state.user
  }
}


const actions = {
  setCurrentUser({ commit }, user) {
    console.log('setCurrentUser dispatched . . .')

    return firestore
      .collection('users')
      .doc(user.uid)
      .get()
      .then(
        doc => {
          const userData = doc.data()
          user.authorizedResortIds = userData.authorizedResortIds

          // if not superAdmin set resortId here to first (only) resortId in authorized list
          if (!userData.superAdmin) commit('SET_RESORT_ID', userData.authorizedResortIds[0])

          let newUser = User.build(userData, user)

          commit('SET_USER', newUser)

          return Promise.resolve()
        },
        err => console.log(err)
      )
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
      email,
      authorizedResortIds: [resortId],
    }

    const [rtdbSaveError] = await promiseTo(
      firestore
        .collection('users')
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

}

export default {
  state,
  mutations,
  getters,
  actions
}
