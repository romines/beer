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
    saveNewMap({ state, rootState }, map) {
      const maps = [
        ...state.maps,
        map
      ]
      RESORTS_REF.doc(rootState.resortId).update({
        maps,
      })
    },
    updateMap({ state, rootState }, updatedMap) {
      const maps = JSON.parse(JSON.stringify(state.maps))
      const index = maps.findIndex(map => map.id === updatedMap.id)
      maps[index] = {
        ...maps[index],
        ...updatedMap
      }
      RESORTS_REF.doc(rootState.resortId).update({
        maps,
      })
    },
    deleteMap({ state, rootState }, mapId) {
      RESORTS_REF.doc(rootState.resortId).update({
        maps: state.maps.filter(map => map.id !== mapId)
      })
    },
  },
}
