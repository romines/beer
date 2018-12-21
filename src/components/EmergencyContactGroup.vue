<template>
  <div
    class="emergency-contact-group"
    :class="localState.emergencyGroup.list.length > 1 ? 'two-contacts' : ''"
  >
    <div class="contact" v-for="contact in localState.emergencyGroup.list" :key="contact.id">
      <div class="field is-horizontal">
        <div class="field-label is-normal"><label class="label">Contact Name</label></div>
        <div class="field-body ">
          <p class="control has-icons-left">
            <input v-model.trim="contact.name" class="input is-expanded" placeholder="Name" />
            <span class="icon is-small is-left"> <i class="fas fa-address-book" /> </span>
          </p>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal"><label class="label">Phone</label></div>
        <div class="field-body">
          <p class="control has-icons-left">
            <cleave
              v-model="contact.number"
              class="input is-expanded"
              :class="{ 'is-danger': contact.number && !phoneIsValid(contact.number) }"
              :options="{ phone: true, phoneRegionCode: resortCountry }"
              placeholder="Phone"
            />

            <span class="icon is-small is-left"> <i class="fas fa-phone" /> </span>
          </p>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal"><label class="label">SMS</label></div>
        <div class="field-body">
          <p class="control has-icons-left">
            <cleave
              v-model="contact.sms"
              class="input is-expanded"
              :class="{ 'is-danger': contact.sms && !phoneIsValid(contact.sms) }"
              :options="{ phone: true, phoneRegionCode: resortCountry }"
              placeholder="SMS"
            />

            <span class="icon is-small is-left"> <i class="fas fa-mobile-alt" /> </span>
          </p>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal"><label class="label">Email</label></div>
        <div class="field-body ">
          <p class="control has-icons-left">
            <input
              v-model.trim="contact.mailto"
              class="input is-expanded"
              :class="{ 'is-danger': !emailIsValid(contact.mailto) }"
              placeholder="Email"
            />
            <span class="icon is-small is-left"> <i class="fas fa-address-book" /> </span>
          </p>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal"><label class="label">Message</label></div>
        <div class="field-body ">
          <textarea v-model="contact.message" class="textarea is-expanded" placeholder="Message" />
        </div>
      </div>

      <div
        class="active-toggles box"
        v-show="$store.state.resortId !== 'russell_lands'"
        @click.stop
      >
        <div class="title is-6">Contact Active</div>
        <div class="field is-horizontal toggle">
          <div class="field-label is-normal"><label class="label">Summer</label></div>
          <div class="toggle-container control is-expanded">
            <label :for="'summer_' + contact.id" class="switch">
              <input :id="'summer_' + contact.id" type="checkbox" v-model="contact.tags.summer" />
              <span class="slider round" />
            </label>
          </div>
        </div>

        <div class="field is-horizontal toggle">
          <div class="field-label is-normal"><label class="label">Winter</label></div>
          <div class="toggle-container control is-expanded">
            <label :for="'winter_' + contact.id" class="switch">
              <input :id="'winter_' + contact.id" type="checkbox" v-model="contact.tags.winter" />
              <span class="slider round" />
            </label>
          </div>
        </div>
      </div>
    </div>
    <!-- end Contact -->

    <div class="add-remove-contact">
      <span
        class="link"
        v-if="localState.emergencyGroup.list.length === 1"
        @click="addRemoveSecondContact"
      >
        Add (Seasonal) Contact
      </span>
      <span
        class="link"
        v-if="localState.emergencyGroup.list.length === 2"
        @click="addRemoveSecondContact"
      >
        Remove Contact
      </span>
    </div>

    <div class="invalid-form-warning help is-danger" v-show="seasonConflict">
      Only one contact may be active per season.
    </div>

    <div class="field is-grouped is-grouped-right actions" v-if="!hideSave">
      <p class="control no-expando">
        <a class="button is-primary" @click="saveEmergencyGroup" :disabled="!saveButtonActive">
          Save
        </a>
      </p>
      <p class="control no-expando">
        <a class="button is-light" @click="$emit('emergencyGroupSave')"> Cancel </a>
      </p>
    </div>
  </div>
