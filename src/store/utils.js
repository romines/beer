import uuid from 'uuid/v4'

export function addMissingContactDefaults (group) {

  const addDefaultTags = (contact) => {
    if (!contact.tags) {
      contact.tags = {winter: true, summer: true, dining: false}
    }
    return contact
  }

  const fixCoordinates = (contact) => {
    if (contact.rect === '{{0,0}{80,80}}') contact.rect = '{{0,0},{80,80}}'
    return contact
  }

  const addMissingEmptyStringFields = (contact) => {
    ['imageUrl', 'mailto', 'menu', 'name', 'number', 'rect', 'sms', 'url', 'z_detail', 'z_reservations'].forEach(urlField => {
      if (contact[urlField] === undefined) {
        contact[urlField] = ''
      }
    })
    return contact
  }

  const addMapIndex = (contact) => {
    if (contact.rect === '') contact.mapId = -1
    if (contact.mapId === undefined) contact.mapId = 0
    return contact
  }

  const addUuid = (contact) => {
    if (contact.id === undefined) contact.id = uuid()
    return contact
  }

  const addHttpPrefix = (contact) => {
    ['url', 'menu', 'reservations'].forEach(urlField => {
      if (contact[urlField] && contact[urlField].startsWith('www')) {
        contact[urlField] = 'http://' + contact[urlField]
      }
    })
    return contact
  }

  const replaceNumberSpaces = (contact) => {
    if (!contact.number) return contact
    contact.number = contact.number.trim().replace(/ /g,'-')
    return contact
  }

  const moveReservations = (contact) => {
    if (contact.reservations) {
      contact.z_reservations = contact.reservations
      delete contact.reservations
      console.log('====================================')
      console.log('moving reservations prop for ' + contact.name)
      console.log('====================================')
    }
    return contact
  }

  group.list = group.list
    ? group.list
      // TEMP
      .map(moveReservations)
      .map(fixCoordinates)
      // end TEMP
      .map(addMissingEmptyStringFields)
      .map(addMapIndex)
      .map(addUuid)
      .map(addHttpPrefix)
      .map(replaceNumberSpaces)
      .map(addDefaultTags)
    : []

  return group

}