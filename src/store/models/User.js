export default class User {

  static build (user, uid) {
    return new User(user, uid)
  }

  fullName () {
    return this.firstName + ' ' + this.lastName
  }


  constructor (user, uid) {
    this.firstName                    = user.firstName,
    this.lastName                     = user.lastName,
    this.uid                          = uid,
    this.email                        = user.email,
    this.superAdmin                   = !!user.superAdmin,
    this.primaryResortId              = user.primaryResortId
    this.canManageContacts            = user.canManageContacts,
    this.canManagePushNotifications   = user.canManagePushNotifications,
    this.canManageWebcams             = user.canManageWebcams,
    this.canViewContacts              = user.canViewContacts,
    this.canViewPushNotifications     = user.canViewPushNotifications,
    this.canViewWebcams               = user.canViewWebcams,
    this.createdAt                    = user.createdAt,
    this.identifier                   = user.identifier,
    this.isResortAdmin                = user.isResortAdmin
  }
}