</template>

<script>
import { mixins } from './'
import Cleave from 'vue-cleave'
import uuid from 'uuid/v4'
import 'cleave.js/dist/addons/cleave-phone.i18n.js'

export default {
  components: {
    Cleave,
  },
  mixins: [mixins],
  props: {
    emergencyGroup: {
      type: Object,
    },
    resortCountry: {
      type: String,
    },
    hideSave: {
      type: Boolean,
    },
  },
  data() {
    return {
      localState: {
        emergencyGroup: {},
      },
      groupAtInitialization: {},
    }
  },
  computed: {
    groupIsDirty() {
      return (
        JSON.stringify(this.localState.emergencyGroup) !==
        JSON.stringify(this.groupAtInitialization)
      )
    },
    seasonConflict() {
      return (
        this.localState.emergencyGroup.list.filter(contact => contact.tags.winter).length > 1 ||
        this.localState.emergencyGroup.list.filter(contact => contact.tags.summer).length > 1
      )
    },
    saveButtonActive() {
      return (
        this.emergencyGroupValid(this.localState.emergencyGroup, this.resortCountry) &&
        this.groupIsDirty &&
        !this.seasonConflict
      )
    },
  },
  watch: {
    localState: {
      handler() {
        this.$emit('groupChange', this.localState.emergencyGroup)
      },
      deep: true,
    },
  },
  created() {
    this.initializeGroup()
  },
  methods: {
    initializeGroup() {
      this.localState.emergencyGroup = this.clone(this.emergencyGroup)
      this.groupAtInitialization = this.clone(this.emergencyGroup)
    },
    addRemoveSecondContact() {
      if (this.localState.emergencyGroup.list.length < 2) {
        this.localState.emergencyGroup.list[0].tags.winter = true
        this.localState.emergencyGroup.list[0].tags.summer = false
        this.localState.emergencyGroup.list.push({
          name: '',
          number: '',
          mailto: '',
          sms: '',
          id: uuid(),
          tags: {
            winter: false,
            summer: true,
          },
        })
      } else {
        this.localState.emergencyGroup.list.splice(1, 1)
        this.localState.emergencyGroup.list[0].tags.winter = true
        this.localState.emergencyGroup.list[0].tags.summer = true
      }
    },
    phoneIsValid(num) {
      if (num === '000') return true
      return this.getPn(num, this.resortCountry) && this.getPn(num, this.resortCountry).a.valid
    },
    saveEmergencyGroup() {
      const emergencyGroup = {
        ...this.localState.emergencyGroup,
        list: this.localState.emergencyGroup.list.map(contact =>
          this.formatContactNumbersForSave(contact, this.resortCountry)
        ),
      }
      // TEMP
      if (emergencyGroup.emergency !== undefined) delete emergencyGroup.emergency
      // end TEMP
      this.$store.dispatch('saveEmergencyContactGroup', emergencyGroup)
      this.$emit('emergencyGroupSave')
    },
  },
}
</script>

<style lang="scss" scoped>
.emergency-contact-group {
  &.two-contacts {
    .contact:first-child {
      padding-bottom: 1.2em;
      border-bottom: 1px solid black;
    }
  }
  .contact {
    margin-top: 1.6em;
    .button.season {
      margin-right: 0.6em;
      opacity: 0.6;
      &.active {
        opacity: 1;
        border: 4px solid #209cee;
      }
    }
  }

  .add-remove-contact {
    .link {
      margin-left: 0.6em;
      text-decoration: underline;
      font-weight: bold;
      cursor: pointer;
    }
  }

  .field.actions {
    margin-top: 1em;
  }
}
</style>
