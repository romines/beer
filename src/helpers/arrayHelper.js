var arrayHelper = (function () {

  function findIndex (array, value, propertyName) {
    if (!array) return -1
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i][propertyName] === value) return i
    }
    return -1
  }

  function findObjectByValue (array, value, propertyName) {
    var index = findIndex(array, value, propertyName)
    if (index === -1) return null
    return array[index]
  }

  function removeValue (array, value) {
    var index = array.indexOf(value)
    if (index > -1) array.splice(index, 1)
  }

  function sortByObjectKey (array, key) {
    return array.sort((a, b) => {
      if (a[key] < b[key]) return -1
      if (a[key] > b[key]) return 1
      return 0
    })
  }

  function removeObjectByValue (array, value, propertyName) {
    var index = findIndex(array, value, propertyName)
    if (index > -1) array.splice(index, 1)
    return index
  }

  function replaceObjectByValue (array, object, value, propertyName) {
    var index = findIndex(array, value, propertyName)
    if (index > -1) array.splice(index, 1, object)
    if (index > -1) return true
    else return false
  }

  return {
    findObjectByValue:      findObjectByValue,
    findIndex:              findIndex,
    removeValue:            removeValue,
    sortByObjectKey:        sortByObjectKey,
    removeObjectByValue:    removeObjectByValue,
    replaceObjectByValue:   replaceObjectByValue
  }
})()

export default arrayHelper
