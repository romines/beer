export default class User {

  static build (user, uid) {
    return new User(user, uid)
  }

  fullName () {
    return this.firstName + ' ' + this.lastName
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
