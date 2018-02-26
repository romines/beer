import Vue from 'vue'
import Vuex from 'vuex'
import 'babel-polyfill'
import firebase from 'firebase'
import 'firebase/firestore'

import config from '../firebaseConfig.js'

firebase.initializeApp(config)

Vue.use(Vuex)

const state = {
  db: firebase.firestore(),
  contactGroups: []
}

export default new Vuex.Store({
  state,
  mutations: {
    'SET_CONTACT_GROUPS' (state, { contactGroups }) {
      state.contactGroups = contactGroups
    }
  },
  actions: {

    listen ({commit, rootState}) {
      let resortsRef = rootState.db.collection('resorts')
      const myId = 'jackson_hole'
      resortsRef.doc(myId)
      .onSnapshot(doc => commit('SET_CONTACT_GROUPS', doc.data()))
    },
    seed ({ rootState }) {
      let resortsRef = rootState.db.collection('resorts')
      resortsRef.doc('jackson_hole').set({name: 'Jackson Hole', contactGroups: jHContacts.contactGroups, keys: jHContacts.keys, resortId: 'jackson_hole'})
      resortsRef.doc('r_l').set({name: 'RL', contactGroups: rLContacts.contactGroups, keys: rLContacts.keys, resortId: 'r_l'})

    },

  },
  modules: {
  }
})