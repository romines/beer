export default class User {

  static build (user, uid) {
    return new User(user, uid)
  }

  // fullName () {
  //   return this.firstName + ' ' + this.lastName
  // }


  constructor (user, uid) {
    this.uid                  = uid,
    this.email                = user.email,
    this.superAdmin           = !!user.superAdmin,
    this.primaryResortId      = user.primaryResortId
  }
}
