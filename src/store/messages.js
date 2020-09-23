import { auth, firestore, database } from '../firebaseInit.js'
import { promiseTo } from './utils.js'
import arrayHelper from '../helpers/arrayHelper.js'
import VueAxios from 'vue-axios'
import axios from '../api/vue-axios/axios.js'
import { functionsBaseUrl } from '../firebaseInit.js'

const RESORTS_REF = firestore.collection('resorts')

const state = {
  noticeDictionary: {}
}

const mutations = {
  SET_NOTICE_MESSAGE (state, message) {
    state.noticeDictionary = message || {}
  },
  // SET_RESORT_USERS (state, users) {
  //   state.resortUsers = users
  // },
  // REPLACE_RESORT_USER (state, user) {
  //   arrayHelper.replaceObjectByValue(state.resortUsers, user, user.uid, 'uid')
  // },
  // DELETE_RESORT_USER (state, user) {
  //   arrayHelper.removeObjectByValue(state.resortUsers, user.uid, 'uid')
  // },
  // ADD_RESORT_USER (state, user) {
  //   state.resortUsers.push(user)
  // }
}

const getters = {
  currentNoticeMessage (state) {
    return state.noticeDictionary
  },
  // resortUsers (state) {
  //   return state.resortUsers
  // }
}


const actions = {
  createNoticeForResort({ commit, dispatch, rootState }, message) {
    return new Promise((resolve, reject) => {
      RESORTS_REF.doc(rootState.currentResort.id).get().then((doc) => {
        const resortData = doc.data()

        RESORTS_REF.doc(rootState.currentResort.id).update({ noticeDictionary: message }).then((response) => {
          commit('SET_NOTICE_MESSAGE', message)
          resolve()
        })
      })
    })
  },

  getSetNoticeMessage({ commit, dispatch, rootState }) {
    return new Promise((resolve, reject) => {
      RESORTS_REF.doc(rootState.currentResort.id).get().then((doc) => {
        const resortData = doc.data()
        commit('SET_NOTICE_MESSAGE', resortData.noticeDictionary)
        resolve()
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
