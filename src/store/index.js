import Vue from 'vue'
import Vuex from 'vuex'
import {
  auth,
  firestore,
  storage,
  database
} from '../firebaseInit.js'

import uuid from 'uuid/v4'
import 'babel-polyfill'

import archives from './archives'
import { addMissingContactDefaults } from './utils.js'

import mayExport from '../../utils/firestore-export.json'
// import userData from '../../utils/userData.json'
let lastResortData

const RESORTS_REF = firestore.collection('resorts') // is there a better way to call attention to module scoped var

const SEED_DATA = mayExport.resorts
// const USER_DATA = userData.users
const defaultModalContents = {
  heading: '',
  message: '',
  onConfirm() { },
  onCancel() { },
  buttonLess: false,
  hideCancel: false,
  loading: false,
  classList: []
}

Vue.use(Vuex)

const store = {
  state: {
    user: {},
    resorts: [],
    resortId: '',
    resortMeta: {},
    contactGroups: [],
    emergencyGroup: {},
    loading: true,
    modal: {
      show: false,
      contents: defaultModalContents
    },
    openContactIsDirty: false,
    openGroupIsDirty: false,
    uploadBufferUrl: ''
  },
  mutations: {
    'SET_RESORT_ID' (state, resortId) {
      state.resortId = resortId
    },
    'SET_RESORTS' (state, resorts) {
      console.log('SET(ing)_RESORTS . . .')
      state.resorts = resorts
    },
    'SET_USER' (state, user) {
      state.user = {...user}
    },
    'SET_RESORT_META' (state, resortMeta) {
      state.resortMeta = resortMeta
    },
    'SET_CONTACT_GROUPS' (state, { contactGroups, emergencyGroup }) {
      console.log('SET_CONTACT_GROUPS . . .')
      state.contactGroups = contactGroups
      state.emergencyGroup = emergencyGroup
    },
    'SHOW_MODAL' (state, contents) {
      state.modal.show = true
      state.modal.contents = contents
    },
    'CLOSE_MODAL' (state) {
      state.modal.show = false
      state.modal.content = defaultModalContents
    },
    'SET_LOADING_STATE' (state, loading) {

      console.log('SET_LOADING_STATE . . .')

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
      console.log('getUserData dispatched . . .')

      return firestore.collection('users').doc(user.uid).get().then(doc => {
        const userData = doc.data()
        user.authorizedResortIds = userData.authorizedResortIds

        // if not superAdmin set resortId here to first (only) resortId in authorized list
        if (!userData.superAdmin) commit('SET_RESORT_ID', userData.authorizedResortIds[0])

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
    saveNewResort ({ commit, dispatch }, resortData) {

      resortData.contactGroups = resortData.contactGroups
        .map(addNoSort)
        .map(addGroupId)
        .map(addMissingContactDefaults)

      resortData.emergencyGroup = addMissingContactDefaults(resortData.emergencyGroup)

      return Promise.all([
        RESORTS_REF.doc(resortData.resortId).set(resortData),
        dispatch('archiveFromPasted', resortData)
      ])
    },
    listenToContacts ({ rootState, commit }) {

      console.log('listen[ing]ToContacts . . .')

      return new Promise((resolve, reject) => {
        RESORTS_REF.doc(rootState.resortId)
          .onSnapshot(doc => {

            const resortData = doc.data()

            // In event of a structural change to the model, standardize/sanitize here
            // TEMP

            // resortData.contactGroups = resortData.contactGroups
            //   .map(addNoSort)
            //   .map(addGroupId)
            //   .map(addMissingContactDefaults)

            // if (!resortData.emergencyGroup) {
            //   const index = resortData.contactGroups.findIndex(group => group.emergency)
            //   if (index > -1) { resortData.emergencyGroup = resortData.contactGroups.splice(index, 1)[0] }
            //   else            { console.log('WARNING: no emergency group found!!!!') }
            // }

            // resortData.emergencyGroup = addMissingContactDefaults(resortData.emergencyGroup)

            // End TEMP

            commit('SET_CONTACT_GROUPS', resortData)
            commit('SET_RESORT_META', {
              country: resortData.country,
              mapFiles: resortData.mapFiles,
              name: resortData.name
            })
            resolve()
          }, (err) => reject(`Error listening to contacts: ${err}`))

      })


    },

    logIn ({ commit, dispatch }, { email, password, onSuccess }) {
      return auth
        .signInWithEmailAndPassword(email, password)
        .then(onSuccess, error => {
          commit('SET_LOADING_STATE', false)
          dispatch('showErrorModal', error.message)
        })
    },
    logOut ({ commit }) {
      auth.signOut()
      .then(() => {
        commit('SET_RESORT_ID', '')
        commit('SET_USER', {})
        commit('SET_CONTACT_GROUPS', {})
      })
    },
    createUser ({ rootState, commit, dispatch }, { email, password, resortId, onSuccess }) {
      let firebaseUser
      return auth
        .createUserWithEmailAndPassword(email, password)
        .then( user => {
          firebaseUser = user
          firebaseUser.authorizedResortIds = [resortId]
          return firestore.collection('users').doc(firebaseUser.uid).set({
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
      // legacy action that allows population of resort data imported from json file. Assumes existence of
      // SEED_DATA global

      const resortId = rootState.resortId

      if (!SEED_DATA[resortId].contactGroups || !Object.keys(SEED_DATA[resortId].contactGroups).length) {
        return console.log(`No resort data found for ${resortId}!`)
      } else {
        console.log(`updating contact for ${resortId} . . .`)
        const tempSeedData = SEED_DATA[resortId]
        tempSeedData.contactGroups = tempSeedData.contactGroups
          .map(addNoSort)
          .map(addGroupId)
          .map(addMissingContactDefaults)

        return RESORTS_REF.doc(resortId).set(tempSeedData)
      }

    },
    seedMeta ({ rootState }) {
      database.ref(rootState.resortId).set(SEED_DATA[rootState.resortId])
    },


    saveNewEmptyGroup ({ rootState }, groupName) {
      let groups = rootState.contactGroups.slice()
      const groupId = uuid()

      groups.push({
        section: groupName,
        list: [],
        id: groupId
      })

      return new Promise((resolve, reject) => {

        firestore.collection('resorts').doc(rootState.resortId).update({
          contactGroups: groups
        }).then(() => {
          resolve(groupId)
        }).catch((error) => {
          // The document probably doesn't exist.
          reject(error)
        })
      })

    },
    saveContactGroupName ({ rootState }, { groupIndex, updatedName }) {
      let groups = rootState.contactGroups.slice()
      groups[groupIndex].section = updatedName
      RESORTS_REF.doc(rootState.resortId).update({
        contactGroups: groups
      })
    },
    saveEmergencyContactGroup ({ rootState }, updatedEmergencyGroup) {
      // const groupIndex = rootState.contactGroups.findIndex(group => group.id === updatedEmergencyGroup.id)

      // let groups = rootState.contactGroups.slice()

      // groups[groupIndex] = updatedEmergencyGroup
      RESORTS_REF.doc(rootState.resortId).update({
        emergencyGroup: updatedEmergencyGroup
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
      // currently unused, but could DRY out contact mutation methods below
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

    saveContact ({ rootState, commit }, { groupId, updatedContact}) {

      const groupIndex = rootState.contactGroups.findIndex(group => group.id === groupId)
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

    duplicateContact ({ rootState }, { groupId, contactId }) {

      const groupIndex = rootState.contactGroups.findIndex(group => group.id === groupId)
      const contactIndex = rootState.contactGroups[groupIndex].list.findIndex(contact => contact.id === contactId)

      const groups = rootState.contactGroups.slice()
      const contactToCopy = rootState.contactGroups[groupIndex].list[contactIndex]
      const id = uuid()

      const newContact = {
        ...contactToCopy,
        name: contactToCopy.name + ' (copy)',
        id
      }
      groups[groupIndex].list.splice(contactIndex + 1, 0, newContact)




      return new Promise((resolve, reject) => {

        RESORTS_REF.doc(rootState.resortId).update({
          contactGroups: groups
        }).then(() => {
          resolve(id)
        }).catch((error) => {
          reject(error)
        })
      })

    },

    saveContactList ({ rootState }, { groupId, updatedList }) {
      // Used by <draggable /> in ContactList for contact re-ordering
      const groupIndex = rootState.contactGroups.findIndex(group => group.id === groupId)
      const groups = rootState.contactGroups.slice()
      groups[groupIndex].list = updatedList
      RESORTS_REF.doc(rootState.resortId).update({
        contactGroups: groups
      })
    },
    destroyImageFile ({ rootState, commit }, url) {
      const additionalReferencesExist = rootState.contactGroups.some((group) => {
        return group.list.some((contact) => contact.imageUrl === url)
      })

      if (additionalReferencesExist) { return console.log('File was not deleted because additional references to it were found') }

      const refToDestroy = storage.refFromURL(url)
      if (!refToDestroy) { return console.log('hey! empty ref cannot be destroyed!') }
      return refToDestroy.delete().then(() => {
        console.log('File deleted successfully')
        commit('SET_UPLOAD_BUFFER_URL', '')
      }).catch(error => {
        console.log(error.message)
      })
    },
    listenForScaledImage ({ rootState, commit }, { fileName, url }) {
      console.log('Listening for scaled image . . .')
      RESORTS_REF.doc(rootState.resortId).collection('scaledImages').doc(fileName.split('.')[0]).onSnapshot(doc => {
        if (!doc.data()) return
        const scaledUrl = url.replace(fileName, `scaled_${fileName.split('.')[0]}.png`)

        if (rootState.uploadBufferUrl && (rootState.uploadBufferUrl === url)) {
          // image has been uploaded, but contact has not been saved
          console.log('setting upload buffer url to newly scaled image')
          commit('SET_UPLOAD_BUFFER_URL', scaledUrl)
        } else {
          // use .some to break loop as soon as we find the Contact Group and Contact whose url needs updating
          rootState.contactGroups.some((group, groupIndex) => {
            return group.list.some((contact, contactIndex) => {
              if (contact.imageUrl === url) {
                console.log(`setting ${rootState.contactGroups[groupIndex].section} > ${rootState.contactGroups[groupIndex].list[contactIndex].name} imageUrl to that of newly scaled image . . .`)
                commit('UPDATE_IMAGE_URL', { groupIndex, contactIndex, scaledUrl })
                return true
              }
            })
          })
        }
      })
    },
    showModal ({ commit, rootState }, contents) {
      // feel free to commit 'SHOW_MODAL' directly, however this action provides a default onConfirm
      const mergedContents = {
        ...rootState.modal.contents,
        onConfirm() { console.log('default onConfirm . . .'); commit('CLOSE_MODAL') },
        onCancel() { commit('CLOSE_MODAL') },
        message: '',
        ...contents
      }
      commit('SHOW_MODAL', mergedContents)
    },
    showErrorModal ({ commit }, message) {
      commit('SHOW_MODAL', {
        heading: 'An error has occurred!',
        message,
        cancelButtonLabel: 'OK',
        classList: ['error']
      })
    },
    showSuccessModal ({ commit }, message) {

      const closeModal = () => { commit('CLOSE_MODAL') }
      commit('SHOW_MODAL', {
        heading: message,
        confirmButtonLabel: 'OK',
        hideCancel: true,
        onConfirm: closeModal
      })
      setTimeout(closeModal, 5500)

    }


  },
  modules: {
    archives
  }
}

function addNoSort (group) {
  if (group.noSort === undefined) group.noSort = false
  return group
}

function addGroupId (group) {

  if (group.id === undefined) {
    group.id = uuid()
  }
  return group
}

export default new Vuex.Store(store)