import { firestore } from '../firebaseInit.js'
const RESORTS_REF = firestore.collection('resorts')

export default {
  state: {
    availableTags: []
  },
  mutations: {
    SET_TAGS(state, availableTags) {
      state.availableTags = availableTags
    }
  },
  actions: {
    saveNewTag({ state, rootState }, tag) {
      const availableTags = [
        ...state.availableTags,
        tag
      ]
      RESORTS_REF.doc(rootState.resortId).update({
        availableTags,
      })
    },
    deleteTag ({ state, rootState }, tagToDelete) {
      RESORTS_REF.doc(rootState.resortId).update({
        availableTags: state.availableTags.filter(tag => tag !== tagToDelete)
      })
    },
  },
}
