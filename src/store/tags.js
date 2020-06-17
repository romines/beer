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
        ...(state.availableTags ? state.availableTags : []),
        tag
      ]
      RESORTS_REF.doc(rootState.currentResort.id).update({
        availableTags,
      })
    },
    deleteTag ({ state, rootState }, tagToDelete) {
      RESORTS_REF.doc(rootState.currentResort.id).update({
        contactGroups: removeTagFromGroups(rootState.contactGroups, tagToDelete),
        availableTags: state.availableTags.filter(tag => tag !== tagToDelete)
      })
    },
  },
}

function removeTagFromGroups(groups, tagToDelete) {
  const removeTagFromGroup = (group) => {
    const removeTagFromContact = contact => {
      if (typeof contact.tags !== 'object' || Object.keys(contact.tags).length <= 0) return contact;
      return {
        ...contact,
        tags: Object.keys(contact.tags).reduce((acc, tag) => {
          if (tag !== tagToDelete) acc[tag] = contact.tags[tag]
          return acc;
        }, {})
      }
    };
    return {
      ...group,
      list: group.list.map(removeTagFromContact),
    };
  }
  return groups.map(removeTagFromGroup)
}
