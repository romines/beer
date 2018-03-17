  import Vue from 'vue'
  import Vuex from 'vuex'
  import Firebase from 'firebase/app'
  import 'babel-polyfill'
  import jHContacts from '../assets/JH_contacts.json'
  import rLContacts from '../assets/RL_contacts.json'
  const resortData = {
    russell_lands: rLContacts,
    jackson_hole: jHContacts
  }
  // import contactSpec from '../assets/ContactSpec_rev_2-28.json'
  // console.log({contactSpec, jHContacts});
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

  const state = {
    user: {},
    db: {},
    resortsRef: {},
    resortId: '',
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
        state.user = user
      },
      'SET_CONTACT_GROUPS' (state, { contactGroups }) {
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
        rootState.db.collection('users').doc(user.uid).get().then(doc => {
          const userData = doc.data()
          user.authorizedResortIds = userData.authorizedResortIds
          commit('SET_RESORT_ID', userData.authorizedResortIds[0])  // Note hardcoded to first resortId in list
          commit('SET_USER', user)
          return rootState.resortsRef.doc(rootState.resortId)
            .onSnapshot(doc => commit('SET_CONTACT_GROUPS', doc.data()))
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
        rootState.resortsRef.doc(rootState.resortId).update({ contactGroups: resortData[rootState.resortId].contactGroups })
        // rootState.resortsRef.doc('russell_lands').set({ contactGroups: resortData.russell_lands.contactGroups, resortId: 'russell_lands', name: 'Russell Lands' })
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
        rootState.resortsRef.doc(rootState.resortId).update({
          contactGroups: updatedList
        })
      },
      saveContact ({ rootState, commit }, payload) {
        let groups = rootState.contactGroups.slice()
        payload.updatedContact.imageUrl = rootState.uploadBufferUrl ? rootState.uploadBufferUrl : payload.updatedContact.imageUrl
        if (payload.contactIndex === -1) {
          // new contact
          groups[payload.groupIndex].list.push(payload.updatedContact)
        } else {
          // existing contact
          groups[payload.groupIndex].list[payload.contactIndex] = payload.updatedContact
        }
        return rootState.resortsRef.doc(rootState.resortId).update({
          contactGroups: groups
        }).then(() => { commit('SET_UPLOAD_BUFFER_URL', '')})
      },
      deleteContact ({ rootState, dispatch }, { groupIndex, contactIndex}) {

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
        rootState.resortsRef.doc(rootState.resortId).collection('scaledImages').doc(fileName.split('.')[0]).onSnapshot(doc => {
          if (!doc.data()) return
          const scaledUrl = url.replace(fileName, `scaled_${fileName}`)
          if (rootState.uploadBufferUrl) {
            // image has been uploaded, but contact has not been saved
            commit('SET_UPLOAD_BUFFER_URL', scaledUrl)
          } else {
            rootState.contactGroups.some((group, groupIndex) => {
              return group.list.some((contact, contactIndex) => {
                if (contact.imageUrl === url) {
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