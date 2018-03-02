import Vue from 'vue'
import Vuex from 'vuex'
import 'babel-polyfill'
import firebase from 'firebase'
import 'firebase/firestore'
import jHContacts from '../assets/JH_contacts.json'
// import contactSpec from '../assets/ContactSpec_rev_2-28.json'
// console.log({contactSpec, jHContacts});

import config from '../firebaseConfig.js'

firebase.initializeApp(config)

Vue.use(Vuex)

const state = {
  db: firebase.firestore(),
  contactGroups: [],
  modal: {
    show: false,
    contents: {
      heading: '',
      message: '',
      onConfirm: () => {return},
      onCancel: () => {return},
      buttonLess: false,
      loading: false
    }
  }
}

const resortsRef = state.db.collection('resorts')
const myId = 'jackson_hole'

export default new Vuex.Store({
  state,
  mutations: {
    'SET_CONTACT_GROUPS' (state, { contactGroups }) {
      state.contactGroups = contactGroups
    },
    'SHOW_MODAL' (state, contents) {
      state.modal.show = true
      state.modal.contents = {...contents}
    },
    'CLOSE_MODAL' (state) {
      state.modal.show = false
    }
  },
  actions: {

    listen ({commit}) {
      return resortsRef.doc(myId)
        .onSnapshot(doc => commit('SET_CONTACT_GROUPS', doc.data()))
    },
    seed ({ rootState }) {
      let resortsRef = rootState.db.collection('resorts')
      resortsRef.doc(myId).set({name: 'Jackson Hole', contactGroups: jHContacts.contactGroups, keys: jHContacts.keys, resortId: 'jackson_hole'})
    },
    saveNewEmptyGroup ({rootState}, groupName) {
      let groups = rootState.contactGroups.slice()
      groups.push({
        section: groupName,
        list: []
      })
      return resortsRef.doc(myId).update({
        contactGroups: groups
      })
    },
    saveContactGroupName ({commit, rootState}, { groupIndex, updatedName }) {
      let groups = rootState.contactGroups.slice()
      groups[groupIndex].section = updatedName
      resortsRef.doc(myId).update({
        contactGroups: groups
      })
    },
    deleteContactGroup ({rootState}, groupIndex) {
      let groups = rootState.contactGroups.slice()
      groups.splice(groupIndex, 1)
      return resortsRef.doc(myId).update({
        contactGroups: groups
      })
    },
    saveContactGroupList ({commit, rootState}, { updatedList }) {
      resortsRef.doc(myId).update({
        contactGroups: updatedList
      })
    },
    saveContact ({commit, rootState}, payload) {
      let groups = rootState.contactGroups.slice()
      if (payload.contactIndex === -1) {
        // new contact
        groups[payload.groupIndex].list.push(payload.updatedContact)
      } else {
        // existing contact
        groups[payload.groupIndex].list[payload.contactIndex] = payload.updatedContact
      }
      resortsRef.doc(myId).update({
        contactGroups: groups
      })
    },
    deleteContact ({commit, rootState}, { groupIndex, contactIndex}) {
      let groups = rootState.contactGroups.slice()
      groups[groupIndex].list.splice(contactIndex, 1)
      return resortsRef.doc(myId).update({
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