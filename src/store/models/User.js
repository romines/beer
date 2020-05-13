export default class User {

  static build (user, uid) {
    return new User(user, uid)
  }

  fullName () {
    return this.firstName + ' ' + this.lastName
  }

  canAccessWebcams () {
    return this.canViewWebcams || this.canEditWebcams()
  }

  canEditWebcams () {
    return this.canManageWebcams || this.superAdmin || this.isResortAdmin
  }

  canAccessSettings () {
    return this.isResortAdmin || this.superAdmin || this.canManagePushNotifications
  }

  canAccessContacts () {
    return this.canViewContacts || this.canEditContacts()
  }

  canEditContacts () {
    return this.canManageContacts || this.superAdmin || this.isResortAdmin
  }


  constructor (user, uid) {
    this.uid                          = uid,
    this.firstName                    = user.firstName || '',
    this.lastName                     = user.lastName || '',
    this.email                        = user.email || '',
    this.superAdmin                   = !!user.superAdmin,
    this.primaryResortId              = user.primaryResortId,
    this.canManageContacts            = user.canManageContacts || false,
    this.canManagePushNotifications   = user.canManagePushNotifications || false,
    this.canManageWebcams             = user.canManageWebcams || false,
    this.canViewContacts              = user.canViewContacts || false,
    this.canViewPushNotifications     = user.canViewPushNotifications || false,
    this.canViewWebcams               = user.canViewWebcams || false,
    this.updatedAt                    = user.updatedAt || '',
    this.createdAt                    = user.createdAt || '',
    this.identifier                   = user.identifier || '',
    this.isResortAdmin                = user.isResortAdmin || false
  }
}
