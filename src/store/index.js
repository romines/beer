import Vue from 'vue'
import Vuex from 'vuex'
// import Firebase from 'firebase/app'
import firebase from '../firebaseInit.js'
import moment from 'moment'

import uuid from 'uuid/v4'
import 'babel-polyfill'
import mayExport from '../../utils/firestore-export.json'
import thredbo from '../../utils/thredbo.json'

const RESORTS_REF = firebase.firestore().collection('resorts') // is there a better way to call attention to module scoped var

const SEED_DATA = mayExport.resorts
SEED_DATA.thredbo = thredbo

const defaultModalContents = {
  heading: '',
  message: '',
  onConfirm: () => {return},
  onCancel: () => {return},
  buttonLess: false,
  loading: false,
  classList: []
}

Vue.use(Vuex)

let state = {
  user: {},
  db: {},
  resortsRef: {},
  resorts: [],
  resortId: '',
  resortCountry: '',
  mapFiles: [],
  contactGroups: [],
  archives: {},
  loading: true,
  modal: {
    show: false,
    contents: defaultModalContents
  },
  openContactIsDirty: false,
  openGroupIsDirty: false,
  uploadBufferUrl: ''
}


export default new Vuex.Store({
  state,
  mutations: {
    'SET_RESORT_ID' (state, resortId) {
      state.resortId = resortId
    },
    'SET_RESORTS' (state, resorts) {
      state.resorts = resorts
    },
    'SET_USER' (state, user) {
      state.user = {...user}
    },
    'SET_RESORT_META' (state, { country, mapFiles }) {
      state.resortCountry = country
      state.mapFiles = mapFiles
    },
    'SET_CONTACT_GROUPS' (state, contactGroups) {
      console.log('SET_CONTACT_GROUPS . . .');
      state.contactGroups = contactGroups
    },
    'SET_ARCHIVE_LIST' (state, archives) {
      state.archives = archives
    },
    'SHOW_MODAL' (state, contents) {
      state.modal.show = true
      state.modal.contents = {...contents}
    },
    'CLOSE_MODAL' (state) {
      state.modal.show = false
      state.modal.content = defaultModalContents
    },
    'SET_LOADING_STATE' (state, loading) {

      console.log('SET_LOADING_STATE . . .');

      state.loading = loading
    },
    'SET_CONTACT_DIRTY_STATE' (state, isDirty) {
      state.openContactIsDirty = isDirty
    },
    'SET_UPLOAD_BUFFER_URL' (state, val) {
      state.uploadBufferUrl = val
    },
    'UPDATE_IMAGE_URL' (state, { groupIndex, contactIndex, scaledUrl }) {
      state.contactGroups[groupIndex].list[contactIndex].imageUrl = scaledUrl
    }

  },
  actions: {

    getUserData ({ rootState, commit, dispatch }, user) {
      console.log('getUserData dispatched . . .');

      return firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
        const userData = doc.data()
        user.authorizedResortIds = userData.authorizedResortIds

        commit('SET_RESORT_ID', userData.authorizedResortIds[0])  // Note hardcoded to first resortId in list
        commit('SET_USER', {
          email: user.email,
          uid: user.uid,
          superAdmin: !!userData.superAdmin,
          authorizedResortIds: userData.authorizedResortIds
        })

      })
    },
    getResorts ({ commit }) {
      return RESORTS_REF.get().then(snapshot => {
        let resorts = []
        snapshot.forEach(doc => {
          resorts.push(doc.data())
        })
        commit('SET_RESORTS', resorts)
      })
    },
    listenToContacts ({ rootState, commit }) {

      console.log('listen[ing]ToContacts . . .');

      return new Promise((resolve, reject) => {
        RESORTS_REF.doc(rootState.resortId)
          .onSnapshot(doc => {
            let resortData = doc.data()
            commit('SET_CONTACT_GROUPS', resortData.contactGroups)
            // commit('SET_RESORT_COUNTRY', resortData.country)
            commit('SET_RESORT_META', { country: resortData.country, mapFiles: resortData.mapFiles })
            resolve()
          }, (err) => reject(`Error listening to contacts: ${err}`))

      })


    },
    logIn ({ commit, dispatch }, { email, password, onSuccess }) {
      return firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then(onSuccess, error => {
          commit('SET_LOADING_STATE', false)

          dispatch('showErrorModal', error.message)
        })
    },
    logOut ({ commit }) {
      firebase.auth()
      .signOut()
      .then(() => {
        commit('SET_USER', {})
        commit('SET_CONTACT_GROUPS', [])
      });
    },
    createUser ({ rootState, commit, dispatch }, { email, password, resortId, onSuccess }) {
      let firebaseUser
      return firebase.auth()
        .createUserWithEmailAndPassword(email, password)
        .then( user => {
          firebaseUser = user
          firebaseUser.authorizedResortIds = [resortId]
          return firebase.firestore().collection('users').doc(firebaseUser.uid).set({
            authorizedResortIds: [resortId],
            email
          })
      }).then(() => {
          commit('SET_USER', firebaseUser)
          onSuccess()
        }, error => {
          commit('SET_LOADING_STATE', false)

          dispatch('showErrorModal', error.message)
        })

    },
    seed ({ rootState }) {
      const addMapIndexUuidAndHttp = (contact) => {
        if (contact.id === undefined) contact.id = uuid()
        if (contact.mapId === undefined) contact.mapId = 0
        if (contact.name === 'Emergency' || contact.name === ' Ski Patrol (Emergency)') contact.emergency = true;
        ['url', 'menu', 'reservations'].forEach(urlField => {
          if (contact[urlField] && contact[urlField].startsWith('www')) {
            contact[urlField] = 'http://' + contact[urlField]
          }
        })
        return contact
      }
      const replaceNumberSpaces = (contact) => {
        contact.number = contact.number.replace(/ /g,'-')
        return contact
      }
      const addContactIdsAndFormatPhoneNumbers = (group) => {
        group.list = group.list.map(addMapIndexUuidAndHttp).map(replaceNumberSpaces)
        return group
      }
      const addNoSort = group => {
        if (group.noSort === undefined) group.noSort = false
        return group
      }
      // SEED_DATA is imported from json file

      const resortId = rootState.resortId
      if (!SEED_DATA[resortId].contactGroups || !Object.keys(SEED_DATA[resortId].contactGroups).length) {
        return console.log(`No resort data found for ${resortId}!`)
      } else {
        console.log(`updating contact for ${resortId} . . .`);
        RESORTS_REF.doc(resortId).update({ contactGroups: SEED_DATA[resortId].contactGroups
          .map(addNoSort)
          .map(addContactIdsAndFormatPhoneNumbers)
        })
      }

    },
    archive ({ rootState }, { name, description }) {
      const resortRoot = firebase.database().ref(rootState.resortId)
      const archiveListRef = resortRoot.child('archives').push()
      const archiveKey = archiveListRef.key
      const now = moment()
      const archiveName = name ? name : now.format('llll')

      let updates = {};
      updates[`/archives/${archiveKey}`] = {
        date: now.valueOf(),
        name: archiveName,
        description
      }
      updates[`/archiveData/${archiveKey}`] = rootState.contactGroups
      resortRoot.update(updates)
    },
    listenToArchiveList ({ rootState, commit }) {
      const resortId = 'jackson_hole' // TEMP
      firebase.database().ref(`${resortId}/archives`).on('value', snap => {
        // do we care that that this is an object instead of array?
        // const archives = snap.val()
        commit('SET_ARCHIVE_LIST', snap.val())
      })
    },
    saveNewEmptyGroup ({ rootState }, groupName) {
      let groups = rootState.contactGroups.slice()
      groups.push({
        section: groupName,
        list: []
      })
      return firebase.firestore().collection('resorts').doc(rootState.resortId).update({
        contactGroups: groups
      })
    },
    saveContactGroupName ({ rootState }, { groupIndex, updatedName }) {
      let groups = rootState.contactGroups.slice()
      groups[groupIndex].section = updatedName
      RESORTS_REF.doc(rootState.resortId).update({
        contactGroups: groups
      })
    },
    deleteContactGroup ({ rootState }, groupIndex) {
      let groups = rootState.contactGroups.slice()
      groups.splice(groupIndex, 1)
      return RESORTS_REF.doc(rootState.resortId).update({
        contactGroups: groups
      })
    },
    saveContactGroupList ({ rootState }, { updatedList }) {
      return RESORTS_REF.doc(rootState.resortId).update({
        contactGroups: updatedList
      })
    },
    toggleSortable ({ rootState }, groupIndex) {
      let groups = rootState.contactGroups.slice()
      groups[groupIndex].noSort = !rootState.contactGroups[groupIndex].noSort
      RESORTS_REF.doc(rootState.resortId).update({
        contactGroups: groups
      })
    },

    saveContact ({ rootState, commit }, { groupIndex, updatedContact}) {
      const contactIndex = rootState.contactGroups[groupIndex].list.findIndex(contact => contact.id === updatedContact.id)
      let groups = rootState.contactGroups.slice()
      updatedContact.imageUrl = rootState.uploadBufferUrl ? rootState.uploadBufferUrl : updatedContact.imageUrl
      if (contactIndex === -1) {
        // new contact
        groups[groupIndex].list.push(updatedContact)
      } else {
        // existing contact
        groups[groupIndex].list[contactIndex] = updatedContact
      }
      return RESORTS_REF.doc(rootState.resortId).update({
        contactGroups: groups
      }).then(() => { commit('SET_UPLOAD_BUFFER_URL', '')})
    },
    deleteContact ({ rootState, dispatch }, { groupIndex, contactId }) {

      const contactIndex = rootState.contactGroups[groupIndex].list.findIndex(contact => contact.id === contactId)
      let groups = rootState.contactGroups.slice()
      const contact = groups[groupIndex].list.splice(contactIndex, 1)[0]

      if (!contact.imageUrl) {
        return RESORTS_REF.doc(rootState.resortId).update({
          contactGroups: groups
        })
      } else {
        return RESORTS_REF.doc(rootState.resortId).update({
          contactGroups: groups
        }).then(() => { return dispatch('destroyImageFile', contact.imageUrl) })
      }
    },

    saveContactList ({ rootState }, payload) {
      let groups = rootState.contactGroups.slice()
      groups[payload.groupIndex].list = payload.updatedList
      RESORTS_REF.doc(rootState.resortId).update({
        contactGroups: groups
      })
    },
    destroyImageFile ({ rootState, commit }, url) {
      const refToDestroy = firebase.storage().refFromURL(url)
      if (!refToDestroy) { console.log('hey! empty ref cannot be destroyed!'); return; }
      return refToDestroy.delete().then(() => {
        console.log('File deleted successfully')
        commit('SET_UPLOAD_BUFFER_URL', '')
      }).catch(error => {
        console.log(error.message);
      })
    },
    listenForScaledImage ({ rootState, commit }, { fileName, url }) {
      console.log('Listening for scaled image . . .');
      RESORTS_REF.doc(rootState.resortId).collection('scaledImages').doc(fileName.split('.')[0]).onSnapshot(doc => {
        if (!doc.data()) return
        const scaledUrl = url.replace(fileName, `scaled_${fileName.split('.')[0]}.png`)

        if (rootState.uploadBufferUrl && (rootState.uploadBufferUrl === url)) {
          // image has been uploaded, but contact has not been saved
          console.log('setting upload buffer url to newly scaled image');
          commit('SET_UPLOAD_BUFFER_URL', scaledUrl)
        } else {
          // use .some to break loop as soon as we find the Contact Group and Contact whose url needs updating
          rootState.contactGroups.some((group, groupIndex) => {
            return group.list.some((contact, contactIndex) => {
              if (contact.imageUrl === url) {
                console.log(`setting ${rootState.contactGroups[groupIndex].section} > ${rootState.contactGroups[groupIndex].list[contactIndex].name} imageUrl to that of newly scaled image . . .`);
                commit('UPDATE_IMAGE_URL', { groupIndex, contactIndex, scaledUrl })
                return true
              }
            })
          })
        }
      })
    },
    showErrorModal ({ commit }, message) {
      commit('SHOW_MODAL', {
        heading: 'An error has occurred!',
        message,
        cancelButtonLabel: 'OK',
        classList: ['error']
      })
    }


  },
  modules: {
  }
})