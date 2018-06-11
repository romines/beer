import PhoneNumber from 'awesome-phonenumber'

export default {
  methods: {
    getPn (userInput) {
      return new PhoneNumber(userInput, this.$store.state.resortMeta.country)
    },
    emergencyGroupValid (emergencyGroup) {
      const contactIsValid = (contact) => {
        return contact.name.length && this.getPn(contact.number) && this.getPn(contact.number).a.valid
      }
      const seasonalStateValid = () => {
        if (!emergencyGroup.seasonal) return true
        return emergencyGroup.list.length === 2
          && emergencyGroup.list.filter(group => group.tags.summer).length === 1
          && emergencyGroup.list.filter(group => group.tags.winter).length === 1
      }

      return emergencyGroup.list.every(contactIsValid) && seasonalStateValid()

    }

  },
}