export default class User {

  static build (rtUser, googleUser) {
    return new User(rtUser, googleUser)
  }

  // fullName () {
  //   return this.firstName + ' ' + this.lastName
  // }


  constructor (rtUser, googleUser) {
    this.email                = googleUser.email,
    this.uid                  = googleUser.uid,
    this.superAdmin           = !!rtUser.superAdmin,
    this.authorizedResortIds  = rtUser.authorizedResortIds
  }
}
