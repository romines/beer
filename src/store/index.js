import Vue from 'vue'
import Vuex from 'vuex'
import { auth, firestore, storage, database } from '../firebaseInit.js'

import uuid from 'uuid/v4'
import 'babel-polyfill'

import archives from './archives'
import maps from './maps'
import tags from './tags'
import users from './users'
import { addMissingContactDefaults, promiseTo } from './utils.js'
import pwConfig from '../static/pwConfig.js'
import cmsAxios from '../api/vue-axios/axios.js'
import leaderboardConfig from '../leaderboardConfig.js'
import router from '../router'

// import mayExport from '../../utils/firestore-export.json'
// import userData from '../../utils/userData.json'

const RESORTS_REF = firestore.collection('resorts') // is there a better way to call attention to module scoped var

const defaultModalContents = {
  heading: '',
  message: '',
  onConfirm() {},
  onCancel() {},
  buttonLess: false,
  hideCancel: false,
  loading: false,
  classList: []
}

Vue.use(Vuex)

const store = {
  modules: {
    archives,
    maps,
    tags,
    users
  },
  state: {
    resorts: [],
    resortId: '',
    currentResort: {},
    contactsAreDirty: false,
    pushWooshData: {
      appId: '',
      exportSubscribers: {},
      exportSubscribersCityOptions: {},
      preferredCityOptions: [],
      baseDistanceRequestIds: {}
    },
    resortPermissions: {
      // These act as defaults if value is not in Firestore
      canManageWebcams: false,
      canManagePushNotifications: true,
      canManageContacts: false,
      canManageLeaderboard: false
    },
    webcams: [],
    resortMeta: {},
    contactGroups: [],
    emergencyGroup: {},
    loading: true,
    modal: {
      show: false,
      contents: defaultModalContents,
      showLoading: false
    },
    openContactIsDirty: false,
    openGroupIsDirty: false,
    uploadBufferUrl: '',
  },
  mutations: {
    SET_CURRENT_RESORT(state, payload) {
      state.currentResort = payload
    },
    SET_RESORTS(state, resorts) {
      console.log('SET(ing)_RESORTS . . .')
      state.resorts = resorts
    },
    SET_RESORT_META(state, resortMeta) {
      state.resortMeta = resortMeta
    },
    SET_PUSHWOOSH_DATA(state, pushWooshData) {
      Object.keys(pushWooshData).forEach((key) => {
        state.pushWooshData[key] = pushWooshData[key]
      })
    },
    SET_CONTACT_GROUPS(state, { contactGroups, emergencyGroup }) {
      console.log('SET_CONTACT_GROUPS . . .')
      state.contactGroups = contactGroups
      state.emergencyGroup = emergencyGroup
    },
    SHOW_MODAL(state, contents) {
      state.modal.show = true
      state.modal.contents = contents
    },
    CLOSE_MODAL(state) {
      state.modal.show = false
      state.modal.contents = defaultModalContents
    },
    SET_MODAL_LOADING_STATE (state, boolean) {
      state.modal.showLoading = boolean
    },
    SET_LOADING_STATE(state, loading) {
      state.loading = loading
    },
    SET_CONTACT_DIRTY_STATE(state, isDirty) {
      state.openContactIsDirty = isDirty
    },
    SET_UPLOAD_BUFFER_URL(state, val) {
      state.uploadBufferUrl = val
    },
    UPDATE_IMAGE_URL(state, { groupIndex, contactIndex, scaledUrl }) {
      state.contactGroups[groupIndex].list[contactIndex].imageUrl = scaledUrl
    },
    SET_WEBCAMS(state, webcams) {
      state.webcams = webcams
    },
    SET_RESORT_PERMISSIONS(state, permissions) {
      if (permissions) state.resortPermissions = permissions
    },
    SET_CONTACT_GROUP_DIRTY_STATE(state, value) {
      state.contactsAreDirty = value
    }
  },

  actions: {
    authenticateLeaderboard({ commit, dispatch, rootState }) {
      return new Promise((resolve, reject) => {
        let password = leaderboardConfig.auth[rootState.currentResort.id]

        cmsAxios.post('/auth?app_id=' + rootState.currentResort.id + '&auth_id=' + password)
          .then(data => {
            localStorage.leaderboardToken = data.token
            resolve(data)
          }).catch(request => {
            delete localStorage.leaderboardToken
            dispatch('showErrorModal', 'Could not connect to Leaderboard. Please try again later. If problem persists, contact Resorts Tapped.')
            router.push('/')
            reject(request)
          })
      })
    },

    setCurrentResort({ commit, dispatch }, resortId) {
      return new Promise((resolve, reject) => {
        if (!resortId) {
          commit('SET_CURRENT_RESORT', {})
          resolve()
        } else {
          RESORTS_REF.doc(resortId).get().then((doc) => {
            let data = doc.data()
            if (!data.timezone) {
              dispatch('setResortTimezone', resortId).then(() => {
                dispatch('setCurrentResort', resortId)
              })
            } else {
              commit('SET_CURRENT_RESORT', { id: resortId, name: data.name, timezone: data.timezone })
              resolve()
            }
          })
        }
      })
    },

    setResortTimezone({ commit }, resortId) {
      return RESORTS_REF.doc(resortId).update({
        timezone: leaderboardConfig.timezones[resortId],
      })
    },

    getResorts({ commit }) {
      return RESORTS_REF.get().then(snapshot => {
        let resorts = []
        snapshot.forEach(doc => {
          resorts.push(doc.data())
        })
        commit('SET_RESORTS', resorts)
        return Promise.resolve()
      })
    },

    saveNewResort({ dispatch }, resortData) {
      resortData.contactGroups = resortData.contactGroups
        .map(addNoSort)
        .map(addGroupId)
        .map(addMissingContactDefaults)

      resortData.emergencyGroup = addMissingContactDefaults(resortData.emergencyGroup)

      return Promise.all([
        RESORTS_REF.doc(resortData.resortId).set(resortData),
        dispatch('archiveFromPasted', resortData),
      ])
    },

    initializePushWooshData({ rootState, commit, dispatch }) {
      return new Promise((resolve, reject) => {
        RESORTS_REF.doc(rootState.currentResort.id).get().then((doc) => {
          const resortData = doc.data()
          // If there is no PW data object in firestore, create one
          if (!resortData.pushWooshData || !resortData.pushWooshData.appId) {
            console.log('MISSING PW DATA... SETTING...')
            let pushWooshEnv = process.env.NODE_ENV === 'production' ? 'production' : 'staging'
            let pwId = pwConfig[pushWooshEnv][rootState.currentResort.id]
            if (!pwId) console.log('MISSING PW ID IN PWCONFIG FILE. PLEASE SET!')
            rootState.pushWooshData.appId = pwId
            dispatch('updatePushWooshData', rootState.pushWooshData).then(() => {
              resolve()
            })
          } else {
            commit('SET_PUSHWOOSH_DATA', resortData.pushWooshData)
            resolve()
          }
        })
      })
    },

    clearPushWooshData({ rootState, commit }) {
      return new Promise((resolve, reject) => {
        RESORTS_REF.doc(rootState.currentResort.id).update({ pushWooshData: {} }).then((response) => {
          commit('SET_PUSHWOOSH_DATA', {})
          resolve()
        })
      })
    },

    updatePushWooshData({ rootState, commit }, pushWooshData) {
      if (!rootState.currentResort.id) return // quick bug fix
      return new Promise((resolve, reject) => {
        RESORTS_REF.doc(rootState.currentResort.id).update({ pushWooshData: pushWooshData }).then((response) => {
          commit('SET_PUSHWOOSH_DATA', pushWooshData)
          resolve()
        })
      })
    },

    getCurrentResortPermissions({ rootState, commit }) {
      return new Promise((resolve, reject) => {

        if (!rootState.currentResort.id) {
          resolve()
          return
        }

        RESORTS_REF.doc(rootState.currentResort.id).get().then((doc) => {
          const resortData = doc.data()
          commit('SET_RESORT_PERMISSIONS', resortData.resortPermissions)
          resolve()
        }).catch((e) => {
          reject(e)
        })
      })
    },

    updateResortPermissions({ rootState, commit }, permissions) {
      return new Promise((resolve, reject) => {
        RESORTS_REF.doc(rootState.currentResort.id).update({ resortPermissions: permissions }).then((response) => {
          commit('SET_RESORT_PERMISSIONS', permissions)
          resolve()
        })
      })
    },

    createWebcamForResort({ rootState, commit, dispatch }, webcam) {
      let webcams = rootState.webcams
      webcams.push(webcam)

      return new Promise((resolve, reject) => {
        dispatch('saveResortWebcams', webcams).then(() => resolve(webcam)).catch((error) => reject(error))
      })
    },

    saveResortWebcams({ rootState, commit }, webcams) {
      return new Promise((resolve, reject) => {
        commit('SET_WEBCAMS', webcams)
        firestore
          .collection('resorts')
          .doc(rootState.currentResort.id)
          .update({
            webcams: webcams,
          })
          .then(() => {
            resolve()
          })
          .catch(error => {
            // The document probably doesn't exist.
            reject(error)
          })
      })
    },

    getResortWebcams({ rootState, commit }) {
      return new Promise((resolve, reject) => {
        RESORTS_REF.doc(rootState.currentResort.id).get().then((doc) => {
          if (!doc.data().webcams) {
            RESORTS_REF.doc(rootState.currentResort.id).update({ webcams: [] }).then((response) => {
              commit('SET_WEBCAMS', [])
              resolve()
            })
          } else {
            commit('SET_WEBCAMS', doc.data().webcams)
            resolve()
          }
        })
      })
    },

    setContactGroupDirtyState({ rootState, commit }, value) {
      return new Promise((resolve, reject) => {
        RESORTS_REF.doc(rootState.currentResort.id).update({
          contactsAreDirty: value
        }).then(() => {
          commit('SET_CONTACT_GROUP_DIRTY_STATE', value)
          resolve()
        }).catch(() => {
          reject()
        })
      })
    },

    listenToResortRoot({ rootState, commit }) {
      console.log('listen[ing]ToResortRoot . . .')

      return new Promise((resolve, reject) => {
        RESORTS_REF.doc(rootState.currentResort.id).onSnapshot(
          doc => {
            const resortData = doc.data()

            commit('SET_CONTACT_GROUPS', resortData)
            commit('SET_CONTACT_GROUP_DIRTY_STATE', resortData.contactsAreDirty)
            commit('SET_RESORT_META', {
              country: resortData.country,
              mapFiles: resortData.mapFiles, // TODO: remove
              maps: resortData.maps,
              name: resortData.name,

            })
            commit('SET_TAGS', resortData.availableTags, { root: true })
            if (resortData.maps) commit('SET_MAPS', resortData.maps.map(forceIntId), { root: true })
            resolve()
          },
          err => reject(`Error listening to contacts: ${err}`)
        )
      })
    },

    setLastPublishedDate({ commit, dispatch, rootState }, date) {
      // 2020-05-09 11:51:25
      return RESORTS_REF.doc(rootState.currentResort.id).update({
        lastPublishedDate: date,
      })
    },

    resetResortState({ commit, dispatch }) {
      dispatch('setCurrentResort', null)
      commit('SET_CONTACT_GROUPS', {})
      commit('SET_RESORT_META', {})
      commit('SET_PUSHWOOSH_DATA', {})
      dispatch('resetArchiveState')
    },

    logIn({ commit, dispatch }, { email, password, onSuccess }) {
      return auth.signInWithEmailAndPassword(email, password).then(onSuccess, error => {
        commit('SET_LOADING_STATE', false)
        dispatch('showErrorModal', error.message)
      })
    },

    logOut({ commit, dispatch }) {
      return new Promise((resolve, reject) => {
        auth.signOut().then(() => {
          dispatch('setCurrentResort', null)
          commit('SET_CONTACT_GROUPS', {})
          dispatch('clearCurrentUser')
          delete localStorage.leaderboardToken
          resolve()
        })
      })
    },

    async triggerPasswordResetEmail({ commit, dispatch }, { email }) {
      const [triggerError] = await promiseTo(auth.sendPasswordResetEmail(email))

      if (triggerError) {
        commit('SET_LOADING_STATE', false)
        return dispatch('showErrorModal', triggerError.message)
      }

      return { successfulEmailTrigger: true }
    },

    saveNewEmptyGroup({ rootState }, groupName) {
      let groups = rootState.contactGroups.slice()
      const groupId = uuid()

      groups.push({
        section: groupName,
        list: [],
        id: groupId,
      })

      return new Promise((resolve, reject) => {
        firestore
          .collection('resorts')
          .doc(rootState.currentResort.id)
          .update({
            contactGroups: groups,
            contactsAreDirty: true
          })
          .then(() => {
            resolve(groupId)
          })
          .catch(error => {
            // The document probably doesn't exist.
            reject(error)
          })
      })
    },

    saveContactGroupName({ rootState }, { groupIndex, updatedName }) {
      let groups = rootState.contactGroups.slice()
      groups[groupIndex].section = updatedName
      RESORTS_REF.doc(rootState.currentResort.id).update({
        contactGroups: groups,
        contactsAreDirty: true
      })
    },

    saveEmergencyContactGroup({ rootState }, updatedEmergencyGroup) {
      // const groupIndex = rootState.contactGroups.findIndex(group => group.id === updatedEmergencyGroup.id)

      // let groups = rootState.contactGroups.slice()

      // groups[groupIndex] = updatedEmergencyGroup
      RESORTS_REF.doc(rootState.currentResort.id).update({
        emergencyGroup: updatedEmergencyGroup,
        contactsAreDirty: true
      })
    },

    deleteContactGroup({ rootState }, groupIndex) {
      let groups = rootState.contactGroups.slice()
      groups.splice(groupIndex, 1)
      return RESORTS_REF.doc(rootState.currentResort.id).update({
        contactGroups: groups,
        contactsAreDirty: true
      })
    },

    saveContactGroupList({ rootState }, { updatedList }) {
      // currently unused, but could DRY out contact mutation methods below
      return RESORTS_REF.doc(rootState.currentResort.id).update({
        contactGroups: updatedList,
        contactsAreDirty: true
      })
    },

    toggleSortable({ rootState }, groupIndex) {
      let groups = rootState.contactGroups.slice()
      groups[groupIndex].noSort = !rootState.contactGroups[groupIndex].noSort
      RESORTS_REF.doc(rootState.currentResort.id).update({
        contactGroups: groups,
      })
    },

    saveContact({ rootState, commit }, { groupId, updatedContact }) {
      const groupIndex = rootState.contactGroups.findIndex(group => group.id === groupId)
      const contactIndex = rootState.contactGroups[groupIndex].list.findIndex(
        contact => contact.id === updatedContact.id
      )
      let groups = rootState.contactGroups.slice()
      updatedContact.imageUrl = rootState.uploadBufferUrl
        ? rootState.uploadBufferUrl
        : updatedContact.imageUrl
      if (contactIndex === -1) {
        // new contact
        groups[groupIndex].list.push(updatedContact)
      } else {
        // existing contact
        groups[groupIndex].list[contactIndex] = updatedContact
      }
      return RESORTS_REF.doc(rootState.currentResort.id)
        .update({
          contactGroups: groups,
          contactsAreDirty: true
        })
        .then(() => {
          commit('SET_UPLOAD_BUFFER_URL', '')
        })
    },

    deleteContact({ rootState, dispatch }, { groupIndex, contactId }) {
      const contactIndex = rootState.contactGroups[groupIndex].list.findIndex(
        contact => contact.id === contactId
      )
      let groups = rootState.contactGroups.slice()
      const contact = groups[groupIndex].list.splice(contactIndex, 1)[0]

      if (!contact.imageUrl) {
        return RESORTS_REF.doc(rootState.currentResort.id).update({
          contactGroups: groups,
          contactsAreDirty: true
        })
      } else {
        return RESORTS_REF.doc(rootState.currentResort.id)
          .update({
            contactGroups: groups,
            contactsAreDirty: true
          })
          .then(() => {
            return dispatch('destroyImageFile', contact.imageUrl)
          })
      }
    },

    duplicateContact({ rootState }, { groupId, contactId }) {
      const groupIndex = rootState.contactGroups.findIndex(group => group.id === groupId)
      const contactIndex = rootState.contactGroups[groupIndex].list.findIndex(
        contact => contact.id === contactId
      )

      const groups = rootState.contactGroups.slice()
      const contactToCopy = rootState.contactGroups[groupIndex].list[contactIndex]
      const id = uuid()

      const newContact = {
        ...contactToCopy,
        name: contactToCopy.name + ' (copy)',
        id,
      }
      groups[groupIndex].list.splice(contactIndex + 1, 0, newContact)

      return new Promise((resolve, reject) => {
        RESORTS_REF.doc(rootState.currentResort.id)
          .update({
            contactGroups: groups,
            contactsAreDirty: true
          })
          .then(() => {
            resolve(newContact)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // eslint-disable-next-line
    toggleOpenContactTag({}, { updatedContact }) {
      // special case. action is dispatched by ContactList and listened to by EditContact.
      // allows mutation of currently open contact's local state, overriding default list
      // level tag toggle behavior, which is to save new state of tags directly
    },

    saveContactList({ rootState }, { groupId, updatedList }) {
      // Used by <draggable /> in ContactList for contact re-ordering
      const groupIndex = rootState.contactGroups.findIndex(group => group.id === groupId)
      const groups = rootState.contactGroups.slice()
      groups[groupIndex].list = updatedList
      RESORTS_REF.doc(rootState.currentResort.id).update({
        contactGroups: groups,
        contactsAreDirty: true
      })
    },

    destroyImageFile({ rootState, commit }, url) {
      const additionalReferencesExist = rootState.contactGroups.some(group => {
        return group.list.some(contact => contact.imageUrl === url)
      })

      if (additionalReferencesExist) {
        return console.log('File was not deleted because additional references to it were found')
      }

      const refToDestroy = storage.refFromURL(url)
      if (!refToDestroy) {
        return console.log('hey! empty ref cannot be destroyed!')
      }
      return refToDestroy
        .delete()
        .then(() => {
          console.log('File deleted successfully')
          commit('SET_UPLOAD_BUFFER_URL', '')
        })
        .catch(error => {
          console.log(error.message)
        })
    },

    listenForScaledImage({ rootState, commit }, { fileName, url }) {
      console.log('Listening for scaled image . . .')
      RESORTS_REF.doc(rootState.currentResort.id)
        .collection('scaledImages')
        .doc(fileName.split('.')[0])
        .onSnapshot(() => {
          // if (!doc.data()) return
          console.log(`scaled image ready: scaled_${fileName.split('.')[0]}.png`)

          const scaledUrl = url.replace(fileName, `scaled_${fileName.split('.')[0]}.png`)

          if (rootState.uploadBufferUrl && rootState.uploadBufferUrl === url) {
            // image has been uploaded, but contact has not been saved
            console.log('setting upload buffer url to newly scaled image')
            commit('SET_UPLOAD_BUFFER_URL', scaledUrl)
          } else {
            // use .some to break loop as soon as we find the Contact Group and Contact whose url needs updating
            rootState.contactGroups.some((group, groupIndex) => {
              return group.list.some((contact, contactIndex) => {
                if (contact.imageUrl === url) {
                  console.log(
                    `setting ${rootState.contactGroups[groupIndex].section} > ${
                      rootState.contactGroups[groupIndex].list[contactIndex].name
                    } imageUrl to that of newly scaled image . . .`
                  )
                  commit('UPDATE_IMAGE_URL', {
                    groupIndex,
                    contactIndex,
                    scaledUrl,
                  })
                  return true
                }
              })
            })
          }
        })
    },

    showModal({ commit, rootState }, contents) {
      // feel free to commit 'SHOW_MODAL' directly, however this action provides a default onConfirm
      const mergedContents = {
        ...rootState.modal.contents,
        onConfirm() {
          console.log('default onConfirm . . .')
          commit('CLOSE_MODAL')
        },
        onCancel() {
          commit('CLOSE_MODAL')
        },
        message: '',
        ...contents,
      }
      commit('SHOW_MODAL', mergedContents)
    },

    showErrorModal({ commit }, message) {
      commit('SHOW_MODAL', {
        heading: 'An error has occurred!',
        message,
        cancelButtonLabel: 'OK',
        classList: ['error'],
      })
    },

    showSuccessModal({ commit }, heading) {
      const closeModal = () => {
        commit('CLOSE_MODAL')
      }
      commit('SHOW_MODAL', {
        heading,
        confirmButtonLabel: 'OK',
        hideCancel: true,
        onConfirm: closeModal,
      })
      setTimeout(closeModal, 5500)
    },

    setModalLoadingState({commit}, boolean) {
      commit('SET_MODAL_LOADING_STATE', boolean)
    }
  },
  getters: {
    modal (state) {
      return state.modal
    },
    modalShowLoading (state) {
      return state.modal.showLoading
    },
    modalContents (state) {
      return state.modal.contents
    },
    modalShow (state) {
      return state.modal.show
    },
    pushWooshData (state) {
      return state.pushWooshData
    },
    webcams (state) {
      return state.webcams
    },
    currentResort (state) {
      return state.currentResort
    },
    resorts (state) {
      return state.resorts
    },
    resortPermissions (state) {
      return state.resortPermissions
    }
  },
}

function addNoSort(group) {
  if (group.noSort === undefined) group.noSort = false
  return group
}

function addGroupId(group) {
  if (group.id === undefined) {
    group.id = uuid()
  }
  return group
}

function forceIntId(map) {
  return {...map, id: parseInt(map.id)}
}

export default new Vuex.Store(store)
