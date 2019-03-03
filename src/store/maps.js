import { firestore } from '../firebaseInit.js'
const RESORTS_REF = firestore.collection('resorts')
// eslint-disable-next-line no-unused-vars
const resortRootAsFoundInFirestore = {
  // available maps property saved at resort level
  maps: [
    {
      timestamp: '1522428739473',
      name: 'Winter 2018/19',
      url:
        'https://firebasestorage.googleapis.com/v0/b/resorts-tapped-admin.appspot.com/o/jackson_hole%2Fimages%2F1522428739473.png?alt=media&token=eb58a9af-4438-4b6a-9b69-5af51aaf7942',
      active: true,
    },
    {
      timestamp: '1522428745001',
      name: 'Summer 2018',
      url:
        'https://firebasestorage.googleapis.com/v0/b/resorts-tapped-admin.appspot.com/o/jackson_hole%2Fimages%2F1522428745001.png?alt=media&token=eb58a9af-4438-4b6a-9b69-5af51aaf7942',
      active: true,
    },
    {
      timestamp: '1522146126814',
      name: 'Winter 2017/18',
      url:
        'https://firebasestorage.googleapis.com/v0/b/resorts-tapped-admin.appspot.com/o/jackson_hole%2Fimages%2F1522146126814.png?alt=media&token=eb58a9af-4438-4b6a-9b69-5af51aaf7942',
      active: false, // ie. will not display to regular user in CMS
    },
  ],
}
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
