import { firestore } from '../firebaseInit.js'
const RESORTS_REF = firestore.collection('resorts')

export default {
  state: {
    availableMaps: {},
  },
  mutations: {
    SET_AVAILABLE_MAPS(state, availableMaps) {
      console.log('SET_AVAILABLE_MAPS . . .')
      state.availableMaps = availableMaps
    },
  },
  actions: {
    listenToMaps({ rootState, commit }) {
      console.log('listen[ing]ToMaps . . .')
    },
    saveMap({ rootState }, map) {
      const { mapId } = map
      const availableMaps = { ...rootState.availableMaps }
      availableMaps[mapId] = map
      RESORTS_REF.doc(rootState.resortId).update({
        availableMaps,
      })
    },
  },
}
