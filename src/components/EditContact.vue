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
          :options="{ phone: true, phoneRegionCode: $store.state.resortCountry }"
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
          :options="{ phone: true, phoneRegionCode: $store.state.resortCountry }"
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

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Contact Active</label>
      </div>
      <div class="time-active-tags control is-expanded">
        <span class="tag is-info"
          @click="localState.contact.tags.summer = !localState.contact.tags.summer"
          :class="{'selected': localState.contact.tags.summer}">Summer</span>
        <span class="tag is-info"
          @click="localState.contact.tags.winter = !localState.contact.tags.winter"
          :class="{'selected': localState.contact.tags.winter}">Winter</span>
      </div>
    </div>

    <div class="field is-horizontal">
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
      v-if="localState.contact.rect"
      :coordinate-string="localState.contact.rect"
      :images="images"
      :map-id="localState.contact.mapId"
      @coordinateClick="onCoordinateClick"
      @resetMapCoordinates="resetMapCoordinates" />

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
        </div>

        <image-upload @uploadComplete="onImageUpload" v-show="!localState.contact.imageUrl" />

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
        <a class="button is-light" @click="initializeContact(); $emit('closeContact', { resetDirtyState: false })">
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
import PhoneNumber from 'awesome-phonenumber'
import uuid from 'uuid/v4'
import 'cleave.js/dist/addons/cleave-phone.us.js'
import LocationSelector from './LocationSelector.vue'
import ImageUpload from './ImageUpload.vue'
import pixel_grid from '../assets/pixel_grid.png'
import jh_village from '../assets/jh_village.png'

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
      images: [ // TEMP. won't be hardcoded once I have images for all resorts
        {
          fileName: 'jh_village.png',
          path: jh_village
        },{
          fileName: 'pixel_grid.png',
          path: pixel_grid
        }
      ],
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
      console.log('initializing contact . . .');
      const defaults = JSON.parse(JSON.stringify(contactDefaults))
      // this.localState.contact = Object.assign(defaults, this.contact)
      this.localState.contact = {...defaults, ...this.contact}
      if (this.contactId === 'NEW') this.localState.contact.id = uuid()
      this.contactAtInitialization = JSON.parse(JSON.stringify(this.localState.contact))
    },
    saveContact () {
      const number = this.localState.contact.number ? this.getPn(this.localState.contact.number).getNumber('international') : ''
      const sms = this.localState.contact.sms ? this.getPn(this.localState.contact.sms).getNumber('international') : ''
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
        this.$emit('closeContact', { resetDirtyState: true })
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
      if (this.localState.contact.imageUrl) this.$store.dispatch('destroyImageFile', this.localState.contact.imageUrl)
      this.$store.dispatch('listenForScaledImage', { url, fileName })
      this.localState.contact.imageUrl = url
    },
    removeImage () {
      this.pendingFileDeletion = this.localState.contact.imageUrl
      this.localState.contact.imageUrl = ''
    },
    onCoordinateClick ({ x, y, mapIndex }) {
      this.localState.contact.rect = `{{${x},${y}}}${this.localState.contact.rect.split('}')[1]}}}`
      this.localState.contact.mapId = mapIndex
    },
    resetMapCoordinates () {
      this.localState.contact.rect =  '{{0,0}{80,80}}'
      this.localState.contact.mapId =  -1
    },
    getPn (number) {
      return new PhoneNumber(number, this.$store.state.resortCountry)
    },
    phoneIsValid (number) {
      if (!number) return true
      return this.getPn(number).a.valid
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
  div.control {
    max-width: 480px;
  }
  .edit-contact {
    padding-top: .6em;
  }
  .field .control:not(.no-expando) {
    flex-grow: 1;
  }
  .test-link {
    pointer-events: auto;
    cursor: pointer !important;
    a {
      color: black;
      opacity: .5;
      &:hover { opacity: 1; }
    }
  }
  // .phone-invalid {
  //   text-align: right;
  //   margin-right: .6em;
  //   margin-top: -1.2em;
  // }
  .time-active-tags {
    display: flex;
    align-items: center;
    .tag {
      cursor: pointer;
      margin-top: .3em;
      margin-right: .3em;
      &:not(.selected) {
        opacity: .36;
      }
    }
  }
  .time-active-tags, .toggle-container, .manage-image {
    width: 100%;
  }
  .manage-image .image-container {
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
  }
  .location-selector {
    margin-bottom: .75rem;
  }

  .editr { max-width: 480px; }
  .editr--toolbar div:nth-child(14) {
    display: none;
  }
  .invalid-form-warning {
    margin: .6em 0;
    text-align: right;
  }

</style>
