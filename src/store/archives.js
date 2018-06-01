import firebase from '../firebaseInit.js'
import moment from 'moment'

export default {
  state: {
    publishedContactsKey: '',
    publishedContacts: [],
    archives: {},
  },
  mutations: {
    'SET_PUBLISHED_CONTACTS' (state, {key, publishedContacts}) {
      console.log('SET_PUBLISHED_CONTACTS . . .');
      state.publishedContactsKey = key
      state.publishedContacts = publishedContacts
    },
    'SET_ARCHIVE_LIST' (state, archives) {
      state.archives = archives
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
    listenToArchiveList ({ commit }) {
      const resortId = 'jackson_hole' // TEMP
      return new Promise((resolve, reject) => {
        firebase.database().ref(`${resortId}/archives`).on('value', snap => {
          // do we care that that this is an object instead of array?
          // const archives = snap.val()
          commit('SET_ARCHIVE_LIST', snap.val())
          resolve()
        })

      })
    },
    archive ({ rootState }, { name, description, publish }) {
      const resortRoot = firebase.database().ref(rootState.resortId)
      const archiveListRef = resortRoot.child('archives').push()
      const archiveKey = archiveListRef.key
      const now = moment()
      const archiveName = name ? name : now.format('llll')

      let updates = {}
      updates[`/archives/${archiveKey}`] = {
        date: now.valueOf(),
        name: archiveName,
        description
      }
      updates[`/archiveData/${archiveKey}`] = rootState.contactGroups
      if (publish) updates['published'] = archiveKey

      resortRoot.update(updates)

    },
    deleteArchive ({ rootState }, archiveKey) {
      const resortRoot = firebase.database().ref(rootState.resortId)
      let updates = {}
      updates[`/archives/${archiveKey}`] = null
      updates[`/archiveData/${archiveKey}`] = null
      resortRoot.update(updates)
    },
    toggleArchiveStar ({ rootState }, { key, starred }) {
      firebase.database().ref(`${rootState.resortId}/archives/${key}/starred/`).set(!starred)
    },
    saveArchiveName ({ rootState }, { key, name }) {
      const updates = { name }
      return firebase.database().ref(`${rootState.resortId}/archives/${key}`).update(updates)
    },
    restoreArchive ({ rootState, commit }, { key }) {

      const resortRef = firebase.database().ref(rootState.resortId)

      return new Promise((resolve, reject) => {

        resortRef.child(`archiveData/${key}`).on('value', snap => {
          const contactGroups = snap.val()

          firebase.firestore().collection('resorts').doc(rootState.resortId).update({
            contactGroups
          }).then(resolve)
        })

      })
    }

  },

  getters: {
    dirty: (state, getters, rootState) => {
      if (!state.publishedContacts.length) return false
      return JSON.stringify(state.publishedContacts) !== JSON.stringify(rootState.contactGroups)
    }
  }
}