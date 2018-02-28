import Vue from 'vue'
import Vuex from 'vuex'
import 'babel-polyfill'
import firebase from 'firebase'
import 'firebase/firestore'
import jHContacts from '../assets/JH_contacts.json'

import config from '../firebaseConfig.js'

firebase.initializeApp(config)

Vue.use(Vuex)

const state = {
  db: firebase.firestore(),
  contactGroups: []
}

const resortsRef = state.db.collection('resorts')
const myId = 'jackson_hole'

export default new Vuex.Store({
  state,
  mutations: {
    'SET_CONTACT_GROUPS' (state, { contactGroups }) {
      state.contactGroups = contactGroups
    }
  },
  actions: {

    listen ({commit}) {
      resortsRef.doc(myId)
        .onSnapshot(doc => commit('SET_CONTACT_GROUPS', doc.data()))
    },
    seed ({ rootState }) {
      let resortsRef = rootState.db.collection('resorts')
      resortsRef.doc(myId).set({name: 'Jackson Hole', contactGroups: jHContacts.contactGroups, keys: jHContacts.keys, resortId: 'jackson_hole'})
    },
    saveContactGroupList ({commit, rootState}, { updatedList }) {
      resortsRef.doc(myId).update({
        contactGroups: updatedList
      })
    },
    saveContact ({commit, rootState}, payload) {
      let groups = rootState.contactGroups.slice()
      groups[payload.groupIndex].list[payload.contactIndex] = payload.updatedContact
      resortsRef.doc(myId).update({
        contactGroups: groups
      })
    },
    saveContactList ({commit, rootState}, payload) {
      let groups = rootState.contactGroups.slice()
      groups[payload.groupIndex].list = payload.updatedList
      resortsRef.doc(myId).update({
        contactGroups: groups
      })
    },


  },
  modules: {
  }
})