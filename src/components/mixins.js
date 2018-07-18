import PhoneNumber from 'awesome-phonenumber'

export default {
  methods: {
    getPn (userInput, countryRegionCode) {
      return new PhoneNumber(userInput, countryRegionCode)
    },
    getPhoneNumberForSaving(userInput, countryRegionCode) {
      console.log(userInput)
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
    emergencyGroupValid (emergencyGroup, countryRegionCode) {
      const contactIsValid = (contact) => {
        const validPhone = contact.number === '000' ? true : (this.getPn(contact.number, countryRegionCode) && this.getPn(contact.number, countryRegionCode).a.valid)
        return contact.name.length && validPhone
      }
      const seasonalStateValid = () => {
        if (!emergencyGroup.seasonal) return true
        return emergencyGroup.list.length === 2
          && emergencyGroup.list.filter(group => group.tags.summer).length === 1
          && emergencyGroup.list.filter(group => group.tags.winter).length === 1
      }

      return emergencyGroup.list.every(contactIsValid) && seasonalStateValid()

    },
    clone (serializable) {
      return JSON.parse(JSON.stringify(serializable))
    }

  },
}