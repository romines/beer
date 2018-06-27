<template>
  <div class="emergency-contact-group">

    <div class="emergency-seasonal field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Seasonal</label>
      </div>

      <div class="field-body toggle-container">
        <label class="switch" @click.stop>
          <input type="checkbox" v-model="localState.emergencyGroup.seasonal" @click.stop.prevent.self="toggleSeasonal">
          <span class="slider round" />
        </label>
      </div>
    </div>

    <div class="contact" v-for="contact in localState.emergencyGroup.list">

      <div class="field is-horizontal" v-show="localState.emergencyGroup.seasonal">
        <div class="field-label is-normal">
          <label class="label">Season</label>
        </div>
        <div class="field-body control has-icons-left">
          <span class="button season" :class="{'active': contact.tags.winter}" @click="toggleContactSeason(contact.tags.winter)">Winter</span>
          <span class="button season" :class="{'active': contact.tags.summer}" @click="toggleContactSeason(contact.tags.summer)">Summer</span>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Contact Name</label>
        </div>
        <div class="field-body control has-icons-left">
          <input
            v-model.trim="contact.name"
            class="input is-expanded"
            placeholder="Name">
          <span class="icon is-small is-left">
            <i class="fas fa-address-book" />
          </span>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Phone</label>
        </div>
        <div class="field-body control has-icons-left">
          <cleave
            v-model="contact.number"
            class="input is-expanded"
            :class="{ 'is-danger': !phoneIsValid(contact.number)}"
            :options="{ phone: true, phoneRegionCode: resortCountry }"
            placeholder="Phone" />

          <span class="icon is-small is-left">
            <i class="fas fa-phone" />
          </span>
        </div>
      </div>


    </div>
    <div class="field is-grouped is-grouped-right actions" v-if="!hideSave">
      <p class="control no-expando">
        <a class="button is-primary" @click="saveEmergencyGroup" :disabled="!saveButtonActive">
          Save
        </a>
      </p>
      <p class="control no-expando">
        <a class="button is-light" @click="">
          Cancel
        </a>
      </p>
    </div>


  </div>
</template>

<script>
import mixins from './mixins'
import Cleave from 'vue-cleave'
import 'cleave.js/dist/addons/cleave-phone.i18n.js'

export default {

  components: {
    Cleave
  },
  mixins: [mixins],
  props: {
    emergencyGroup: {
      type: Object
    },
    resortCountry: {
      type: String
    },
    hideSave: {
      type: Boolean
    }
  },
  data () {
    return {
      localState: {
        emergencyGroup: {}
      }
    }
  },
  computed: {
    saveButtonActive () {
      return this.emergencyGroupValid(this.localState.emergencyGroup, this.resortCountry)
    }
  },
  watch: {
    // emergencyGroup () {
    //   this.initializeGroup()
    // },
    localState: {
      handler () {
        this.$emit('groupChange', this.localState.emergencyGroup)
      },
      deep: true
    }
  },
  created () {
    this.initializeGroup()
  },
  methods: {
    initializeGroup () {
      this.localState.emergencyGroup = this.clone(this.emergencyGroup)
    },
    toggleSeasonal () {

      if (this.localState.emergencyGroup.list.length < 2) {
        this.localState.emergencyGroup.list[0].tags.winter = true
        this.localState.emergencyGroup.list[0].tags.summer = false
        this.localState.emergencyGroup.list.push({
          name: '',
          number: '',
          tags: {
            winter: false,
            summer: true
          }
        })
      } else {
        this.localState.emergencyGroup.list.splice(1, 1)
        this.localState.emergencyGroup.list[0].tags.winter = true
        this.localState.emergencyGroup.list[0].tags.summer = true
      }

      this.localState.emergencyGroup.seasonal = !this.localState.emergencyGroup.seasonal

    },
    phoneIsValid (number) {
      return this.getPn(number, this.resortCountry) && this.getPn(number, this.resortCountry).a.valid
    },
    toggleContactSeason (currentlyActive) {
      if (!currentlyActive) {
        this.localState.emergencyGroup.list.forEach(contact => {
          contact.tags.winter = !contact.tags.winter
          contact.tags.summer = !contact.tags.summer
        })

      }
    },
    saveEmergencyGroup () {
      const formatNumberForSave = contact => {
        return {...contact, number: this.getPhoneNumberForSaving(contact.number, this.resortCountry)}
      }
      const emergencyGroup = {
        ...this.localState.emergencyGroup,
        list: this.localState.emergencyGroup.list.map(formatNumberForSave),
        emergency: true
      }
      this.$store.dispatch('saveEmergencyContactGroup', emergencyGroup)
    },
  }
}
</script>

<style lang="scss" scoped>
.emergency-contact-group {

  .contact {
    margin-top: 1.6em;
    .button.season {
      margin-right: .6em;
      opacity: .6;
      &.active {
        opacity: 1;
        border: 4px solid #209cee;
      }
    }
  }

  .field.actions {
    margin-top: 1em;
  }

}
</style>
