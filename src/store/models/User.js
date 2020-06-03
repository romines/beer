import store from '../../store'

export default class User {

  static build (user, uid) {
    return new User(user, uid)
  }

  fullName () {
    return this.firstName + ' ' + this.lastName
  }

  canAccessSettings () {
    return this.isResortAdmin() || this.superAdmin || this.currentUserResortPermissions().canManagePushNotifications
  }

  canEditPushNotifications () {
    return this.superAdmin || this.isResortAdmin() || this.currentUserResortPermissions().canManagePushNotifications
  }

  canAccessWebcams () {
    if (this.superAdmin) return true
    if (!store.getters.resortPermissions.canManageWebcams) return false
    return this.currentUserResortPermissions().canViewWebcams || this.canEditWebcams()
  }

  canEditWebcams () {
    return this.currentUserResortPermissions().canManageWebcams || this.superAdmin || this.isResortAdmin()
  }

  canAccessContacts () {
    if (this.superAdmin) return true
    if (!store.getters.resortPermissions.canManageContacts) return false
    return this.currentUserResortPermissions().canViewContacts || this.canEditContacts()
  }

  canEditContacts () {
    return this.currentUserResortPermissions().canManageContacts || this.superAdmin || this.isResortAdmin()
  }

  canAccessResorts () {
    return this.superAdmin || this.hasManyResorts()
  }

  currentUserResortPermissions () {
    if (this.superAdmin) return {}
    if (!store.getters.currentResort || !store.getters.currentResort.id) return {}
    return this.authorizedResorts[store.getters.currentResort.id]
  }

  isResortAdmin () {
    return this.currentUserResortPermissions().isResortAdmin
  }

  authorizedResortCount () {
    return Object.keys(this.authorizedResorts).length
  }

  hasManyResorts () {
    return this.authorizedResortCount() > 1
  }

  authorizedResortIds () {
    return Object.keys(this.authorizedResorts)
  }

  primaryResort () {
    return Object.keys(this.authorizedResorts)[0]
  }

  canEditUser (user) {
    if (this.superAdmin) return true
    if (this.isResortAdmin() && !user.isResortAdmin()) return true
    return false
  }


  constructor (user, uid) {
    this.uid                          = uid,
    this.firstName                    = user.firstName || '',
    this.lastName                     = user.lastName || '',
    this.email                        = user.email || '',
    this.superAdmin                   = !!user.superAdmin,
    this.updatedAt                    = user.updatedAt || '',
    this.createdAt                    = user.createdAt || '',
    this.authorizedResorts            = user.authorizedResorts

    // this.canManageContacts            = user.canManageContacts || false,
    // this.canManagePushNotifications   = user.canManagePushNotifications || false,
    // this.canManageWebcams             = user.canManageWebcams || false,
    // this.canViewContacts              = user.canViewContacts || false,
    // this.canViewPushNotifications     = user.canViewPushNotifications || false,
    // this.canViewWebcams               = user.canViewWebcams || false,
    // this.isResortAdmin                = user.isResortAdmin || false
  }
}
