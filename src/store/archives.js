import firebase from '../firebaseInit.js'
import moment from 'moment'

export default {
  state: {
    publishedContactsKey: '',
    publishedContacts: {},
    archiveList: {},
  },
  mutations: {
    'SET_PUBLISHED_CONTACTS' (state, {key, publishedContacts}) {
      console.log('SET_PUBLISHED_CONTACTS . . .');
      state.publishedContactsKey = key
      state.publishedContacts = publishedContacts
    },
    'SET_ARCHIVE_LIST' (state, archives) {
      state.archiveList = archives
    },
  },
  actions: {

    listenToPublishedContacts ({ rootState, commit }) {

      console.log('listen[ing]ToPublished . . .');
      const resortRef = firebase.database().ref(rootState.resortId)

      return new Promise((resolve, reject) => {

        resortRef.child('published').on('value', snap => {
          const key = snap.val()

          resortRef.child(`archiveData/${key}`).on('value', snap => {
            commit('SET_PUBLISHED_CONTACTS', {key, publishedContacts: snap.val()})
            resolve()
          })
        })

      })

    },
    listenToArchiveList ({ rootState, commit }) {
      return new Promise((resolve, reject) => {
        firebase.database().ref(`${rootState.resortId}/archiveList`).on('value', snap => {
          commit('SET_ARCHIVE_LIST', snap.val())
          resolve()
        })

      })
    },
    archive ({ rootState }, { name, description, publish }) {
      const resortRoot = firebase.database().ref(rootState.resortId)
      const archiveListRef = resortRoot.child('archiveList').push()
      const archiveKey = archiveListRef.key
      const now = moment()
      const archiveName = name ? name : now.format('llll')

      let updates = {}
      updates[`/archiveList/${archiveKey}`] = {
        date: now.valueOf(),
        name: archiveName,
        description
      }
      updates[`/archiveData/${archiveKey}`] = {
        contactGroups: rootState.contactGroups,
        emergencyGroup: rootState.emergencyGroup
      }
      if (publish) updates['published'] = archiveKey

      return resortRoot.update(updates)

    },
    archiveFromPasted ({ rootState }, { resortId, contactGroups, emergencyGroup }) {
      const resortRoot = firebase.database().ref(resortId)
      const archiveListRef = resortRoot.child('archiveList').push()
      const archiveKey = archiveListRef.key

      let updates = {}
      updates[`/archiveList/${archiveKey}`] = {
        date: moment().valueOf(),
        name: 'Initial data at resort creation',
        description: ''
      }
      updates[`/archiveData/${archiveKey}`] = { contactGroups, emergencyGroup }
      updates['published'] = archiveKey

      return resortRoot.update(updates)

    },
    deleteArchive ({ rootState }, archiveKey) {
      const resortRoot = firebase.database().ref(rootState.resortId)
      let updates = {}
      updates[`/archiveList/${archiveKey}`] = null
      updates[`/archiveData/${archiveKey}`] = null
      resortRoot.update(updates)
    },
    toggleArchiveStar ({ rootState }, { key, starred }) {
      firebase.database().ref(`${rootState.resortId}/archiveList/${key}/starred/`).set(!starred)
    },
    saveArchiveName ({ rootState }, { key, name }) {
      const updates = { name }
      return firebase.database().ref(`${rootState.resortId}/archiveList/${key}`).update(updates)
    },
    restoreArchive ({ rootState, commit }, { key }) {

      const resortRef = firebase.database().ref(rootState.resortId)

      return new Promise((resolve, reject) => {

        resortRef.child(`archiveData/${key}`).on('value', snap => {
          const archiveData = snap.val()

          firebase.firestore().collection('resorts').doc(rootState.resortId).update({
            contactGroups: archiveData.contactGroups,
            emergencyGroup: archiveData.emergencyGroup
          }).then(resolve)
        })

      })
    }

  },

  getters: {
    dirty: (state, getters, rootState) => {
      // if (!state.publishedContacts.contactGroups || !state.publishedContacts.contactGroups.length) return false
      if (!rootState.contactGroups.length) return false
      // console.log(JSON.stringify(state.publishedContacts))
      // console.log(JSON.stringify({
      //   contactGroups: rootState.contactGroups,
      //   emergencyGroup: rootState.emergencyGroup
      // }))
      return JSON.stringify(state.publishedContacts) !== JSON.stringify({
        contactGroups: rootState.contactGroups,
        emergencyGroup: rootState.emergencyGroup
      })
    }
  }
}