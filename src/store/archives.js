import { database, firestore } from '../firebaseInit.js'
import { addMissingContactDefaults } from './utils.js'
import moment from 'moment'
import equal from 'deep-equal'

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
      const resortRef = database.ref(rootState.resortId)

      return new Promise((resolve, reject) => {

        resortRef.child('published').on('value', snap => {
          const key = snap.val()

          resortRef.child(`archiveData/${key}`).once('value', snap => {
            commit('SET_PUBLISHED_CONTACTS', {key, publishedContacts: snap.val()})
            resolve()
          })
        })

      })

    },
    listenToArchiveList ({ rootState, commit }) {
      return new Promise((resolve, reject) => {
        database.ref(`${rootState.resortId}/archiveList`).on('value', snap => {
          commit('SET_ARCHIVE_LIST', snap.val())
          resolve()
        })

      })
    },
    archive ({ rootState }, { name, description, publish }) {
      const resortRoot = database.ref(rootState.resortId)
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

      const length = rootState.contactGroups.filter(group => group.list === undefined).length
      if (length) debugger

      return resortRoot.update(updates)

    },
    archiveFromPasted ({ rootState }, { resortId, contactGroups, emergencyGroup }) {
      const resortRoot = database.ref(resortId)
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
      const resortRoot = database.ref(rootState.resortId)
      let updates = {}
      updates[`/archiveList/${archiveKey}`] = null
      updates[`/archiveData/${archiveKey}`] = null
      return resortRoot.update(updates)
    },
    toggleArchiveStar ({ rootState }, { key, starred }) {
      database.ref(`${rootState.resortId}/archiveList/${key}/starred/`).set(!starred)
    },
    saveArchiveName ({ rootState }, { key, name }) {
      const updates = { name }
      return database.ref(`${rootState.resortId}/archiveList/${key}`).update(updates)
    },
    restoreArchive ({ rootState, commit }, { key }) {

      const resortRef = database.ref(rootState.resortId)

      return new Promise((resolve, reject) => {

        resortRef.child(`archiveData/${key}`).on('value', snap => {
          const archiveData = snap.val()

          firestore.collection('resorts').doc(rootState.resortId).update({
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
      if (Object.keys(state.publishedContacts).length === 0) return false

      const published = {
        contactGroups: state.publishedContacts.contactGroups.map(addMissingContactDefaults),
        emergencyGroup: addMissingContactDefaults(state.publishedContacts.emergencyGroup)
      }
      const working = {
        contactGroups: rootState.contactGroups,
        emergencyGroup: rootState.emergencyGroup
      }

      const different = !equal(working, published)

      // if (different) {
      //   console.log('PUBLISHED: ')
      //   console.log(JSON.stringify(published))
      //   console.log('WORKING: ')
      //   console.log(JSON.stringify(working))
      // }

      return different

    }
  }
}