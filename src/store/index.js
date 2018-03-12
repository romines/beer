import Vue from 'vue'
import Vuex from 'vuex'
import Firebase from 'firebase/app'
import 'babel-polyfill'
import jHContacts from '../assets/JH_contacts.json'
import rLContacts from '../assets/RL_contacts.json'
console.log(rLContacts);
// import contactSpec from '../assets/ContactSpec_rev_2-28.json'
// console.log({contactSpec, jHContacts});


Vue.use(Vuex)

const state = {
  user: {},
  db: {},
  resortsRef: {},
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


export default new Vuex.Store({
  state,
  mutations: {
    'SET_FB_REFS' (state, db) {
      console.log('setting FB_REFS . . .');
      state.db = db
      state.resortsRef = db.collection('resorts')
    },
    'SET_USER' (state, user) {
      state.user = user
    },
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

    listen ({ rootState, commit }, user) {
      console.log('listen dispatched . . .');
      rootState.db.collection('users').doc(user.uid).get().then(doc => {
        const userData = doc.data()
        user.authorizedResortIds = userData.authorizedResortIds
        commit('SET_USER', user)
        return rootState.resortsRef.doc(userData.authorizedResortIds[0]) // Note hardcoded to first resortId in list
          .onSnapshot(doc => commit('SET_CONTACT_GROUPS', doc.data()))
      })

    },
    logOut ({ commit }) {
      Firebase.auth()
      .signOut()
      .then(() => {
        commit('SET_USER', {})
      });
    },
    createUser ({ rootState, commit }, { email, password, resortId }) {
      let firebaseUser
      return Firebase.auth()
        .createUserWithEmailAndPassword(email, password)
        .then( user => {
          firebaseUser = user
          firebaseUser.authorizedResortIds = [resortId]
          return rootState.db.collection('users').doc(user.uid).set({authorizedResortIds: [resortId]})
      }, error => { alert(error.message) })
        .then(() => {
          commit('SET_USER', firebaseUser)
        })

    },
    // seed ({ rootState }) {

    //   rootState.resortsRef.doc('amFja3Nvbl9ob2xl').set({name: 'Jackson Hole', contactGroups: jHContacts.contactGroups, keys: jHContacts.keys, resortId: 'jackson_hole'})
    // },
    saveNewEmptyGroup ({rootState}, groupName) {
      let groups = rootState.contactGroups.slice()
      groups.push({
        section: groupName,
        list: []
      })
      return rootState.db.collection('resorts').doc(rootState.user.authorizedResortIds[0]).update({
        contactGroups: groups
      })
    },
    saveContactGroupName ({ rootState }, { groupIndex, updatedName }) {
      let groups = rootState.contactGroups.slice()
      groups[groupIndex].section = updatedName
      rootState.resortsRef.doc(rootState.user.authorizedResortIds[0]).update({
        contactGroups: groups
      })
    },
    deleteContactGroup ({ rootState }, groupIndex) {

      let groups = rootState.contactGroups.slice()
      groups.splice(groupIndex, 1)
      return rootState.resortsRef.doc(rootState.user.authorizedResortIds[0]).update({
        contactGroups: groups
      })
    },
    saveContactGroupList ({ rootState }, { updatedList }) {
      rootState.resortsRef.doc(rootState.user.authorizedResortIds[0]).update({
        contactGroups: updatedList
      })
    },
    saveContact ({ rootState }, payload) {
      let groups = rootState.contactGroups.slice()
      if (payload.contactIndex === -1) {
        // new contact
        groups[payload.groupIndex].list.push(payload.updatedContact)
      } else {
        // existing contact
        groups[payload.groupIndex].list[payload.contactIndex] = payload.updatedContact
      }
      rootState.resortsRef.doc(rootState.user.authorizedResortIds[0]).update({
        contactGroups: groups
      })
    },
    deleteContact ({ rootState }, { groupIndex, contactIndex}) {
      let groups = rootState.contactGroups.slice()
      groups[groupIndex].list.splice(contactIndex, 1)
      return rootState.resortsRef.doc(rootState.user.authorizedResortIds[0]).update({
        contactGroups: groups
      })
    },
    saveContactList ({ rootState }, payload) {
      let groups = rootState.contactGroups.slice()
      groups[payload.groupIndex].list = payload.updatedList
      rootState.resortsRef.doc(rootState.user.authorizedResortIds[0]).update({
        contactGroups: groups
      })
    },


  },
  modules: {
  }
})