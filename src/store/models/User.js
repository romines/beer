import store from '../../store'

export default class User {

  static build (user, uid) {
    return new User(user, uid)
  }

  fullName () {
    return this.firstName + ' ' + this.lastName
  }

  canAccessSettings () {
    return this.isResortAdmin() || this.superAdmin || this.currentResortSettings().canManagePushNotifications
  }

  canEditPushNotifications () {
    return this.superAdmin || this.isResortAdmin() || this.currentResortSettings().canManagePushNotifications
  }

  canAccessWebcams () {
    if (this.superAdmin) return true
    if (!store.getters.resortPermissions.canManageWebcams) return false
    return this.currentResortSettings().canViewWebcams || this.canEditWebcams()
  }

  canEditWebcams () {
    return this.currentResortSettings().canManageWebcams || this.superAdmin || this.isResortAdmin()
  }

  canAccessContacts () {
    if (this.superAdmin) return true
    if (!store.getters.resortPermissions.canManageContacts) return false
    return this.currentResortSettings().canViewContacts || this.canEditContacts()
  }

  canEditContacts () {
    return this.currentResortSettings().canManageContacts || this.superAdmin || this.isResortAdmin()
  }

  canAccessResorts () {
    return this.superAdmin || this.hasManyResorts()
  }

  currentResortSettings () {
    if (this.superAdmin) return {}
    if (!store.getters.currentResort || !store.getters.currentResort.id) return {}
    return this.authorizedResorts[store.getters.currentResort.id]
  }

  isResortAdmin () {
    return this.currentResortSettings().isResortAdmin
  }

  authorizedResortCount () {
    if (!this.authorizedResorts) return 0
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
