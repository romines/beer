import store from '../../store'

export default class User {

  static build (user, uid) {
    return new User(user, uid)
  }

  fullName () {
    return this.firstName + ' ' + this.lastName
  }

  canAccessSettings () {
    return this.currentResortPermissions().isResortAdmin || this.superAdmin || this.currentResortPermissions().canManagePushNotifications
  }

  canEditPushNotifications () {
    return this.superAdmin || this.currentResortPermissions().isResortAdmin || this.currentResortPermissions().canManagePushNotifications
  }

  canAccessWebcams () {
    if (this.superAdmin) return true
    if (!store.getters.resortPermissions.canManageWebcams) return false
    return this.currentResortPermissions().canViewWebcams || this.canEditWebcams()
  }

  canEditWebcams () {
    return this.currentResortPermissions().canManageWebcams || this.superAdmin || this.currentResortPermissions().isResortAdmin
  }

  canAccessContacts () {
    if (this.superAdmin) return true
    if (!store.getters.resortPermissions.canManageContacts) return false
    return this.currentResortPermissions().canViewContacts || this.canEditContacts()
  }

  canEditContacts () {
    return this.currentResortPermissions().canManageContacts || this.superAdmin || this.currentResortPermissions().isResortAdmin
  }

  currentResortPermissions () {
    if (this.superAdmin) return {}
    return this.authorizedResorts[store.getters.currentResort.id]
  }

  authorizedResortCount () {
    return Object.keys(this.authorizedResorts).length
  }

  authorizedResortIds () {
    return Object.keys(this.authorizedResorts)
  }

  primaryResort () {
    return Object.keys(this.authorizedResorts)[0]
  }


  constructor (user, uid) {
    this.uid                          = uid,
    this.firstName                    = user.firstName || '',
    this.lastName                     = user.lastName || '',
    this.email                        = user.email || '',
    this.superAdmin                   = !!user.superAdmin,
    this.primaryResortId              = user.primaryResortId,
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
