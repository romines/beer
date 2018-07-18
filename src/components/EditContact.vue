<template>
  <div class="edit-contact">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Name</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model.trim="localState.contact.name"
          class="input"
          placeholder="Name">
        <span class="icon is-small is-left">
          <i class="fas fa-address-book" />
        </span>
      </div>
    </div>
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Phone Number</label>
      </div>
      <div class="control has-icons-left">

        <cleave
          v-model="localState.contact.number"
          class="input"
          :class="{ 'is-danger': !phoneIsValid(localState.contact.number)}"
          :options="{ phone: true, phoneRegionCode: $store.state.resortMeta.country }"
          placeholder="Phone" />

        <span class="icon is-small is-left">
          <i class="fas fa-phone" />
        </span>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">SMS</label>
      </div>
      <div class="control has-icons-left">
        <cleave
          v-model="localState.contact.sms"
          class="input"
          :options="{ phone: true, phoneRegionCode: $store.state.resortMeta.country }"
          :class="{ 'is-danger': !phoneIsValid(localState.contact.sms) }"
          placeholder="SMS" />
        <span class="icon is-small is-left">
          <i class="fas fa-mobile-alt" />
        </span>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Website</label>
      </div>
      <div class="control has-icons-left has-icons-right">
        <input
          v-model.trim="localState.contact.url"
          :class="{ 'is-danger': !urlIsValid(localState.contact.url) }"
          class="input"
          placeholder="Website">
        <span class="icon is-small is-left">
          <i class="fas fa-globe" />
        </span>
        <span class="icon is-small is-right test-link" v-show="localState.contact.url && urlIsValid(localState.contact.url)">
          <a :href="localState.contact.url" target="_blank">
            <i class="fas fa-external-link-alt" />
          </a>
        </span>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Email Address</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model.trim="localState.contact.mailto"
          class="input"
          :class="{ 'is-danger': !emailIsValid(localState.contact.mailto) }"
          placeholder="Email Address">
        <span class="icon is-small is-left">
          <i class="fas fa-envelope" />
        </span>
      </div>
    </div>

    <div class="active-toggles box" v-show="$store.state.resortId !== 'russell_lands'">
      <div class="title is-6">Contact Active</div>
      <div class="field is-horizontal toggle">
        <div class="field-label is-normal">
          <label class="label">Summer</label>
        </div>
        <div class="toggle-container control is-expanded">
          <label class="switch">
            <input type="checkbox" v-model="localState.contact.tags.summer">
            <span class="slider round" />
          </label>
        </div>
      </div>

      <div class="field is-horizontal toggle">
        <div class="field-label is-normal">
          <label class="label">Winter</label>
        </div>
        <div class="toggle-container control is-expanded">
          <label class="switch">
            <input type="checkbox" v-model="localState.contact.tags.winter">
            <span class="slider round" />
          </label>
        </div>
      </div>
    </div>

    <div class="field is-horizontal toggle">
      <div class="field-label is-normal">
        <label class="label">Dining</label>
      </div>
      <div class="toggle-container control is-expanded">
        <label class="switch">
          <input type="checkbox" v-model="localState.contact.tags.dining">
          <span class="slider round" />
        </label>
      </div>
    </div>

    <div class="field is-horizontal" v-show="localState.contact.tags.dining">
      <div class="field-label is-normal">
        <label class="label">Menu URL</label>
      </div>
      <div class="control has-icons-left has-icons-right">
        <input
          v-model.trim="localState.contact.menu"
          :class="{ 'is-danger': !urlIsValid(localState.contact.menu) }"
          class="input"
          placeholder="Menu URL">
        <span class="icon is-small is-left">
          <i class="fas fa-globe" />
        </span>
        <span class="icon is-small is-right test-link" v-show="localState.contact.menu && urlIsValid(localState.contact.menu)">
          <a :href="localState.contact.menu" target="_blank">
            <i class="fas fa-external-link-alt" />
          </a>
        </span>
      </div>
    </div>

    <div class="field is-horizontal" v-show="localState.contact.tags.dining">
      <div class="field-label is-normal">
        <label class="label">Reservations URL</label>
      </div>
      <div class="control has-icons-left has-icons-right">
        <input
          v-model.trim="localState.contact.reservations"
          :class="{ 'is-danger': !urlIsValid(localState.contact.reservations) }"
          class="input"
          placeholder="Reservations URL">
        <span class="icon is-small is-left">
          <i class="fas fa-globe" />
        </span>
        <span class="icon is-small is-right test-link" v-show="localState.contact.reservations && urlIsValid(localState.contact.reservations)">
          <a :href="localState.contact.reservations" target="_blank">
            <i class="fas fa-external-link-alt" />
          </a>
        </span>
      </div>
    </div>

    <location-selector
      :coordinate-string="localState.contact.rect"
      :map-id="localState.contact.mapId"
      @coordinateClick="onCoordinateClick"
      @resetMapCoordinates="resetMapCoordinates" />

    <div class="field is-horizontal" v-if="matchingLocations && matchingLocations.length">
      <div class="field-label is-normal">
        <label class="label">&nbsp;</label>
      </div>
      <div class="matching-pins">
        <div class="proximity-warning">
          <div class="heading">This contact shares coordinates with the following contact(s)</div>
        </div>
        <ul class="location-group">
          <li class="location" v-for="location in matchingLocations">
            <span class="name">{{ location.name }}</span>
            <span class="coordinates">({{ location.x }}, {{ location.y }})</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="field is-horizontal" v-if="groupedNearbyLocations && Object.keys(groupedNearbyLocations).length">
      <div class="field-label is-normal">
        <label class="label">&nbsp;</label>
      </div>
      <div class="proximate-pins">
        <div class="proximity-warning">
          <div class="heading">
            <span class="warning-title">
              <strong>NOTICE: Nearby locations exist.</strong>
            </span>
            <span class="coordinates" v-if="localState.contact.rect">Selected coordinates: ({{ getCoordinates(localState.contact.rect).x }}, {{ getCoordinates(localState.contact.rect).y }})</span>
          </div>

        </div>
        <ul class="location-group" v-for="group in groupedNearbyLocations" @click="locationGroupClick(group)">
          <li class="location" v-for="location in group">
            <span class="name">{{ location.name }}</span>
            <span class="coordinates">({{ location.x }}, {{ location.y }})</span>
          </li>
        </ul>
        <small>
          Click location(s) above to apply existing coordinates. This ensures contacts which share a location are grouped together in app
        </small>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Description</label>
      </div>
      <wysiwyg v-model.trim="localState.contact.z_detail" />
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Image</label>
      </div>

      <div class="manage-image control">
        <div class="image-container" v-show="!!localState.contact.imageUrl">
          <span class="icon is-small remove" @click="removeImage">
            <i class="fas fa-times-circle" />
          </span>
          <img :src="localState.contact.imageUrl">
          <div class="remove-image" @click="removeImage">remove image</div>
        </div>

        <image-upload @uploadComplete="onImageUpload" :path-prefix="$store.state.resortId + '/images/'" v-show="!localState.contact.imageUrl" />

      </div>
    </div>

    <div class="invalid-form-warning help is-danger" v-show="!formIsValid">Form contains invalid data. Please fix errors (outlined in red) and try again</div>

    <div class="field is-grouped is-grouped-right">
      <p class="control no-expando">
        <a class="button is-primary" @click="saveContact" :disabled="!saveButtonActive">
          Save
        </a>
      </p>
      <p class="control no-expando">
        <a class="button is-light" @click="initializeContact(); $emit('closeContact', { resetDirtyState: false, contactId: contactId })">
          Cancel
        </a>
      </p>
      <p class="control no-expando" v-show="contactId !== 'NEW'">
        <a class="button is-danger is-outlined" @click="deleteContact">
          <span>Delete</span>
          <span class="icon is-small">
            <i class="fas fa-trash-alt" />
          </span>
        </a>
      </p>
    </div>

  </div>
