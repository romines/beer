  import Vue from 'vue'
  import Vuex from 'vuex'
  import Firebase from 'firebase/app'
  import uuid from 'uuid/v4'
  import 'babel-polyfill'
  import mayExport from '../../utils/firestore-export.json'
  import thredbo from '../../utils/thredbo.json'

  const resortData = mayExport.resorts
  resortData.thredbo = thredbo
  console.log(resortData)
  console.log(thredbo)

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
    resortId: '',
    resortCountry: '',
    mapFiles: [],
    contactGroups: [],
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
      'SET_FB_REFS' (state, firebase) {
        console.log('setting FB_REFS . . .');
        const db = firebase.firestore()
        const storage = firebase.storage()
        state.db = db
        state.resortsRef = db.collection('resorts')
        state.storageRef = storage.ref()
      },
      'SET_RESORT_ID' (state, resortId) {
        state.resortId = resortId
      },
      'SET_USER' (state, user) {
        // Vue.set(state, 'user', user)
        state.user = {...user}
      },
      'SET_RESORT_META' (state, { country, mapFiles }) {
        state.resortCountry = country
        state.mapFiles = mapFiles
      },
      'SET_CONTACT_GROUPS' (state, contactGroups) {
        state.contactGroups = contactGroups
        state.loading = false
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

      listen ({ rootState, commit }, user) {
        console.log('listen dispatched . . .');

        if (!user) user = Firebase.auth().currentUser

        // if user is admin, listen to a ref that shows available resorts
        // else, listen to resort root

        rootState.db.collection('users').doc(user.uid).get().then(doc => {
          const userData = doc.data()
          user.authorizedResortIds = userData.authorizedResortIds
          commit('SET_RESORT_ID', userData.authorizedResortIds[0])  // Note hardcoded to first resortId in list
          commit('SET_USER', user)
          return rootState.resortsRef.doc(rootState.resortId)
            .onSnapshot(doc => {
              let resortData = doc.data()
              commit('SET_CONTACT_GROUPS', resortData.contactGroups)
              // commit('SET_RESORT_COUNTRY', resortData.country)
              commit('SET_RESORT_META', { country: resortData.country, mapFiles: resortData.mapFiles })
            })
        })
      },
      logIn ({ commit, dispatch }, { email, password, onSuccess }) {
        return Firebase.auth()
          .signInWithEmailAndPassword(email, password)
          .then(onSuccess, error => {
            commit('SET_LOADING_STATE', false)
            dispatch('showErrorModal', error.message)
          })
      },
      logOut ({ commit }) {
        Firebase.auth()
        .signOut()
        .then(() => {
          commit('SET_USER', {})
          commit('SET_CONTACT_GROUPS', [])
        });
      },
      createUser ({ rootState, commit, dispatch }, { email, password, resortId, onSuccess }) {
        let firebaseUser
        return Firebase.auth()
          .createUserWithEmailAndPassword(email, password)
          .then( user => {
            firebaseUser = user
            firebaseUser.authorizedResortIds = [resortId]
            return rootState.db.collection('users').doc(user.uid).set({authorizedResortIds: [resortId]})
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
        // resortData is imported from json file

        // const resortId = rootState.resortId
        const resortId = 'thredbo'
        console.log(`updating contact for ${resortId} . . .`);
        rootState.resortsRef.doc(resortId).update({ contactGroups: resortData[resortId].contactGroups
          .map(addNoSort)
          .map(addContactIdsAndFormatPhoneNumbers)
        })

      },
      saveNewEmptyGroup ({rootState}, groupName) {
        let groups = rootState.contactGroups.slice()
        groups.push({
          section: groupName,
          list: []
        })
        return rootState.db.collection('resorts').doc(rootState.resortId).update({
          contactGroups: groups
        })
      },
      saveContactGroupName ({ rootState }, { groupIndex, updatedName }) {
        let groups = rootState.contactGroups.slice()
        groups[groupIndex].section = updatedName
        rootState.resortsRef.doc(rootState.resortId).update({
          contactGroups: groups
        })
      },
      deleteContactGroup ({ rootState }, groupIndex) {
        let groups = rootState.contactGroups.slice()
        groups.splice(groupIndex, 1)
        return rootState.resortsRef.doc(rootState.resortId).update({
          contactGroups: groups
        })
      },
      saveContactGroupList ({ rootState }, { updatedList }) {
        return rootState.resortsRef.doc(rootState.resortId).update({
          contactGroups: updatedList
        })
      },
      toggleSortable ({ rootState }, groupIndex) {
        let groups = rootState.contactGroups.slice()
        groups[groupIndex].noSort = !rootState.contactGroups[groupIndex].noSort
        rootState.resortsRef.doc(rootState.resortId).update({
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
        return rootState.resortsRef.doc(rootState.resortId).update({
          contactGroups: groups
        }).then(() => { commit('SET_UPLOAD_BUFFER_URL', '')})
      },
      deleteContact ({ rootState, dispatch }, { groupIndex, contactId }) {

        const contactIndex = rootState.contactGroups[groupIndex].list.findIndex(contact => contact.id === contactId)
        let groups = rootState.contactGroups.slice()
        const contact = groups[groupIndex].list.splice(contactIndex, 1)[0]

        if (!contact.imageUrl) {
          return rootState.resortsRef.doc(rootState.resortId).update({
            contactGroups: groups
          })
        } else {
          return rootState.resortsRef.doc(rootState.resortId).update({
            contactGroups: groups
          }).then(() => { return dispatch('destroyImageFile', contact.imageUrl) })
        }
      },

      saveContactList ({ rootState }, payload) {
        let groups = rootState.contactGroups.slice()
        groups[payload.groupIndex].list = payload.updatedList
        rootState.resortsRef.doc(rootState.resortId).update({
          contactGroups: groups
        })
      },
      destroyImageFile ({ rootState, commit }, url) {
        const refToDestroy = Firebase.storage().refFromURL(url)
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
        rootState.resortsRef.doc(rootState.resortId).collection('scaledImages').doc(fileName.split('.')[0]).onSnapshot(doc => {
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