import { firestore } from '../firebaseInit.js'
const RESORTS_REF = firestore.collection('resorts')

// eslint-disable-next-line no-unused-vars
const contactDefinition = {
  coordinates: {
    1522428739473: '{{1074,439},{80,80}}',
    1522428745001: '{{1060,428},{80,80}}',
    1522146126814: '{{1035,480},{80,80}}',
  },
}
export default {
  state: {
    maps: []
  },
  mutations: {
    SET_MAPS(state, maps) {
      state.maps = maps
    }
  },
  actions: {
    saveMap({ state, rootState }, map) {
      const { mapId } = map
      const maps = { ...state.maps }
      maps[mapId] = map
      RESORTS_REF.doc(rootState.resortId).update({
        maps,
      })
    },
  },
}