</template>

<script>
import Cleave from 'vue-cleave'
import uuid from 'uuid/v4'
import 'cleave.js/dist/addons/cleave-phone.i18n.js'
import mixins from './mixins'
import LocationSelector from './LocationSelector.vue'
import ImageUpload from './ImageUpload.vue'

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const urlRegex = /^(?:(?:https?|ftp|file):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i

// fields that might be missing should be initialized with default values to ensure reactivity
const contactDefaults = {
  name: '',
  mailto: '',
  number: '',
  rect :  '{{0,0}{80,80}}',
  url: '',
  mapId : -1,
  tags :  {
    summer: true,
    winter: true,
    dining: false
  },
  menu: '',
  sms: '',
  z_reservations: '',
  z_detail: '',
  imageUrl: ''
}

export default {
  components: {
    Cleave,
    LocationSelector,
    ImageUpload
  },

  mixins: [ mixins ],

  props: {
    contact: {
      type: Object
    },
    groupIndex: {
      type: Number
    },
    contactId: {
      type: String
    },
  },
  data () {
    return {
      localState: {
        contact: {},
      },
      contactAtInitialization: {},
      pendingFileDeletion: ''
    }
  },
  computed: {
    contactIsDirty () {
      return JSON.stringify(this.localState.contact) !== JSON.stringify(this.contactAtInitialization)
    },
    formIsValid () {
      return ['url', 'menu', 'reservations'].every(fieldName =>  this.urlIsValid(this.localState.contact[fieldName]))
        && this.phoneIsValid(this.localState.contact.number)
        && this.phoneIsValid(this.localState.contact.sms)
        && this.emailIsValid(this.localState.contact.mailto)
    },
    saveButtonActive () {
      return this.contactIsDirty && this.formIsValid
    },
    flattenedContacts () {
      return this.$store.state.contactGroups.reduce((accumulated, group) => {
        return [...accumulated, ...group.list]
      }, [])
    },
    myCoordinates () {
      return this.getCoordinates(this.localState.contact.rect)
    },
    matchingLocations () {
      if (!this.myCoordinates) return
      if (!(this.myCoordinates.x && this.myCoordinates.y)) return []
      return this.flattenedContacts.filter(contact => {
        if (!contact.rect || !this.myCoordinates) return false
        if (contact.id === this.localState.contact.id) return false
        const testCoords = this.getCoordinates(contact.rect)
        return this.myCoordinates.x === testCoords.x && this.myCoordinates.y === testCoords.y
      }).map(this.contactToLocation)
    },
    nearbyLocations () {
      const isMatch = (contact) => {
        if (!contact.rect || !this.myCoordinates) return false
        const testCoords = this.getCoordinates(contact.rect)
        return (contact.id !== this.localState.contact.id)                                        // not same contact
          && (contact.mapId === this.localState.contact.mapId)                                    // using same map
          && ((testCoords.x !== this.myCoordinates.x) || (testCoords.y !== this.myCoordinates.y)) // not exact match
          && (Math.abs(testCoords.x - this.myCoordinates.x) < 81)                                 // within tolerance
          && (Math.abs(testCoords.y - this.myCoordinates.y) < 81)
      }
      return this.flattenedContacts.filter(isMatch).map(this.contactToLocation)
    },

    groupedNearbyLocations () {

      return this.nearbyLocations.reduce((acc, coordinateObject) => {
        const coordString = coordinateObject.x.toString() + coordinateObject.y.toString()
        if (!acc[coordString]) acc[coordString] = []
        acc[coordString].push(coordinateObject)
        return acc
      }, {})

    }
  },

  watch: {
    // re-initialize localState when 'contact' prop changes
    contact () {
      this.initializeContact()
    },
    contactIsDirty (val) {
      this.$store.commit('SET_CONTACT_DIRTY_STATE', val)
    }
  },
  created () {
    this.initializeContact()
  },
  methods: {

    initializeContact () {
      const defaults = this.clone(contactDefaults)

      this.localState.contact = {...defaults, ...this.contact}
      if (this.contactId === 'NEW') this.localState.contact.id = uuid()
      this.contactAtInitialization = this.clone(this.localState.contact)
    },
    saveContact () {
      const number = this.localState.contact.number ? this.getPn(this.localState.contact.number, this.$store.state.resortMeta.country).getNumber('international').replace(/ /g,'-') : ''
      const sms = this.localState.contact.sms ? this.getPn(this.localState.contact.sms, this.$store.state.resortMeta.country).getNumber('international') : ''
      const contact = {
        ...this.localState.contact,
        number,
        sms
      }
      this.$store.dispatch('saveContact', {
        groupIndex: this.groupIndex,
        updatedContact: contact
      }).then(() => {
        if (this.pendingFileDeletion) this.$store.dispatch('destroyImageFile', this.pendingFileDeletion)
        this.$emit('closeContact', { resetDirtyState: true, contactId: this.contactId })
      })
    },
    deleteContact () {

      const onConfirm = () => {
        this.$emit('closeContact', { resetDirtyState: true }) // why won't this work in the .then cb below??
        this.$store.commit('SHOW_MODAL', { loading: true, heading: 'Are you sure you want to delete this contact?' })
        this.$store.dispatch('deleteContact', {
          groupIndex: this.groupIndex,
          contactId: this.contactId
        }).then(() => {
          // this.$emit('cancelEdits')      // ...nerp..doesn't do shit here
          this.$store.commit('SHOW_MODAL', {
            heading: 'Contact deleted successfully',
            buttonLess: true
          })
          setTimeout(() => {
            this.$store.commit('CLOSE_MODAL')
          }, 1500);
        })
      }

      this.$store.commit('SHOW_MODAL', {
        heading: 'Are you sure you want to delete this contact?',
        onConfirm
      })

    },
    onImageUpload ({ url, fileName }) {
      this.$store.commit('SET_UPLOAD_BUFFER_URL', url)
      if (this.localState.contact.imageUrl) this.$store.dispatch('destroyImageFile', this.localState.contact.imageUrl)
      this.$store.dispatch('listenForScaledImage', { url, fileName })
      this.localState.contact.imageUrl = url
    },
    removeImage () {
      this.pendingFileDeletion = this.localState.contact.imageUrl
      this.localState.contact.imageUrl = ''
    },
    onCoordinateClick ({ x, y, mapIndex }) {
      const radius = this.localState.contact.rect.split('}')[1] ? this.localState.contact.rect.split('}')[1] : ',{80,80'
      this.localState.contact.rect = `{{${x},${y}}${radius}}}`
      this.localState.contact.mapId = mapIndex
    },
    resetMapCoordinates () {
      this.localState.contact.rect =  '{{0,0}{80,80}}'
      this.localState.contact.mapId =  -1
    },
    getCoordinates (coordinateString) {
      if (!coordinateString) return
      const str = coordinateString.split('}')[0]
      return {
        x: parseInt(str.substring(2, str.indexOf(','))),
        y: parseInt(str.substring(str.indexOf(',') + 1, str.length))
      }
    },
    locationGroupClick (group) {
      this.onCoordinateClick({
        x: group[0].x,
        y: group[0].y,
        mapIndex: this.localState.contact.mapId
      })
    },
    contactToLocation ({ name, rect }) {
      return {
        name,
        x: this.getCoordinates(rect).x,
        y: this.getCoordinates(rect).y
      }
    },
    phoneIsValid (number) {
      const regionCode = this.$store.state.resortMeta.country
      if (!number) return true
      return this.getPn(number, regionCode).a.valid
    },
    emailIsValid (email) {
      if (!email) return true
      return emailRegex.test(email.trim());
    },
    urlIsValid (url) {
      if (!url) return true
      return urlRegex.test(url.trim());
    },
  }
}
</script>

<style lang="scss">
  .edit-contact {
    padding-top: .6em;
  }
  .field .control:not(.no-expando) {
    flex-grow: 1;
  }
  .toggle-container, .manage-image, .proximate-pins, .matching-pins, div.control, .editr {
    width: 100%;
    max-width: 480px;
  }
  .test-link {
    pointer-events: auto !important;
    cursor: pointer !important;
    a {
      color: black;
      opacity: .5;
      &:hover { opacity: 1; }
    }
  }
  .field.toggle { margin-bottom: .26em; }
  .active-toggles {
    padding-bottom: 0;
    margin-bottom: .65em !important;
    .title {
      margin-bottom: .3em;
      padding-bottom: .3em;
      border-bottom: 1px solid #c3c3c3;
    }
    .field-label {
     flex-basis: 172px;
    }
    .field.toggle { margin-bottom: .2em; }
  }

  .manage-image {
    .image-container {
      position: relative;
      .icon.remove {
        position: absolute;
        z-index: 10;
        top: -6px;
        left: -6px;
        &:hover {
          color: red;
        }
      }
      .remove-image {
        padding-top: .2em;
        font-size: .9em;
      }
    }
    .remove-image {
      cursor: pointer;
      text-decoration: underline;
      &:hover {
        color: red;
      }
    }
  }

  .location-selector {
    margin-bottom: .75rem;
  }
  // Nearby and matching locations
  .location-group {
    border: 1px solid grey;
    margin-bottom: .1em;
    padding: .2em .4em;
    border-radius: 6px;
    .location {
      display: flex;
      justify-content: space-between;
    }
  }

  .proximate-pins {
    .location-group {
      cursor: pointer;
      &:hover { background-color: #d0d0d0; }
    }
  }

  .editr--toolbar div:nth-child(14) {
    display: none;
  }
  .invalid-form-warning {
    margin: .6em 0;
    text-align: right;
  }

</style>
