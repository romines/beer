import PhoneNumber from 'awesome-phonenumber'
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const urlRegex = /^(?:(?:https?|ftp|file):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i

export default {
  methods: {
    getPn (userInput, countryRegionCode) {
      return new PhoneNumber(userInput, countryRegionCode)
    },
    getPhoneNumberForSaving(userInput, countryRegionCode) {
      if (!userInput) return ''
      if (userInput === '000') return '000'
      return this.getPn(userInput, countryRegionCode).getNumber('international').replace(/ /g,'-')
    },
    formatContactNumbersForSave (contact, countryRegionCode) {
      return {
        ...contact,
        number: this.getPhoneNumberForSaving(contact.number, countryRegionCode),
        sms: this.getPhoneNumberForSaving(contact.sms, countryRegionCode)
      }
    },
    emailIsValid (email) {
      if (!email) return true
      return emailRegex.test(email.trim())
    },
    urlIsValid (url) {
      if (!url) return true
      return urlRegex.test(url.trim())
    },
    emergencyGroupValid (emergencyGroup, countryRegionCode) {
      const contactIsValid = (contact) => {
        const validPhone = contact.number === '000' ? true : (contact.number && this.getPn(contact.number, countryRegionCode) && this.getPn(contact.number, countryRegionCode).a.valid)
        const validSMS = contact.sms === '' ? true : (this.getPn(contact.sms, countryRegionCode) && this.getPn(contact.sms, countryRegionCode).a.valid)
        return contact.name.length && validPhone && validSMS && this.emailIsValid(contact.mailto)
      }
      const seasonalStateValid = () => {
        if (emergencyGroup.list.length === 1) return true
        return emergencyGroup.list.filter(group => group.tags.summer).length === 1
          && emergencyGroup.list.filter(group => group.tags.winter).length === 1
      }
      return emergencyGroup.list.every(contactIsValid) && seasonalStateValid()

    },
    clone (serializable) {
      return JSON.parse(JSON.stringify(serializable))
    },
  },
}