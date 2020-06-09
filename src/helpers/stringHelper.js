
var stringHelper = (function () {
  function camelize (str) {
    return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase() })
  }

  function camelizeObject (obj) {
    let newObj = {}
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        let camelKey = camelize(key)
        if (Array.isArray(obj[key])) {
          if (typeof (obj[key][0]) === 'object') newObj[camelKey] = camelizeArrayOfObjects(obj[key])
          else newObj[camelKey] = obj[key]
        } else {
          newObj[camelKey] = obj[key]
        }
      }
    }
    return newObj
  }

  function camelizeResponse (response) {
    let newObj = {}
    for (var key in response) {
      if (response.hasOwnProperty(key)) {
        let camelKey = camelize(key)
        if (Array.isArray(response[key])) {
          if (typeof (response[key][0]) === 'object') newObj[camelKey] = camelizeArrayOfObjects(response[key])
          else newObj[camelKey] = response[key]
        } else if (typeof response[key] === 'object') {
          newObj[camelKey] = camelizeObject(response[key])
        } else {
          newObj[camelKey] = response[key]
        }
      }
    }
    return newObj
  }

  function camelizeArrayOfObjects (array) {
    let newArray = []
    array.forEach(function (object) {
      let camelObject = camelizeObject(object)
      newArray.push(camelObject)
    })
    return newArray
  }

  function unCamelize (str) {
    return str.replace(/\.?([A-Z])/g, function (x, y) { return '_' + y.toLowerCase() }).replace(/^_/, '')
  }

  function unCamelizeObject (obj) {
    let newObj = {}
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        let unCamelKey = unCamelize(key)
        if (Array.isArray(obj[key])) {
          newObj[unCamelKey] = unCamelizeArrayOfObjects(obj[key])
        } else {
          newObj[unCamelKey] = obj[key]
        }
      }
    }
    return newObj
  }

  function unCamelizeArrayOfObjects (array) {
    let newArray = []
    array.forEach(function (object) {
      let unCamelObject = unCamelizeObject(object)
      newArray.push(unCamelObject)
    })
    return newArray
  }

  function pluralizeString (string, itemLength) {
    if (itemLength  === 1) return string
    else return string + 's'
  }

  return {
    camelize:                 camelize,
    camelizeObject:           camelizeObject,
    camelizeResponse:         camelizeResponse,
    camelizeArrayOfObjects:   camelizeArrayOfObjects,
    unCamelize:               unCamelize,
    unCamelizeObject:         unCamelizeObject,
    unCamelizeArrayOfObjects: unCamelizeArrayOfObjects,
    pluralizeString:          pluralizeString
  }
})()

export default stringHelper
