import PhoneNumber from 'awesome-phonenumber'

export default {
  methods: {
    getPn (userInput, countryRegionCode) {
      return new PhoneNumber(userInput, countryRegionCode)
    },
    getPhoneNumberForSaving(userInput, countryRegionCode) {
      if (!userInput) return ''
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
        return contact.name.length && this.getPn(contact.number, countryRegionCode) && this.getPn(contact.number, countryRegionCode).a.valid
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