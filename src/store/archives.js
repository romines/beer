import { database, firestore } from '../firebaseInit.js'
import { standardizeArchive, promiseTo } from './utils.js'
import moment from 'moment'
import equal from 'deep-equal'

export default {
  state: {
    publishedContactsKey: '',
    lastPublished: '',
    publishedContacts: {},
    archiveList: {},
  },
  mutations: {
    SET_PUBLISHED_CONTACTS(state, { key, publishedContacts }) {
      console.log('SET_PUBLISHED_CONTACTS . . .')
      state.publishedContactsKey = key
      state.publishedContacts = publishedContacts
    },
    SET_LAST_PUBLISHED(state, lastPublished) {
      state.lastPublished = lastPublished
    },
    SET_ARCHIVE_LIST(state, archives) {
      state.archiveList = archives
    },
  },
  actions: {
    resetArchiveState({ commit }) {
      commit('SET_PUBLISHED_CONTACTS', {
        key: '',
        publishedContacts: {},
      })
      commit('SET_LAST_PUBLISHED', '')
      commit('SET_ARCHIVE_LIST', {})
    },
    listenToPublishedContacts({ rootState, commit }) {
      console.log('listen[ing]ToPublished . . .')
      const resortRef = database.ref(rootState.currentResort.id)

      return new Promise((resolve, reject) => {
        resortRef.child('published').on('value', snap => {
          const key = snap.val()
          Promise.all([
            resortRef.child(`archiveData/${key}`).once('value'),
            resortRef.child(`archiveList/${key}`).once('value'),
          ])
            .then(([publishedContacts, archiveMeta]) => {
              const lastPublished = archiveMeta.val().date
              commit('SET_PUBLISHED_CONTACTS', {
                key,
                publishedContacts: standardizeArchive(publishedContacts.val()),
              })
              commit('SET_LAST_PUBLISHED', lastPublished)
              resolve()
            })
            .catch(err => reject(err))
        })
      })
    },
    listenToArchiveList({ rootState, commit }) {
      return new Promise((resolve, reject) => {
        database.ref(`${rootState.currentResort.id}/archiveList`).on('value', snap => {
          commit('SET_ARCHIVE_LIST', snap.val())
          resolve()
        })
      })
    },
    archive({ rootState }, { name, description, publish }) {
      const resortRoot = database.ref(rootState.currentResort.id)
      const archiveListRef = resortRoot.child('archiveList').push()
      const archiveKey = archiveListRef.key
      const now = moment()
      const archiveName = name ? name : now.format('llll')

      const updates = {}
      updates[`/archiveList/${archiveKey}`] = {
        date: now.valueOf(),
        name: archiveName,
        description,
      }
      updates[`/archiveData/${archiveKey}`] = {
        contactGroups: rootState.contactGroups,
        emergencyGroup: rootState.emergencyGroup,
      }
      if (publish) updates['published'] = archiveKey

      return resortRoot.update(updates)
    },
    archiveFromPasted({ rootState }, { resortId, contactGroups, emergencyGroup }) {
      const resortRoot = database.ref(resortId)
      const archiveListRef = resortRoot.child('archiveList').push()
      const archiveKey = archiveListRef.key

      const updates = {}
      updates[`/archiveList/${archiveKey}`] = {
        date: moment().valueOf(),
        name: 'Initial data at resort creation',
        description: '',
      }
      updates[`/archiveData/${archiveKey}`] = { contactGroups, emergencyGroup }
      updates['published'] = archiveKey

      return resortRoot.update(updates)
    },
    deleteArchive({ rootState }, archiveKey) {
      const resortRoot = database.ref(rootState.currentResort.id)
      const updates = {}
      updates[`/archiveList/${archiveKey}`] = null
      updates[`/archiveData/${archiveKey}`] = null
      return resortRoot.update(updates)
    },
    toggleArchiveStar({ rootState }, { key, starred }) {
      database.ref(`${rootState.currentResort.id}/archiveList/${key}/starred/`).set(!starred)
    },
    saveArchiveName({ rootState }, { key, name }) {
      const updates = { name }
      return database.ref(`${rootState.currentResort.id}/archiveList/${key}`).update(updates)
    },
    restoreArchive({ rootState }, { key }) {
      const resortRef = database.ref(rootState.currentResort.id)

      return new Promise((resolve, reject) => {
        resortRef.child(`archiveData/${key}`).on('value', snap => {
          const archiveData = snap.val()

          firestore
            .collection('resorts')
            .doc(rootState.currentResort.id)
            .update({
              contactGroups: archiveData.contactGroups,
              emergencyGroup: archiveData.emergencyGroup,
            })
            .then(resolve, reject)
        })
      })
    },
    restoreAndPublish({ rootState, dispatch }, { key }) {
      const resortRoot = database.ref(rootState.currentResort.id)
      const updates = {}
      updates[`/archiveList/${key}/date`] = moment().valueOf()
      updates['published'] = key

      return Promise.all([dispatch('restoreArchive', { key }), resortRoot.update(updates)])
    },
    discardChanges({ state, rootState }) {
      return firestore
        .collection('resorts')
        .doc(rootState.currentResort.id)
        .update(state.publishedContacts)
    },
  },

  getters: {
    dirty: (state, getters, rootState) => {
      if (!rootState.currentResort.id) return false
      if (!(rootState.contactGroups && rootState.contactGroups.length)) return false
      if (Object.keys(state.publishedContacts).length === 0) return false

      const working = standardizeArchive({
        contactGroups: rootState.contactGroups.map(rmDescriptionEditor),
        emergencyGroup: rootState.emergencyGroup,
      })

      const different = !equal(working, state.publishedContacts)

      const workingJson = JSON.parse(JSON.stringify(working.contactGroups))
      const publishedJson = JSON.parse(JSON.stringify(state.publishedContacts.contactGroups))

      const eq1 = equal(workingJson, publishedJson)

      console.log(workingJson)
      console.log(publishedJson)

      console.log(eq1)

      if (different) {
        flatten(state.publishedContacts)
        // console.log('PUBLISHED: ')
        // console.log(JSON.stringify(state.publishedContacts))
        // console.log('WORKING: ')
        // console.log(JSON.stringify(working))
      }

      return !eq1
    },
  },
}

function rmDescriptionEditor(contact) {
  if (contact.descriptionEditor !== undefined) delete contact.descriptionEditor
  return contact
}

function flatten(obj) {

  const results = {};
  let pathSegments = [];

  function doFlatten(obj) {
    Object.keys(obj).forEach((key) => {
      pathSegments.push(key);
      if (typeof obj[key] === 'object') {
        doFlatten(obj[key])
      } else {
        if (!JSON.stringify(obj[key])) {
          console.log('wtf');
          console.log(pathSegments.join('.'))
        }
        results[pathSegments.join('.')] = obj[key];
        pathSegments.pop();
      }
    });
  }
  doFlatten(obj);
  return results;

}
