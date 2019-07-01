<template>
  <div class="edit-contact">
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Name</label>
      </div>
      <div class="control has-icons-left">
        <input v-model.trim="localState.contact.name" class="input" placeholder="Name">
        <span class="icon is-small is-left">
          <i class="fas fa-address-book"/>
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
          :class="{ 'is-danger': !phoneIsValid(localState.contact.number) }"
          :options="{ phone: true, phoneRegionCode: $store.state.resortMeta.country }"
          placeholder="Phone"
        />

        <span class="icon is-small is-left">
          <i class="fas fa-phone"/>
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
          placeholder="SMS"
        />
        <span class="icon is-small is-left">
          <i class="fas fa-mobile-alt"/>
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
          placeholder="Website"
        >
        <span class="icon is-small is-left">
          <i class="fas fa-globe"/>
        </span>
        <span class="icon is-small is-right test-link" v-show="localState.contact.url">
          <a :href="localState.contact.url" target="_blank" tabindex="-1">
            <i class="fas fa-external-link-alt"/>
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
          placeholder="Email Address"
        >
        <span class="icon is-small is-left">
          <i class="fas fa-envelope"/>
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
          <label for="summer" class="switch">
            <input id="summer" type="checkbox" v-model="localState.contact.tags.summer">
            <span class="slider round"/>
          </label>
        </div>
      </div>

      <div class="field is-horizontal toggle">
        <div class="field-label is-normal">
          <label class="label">Winter</label>
        </div>
        <div class="toggle-container control is-expanded">
          <label for="winter" class="switch">
            <input id="winter" type="checkbox" v-model="localState.contact.tags.winter">
            <span class="slider round"/>
          </label>
        </div>
      </div>
    </div>

    <div class="field is-horizontal toggle">
      <div class="field-label is-normal">
        <label class="label">Dining</label>
      </div>
      <div class="toggle-container control is-expanded">
        <label for="dining" class="switch">
          <input id="dining" type="checkbox" v-model="localState.contact.tags.dining">
          <span class="slider round"/>
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
          placeholder="Menu URL"
        >
        <span class="icon is-small is-left">
          <i class="fas fa-globe"/>
        </span>
        <span class="icon is-small is-right test-link" v-show="localState.contact.menu">
          <a :href="localState.contact.menu" target="_blank" tabindex="-1">
            <i class="fas fa-external-link-alt"/>
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
          v-model.trim="localState.contact.z_reservations"
          :class="{ 'is-danger': !urlIsValid(localState.contact.z_reservations) }"
          class="input"
          placeholder="Reservations URL"
        >
        <span class="icon is-small is-left">
          <i class="fas fa-globe"/>
        </span>
        <span class="icon is-small is-right test-link" v-show="localState.contact.z_reservations">
          <a :href="localState.contact.z_reservations" tabindex="-1" target="_blank">
            <i class="fas fa-external-link-alt"/>
          </a>
        </span>
      </div>
    </div>

    <location-selector
      v-if="this.$store.state.resortMeta.mapFiles && this.$store.state.resortMeta.mapFiles.length"
      :coordinates="localState.contact.coordinates"
      :flattened-contacts="flattenedContacts"
      :coordinate-string="localState.contact.rect"
      :contact-id="localState.contact.id"
      :map-id="localState.contact.mapId"
      @coordinateClick="onCoordinateClick"
      @resetMapCoordinates="resetMapCoordinates"
    />

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Description</label>
      </div>
      <div class="editors-container">
        <div class="tabs is-boxed">
          <ul>
            <li
              :class="localState.contact.descriptionEditor === 'RICH' ? 'is-active' : ''"
              @click="localState.contact.descriptionEditor = 'RICH'"
            >
              <a>
                <span class="icon is-small">
                  <i class="far fa-file-alt" aria-hidden="true"/>
                </span>
                <span>Rich Text</span>
              </a>
            </li>
            <li
              :class="localState.contact.descriptionEditor === 'RAW' ? 'is-active' : ''"
              @click="localState.contact.descriptionEditor = 'RAW'"
            >
              <a>
                <span class="icon is-small">
                  <i class="fas fa-code" aria-hidden="true"/>
                </span>
                <span>Raw HTML</span>
              </a>
            </li>
          </ul>
        </div>
        <!-- eslint-disable vue/attribute-hyphenation -->
        <vue-editor
          v-if="localState.contact.descriptionEditor === 'RICH'"
          v-model="localState.contact.z_detail"
          :editorToolbar="toolbarButtons"
          class="quill-editor"
        />
        <!-- eslint-enable vue/attribute-hyphenation -->
        <textarea
          v-if="localState.contact.descriptionEditor === 'RAW'"
          v-model="localState.contact.z_detail"
          rows="13"
        />
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Image</label>
      </div>

      <div class="manage-image control">
        <div class="image-container" v-show="!!localState.contact.imageUrl">
          <span class="icon is-small remove" @click="removeImage">
            <i class="fas fa-times-circle"/>
          </span>
          <img :src="localState.contact.imageUrl">
          <div class="remove-image" @click="removeImage">remove image</div>
        </div>

        <image-upload
          @uploadComplete="onImageUpload"
          :path-prefix="$store.state.resortId + '/images/'"
          v-show="!localState.contact.imageUrl"
        />
      </div>
    </div>

    <div
      class="invalid-form-warning help is-danger"
      v-show="!localState.contact.name"
    >You must provide a contact name.</div>
    <div
      class="invalid-form-warning help is-danger"
      v-show="!localState.contact.number && !localState.contact.sms"
    >You must provide a phone or SMS number.</div>
    <div
      class="invalid-form-warning help is-danger"
      v-show="!allDataVaild"
    >Form contains invalid data. Please fix errors (outlined in red) and try again</div>

    <div class="bottom-buttons">
      <div class="duplicate field is-left">
        <p class="control no-expando">
          <a class="button is-light" @click="duplicateContact">
            <span>Make a Copy</span>
            <span class="icon is-small">
              <i class="far fa-copy"/>
            </span>
          </a>
        </p>
      </div>
      <div class="field is-grouped is-grouped-right">
        <p class="control no-expando">
          <a class="button is-primary" @click="saveContact" :disabled="!saveButtonActive">Save</a>
        </p>
        <p class="control no-expando">
          <a class="button is-light" @click="cancelEdits">Cancel</a>
        </p>
        <p class="control no-expando" v-show="contactId !== 'NEW'">
          <a class="button is-danger is-outlined" @click="deleteContact">
            <span>Delete</span>
            <span class="icon is-small">
              <i class="fas fa-trash-alt"/>
            </span>
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Cleave from 'vue-cleave'
import { VueEditor } from 'vue2-editor'
import uuid from 'uuid/v4'
import equal from 'deep-equal'
import 'cleave.js/dist/addons/cleave-phone.i18n.js'
import mixins from './mixins'
import LocationSelector from './LocationSelector.vue'
import ImageUpload from './ImageUpload.vue'

// fields that might be missing should be initialized with default values to ensure reactivity
const contactDefaults = {
  name: '',
  mailto: '',
  number: '',
  rect: '{{0,0},{80,80}}',
  coordinates: {},
  url: '',
  mapId: -1,
  tags: {
    summer: true,
    winter: true,
    dining: false,
  },
  menu: '',
  sms: '',
  z_reservations: '',
  z_detail: '',
  imageUrl: '',
  descriptionEditor: 'RICH',
}

export default {
  components: {
    Cleave,
    LocationSelector,
    ImageUpload,
    VueEditor,
  },

  mixins: [mixins],

  props: {
    contact: {
      type: Object,
    },
    groupId: {
      type: String,
    },
    groupIndex: {
      type: Number,
    },
    contactId: {
      type: String,
    },
  },
  data() {
    return {
      localState: {
        contact: {},
      },
      contactAtInitialization: {},
      pendingFileDeletion: '',
      toolbarButtons: [
        [{ header: [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'strike', 'link'],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
      ],
    }
  },
  computed: {
    contactIsDirty() {
      const contact = { ...this.localState.contact, descriptionEditor: null }
      const contactAtInitialization = { ...this.contactAtInitialization, descriptionEditor: null }
      return !equal(contact, contactAtInitialization)
    },
    allRequiredFieldsPopulated() {
      return (
        (this.localState.contact.name && this.localState.contact.number) ||
        this.localState.contact.sms
      )
    },
    allDataVaild() {
      return (
        this.phoneIsValid(this.localState.contact.number) &&
        this.phoneIsValid(this.localState.contact.sms) &&
        this.emailIsValid(this.localState.contact.mailto) &&
        ['url', 'menu', 'z_reservations'].every(fieldName =>
          this.urlIsValid(this.localState.contact[fieldName])
        )
      )
    },
    saveButtonActive() {
      return this.contactIsDirty && this.allRequiredFieldsPopulated && this.allDataVaild
    },
    flattenedContacts() {
      return this.$store.state.contactGroups.reduce((accumulated, group) => {
        return [...accumulated, ...group.list]
      }, [])
    },
  },

  watch: {
    // re-initialize localState when 'contact' prop changes
    contact() {
      this.initializeContact()
    },
    contactIsDirty(val) {
      this.$store.commit('SET_CONTACT_DIRTY_STATE', val)
    },
  },
  created() {
    this.initializeContact()
    this.listenForTagChange()
  },
  destroyed() {
    if (this.unsubscribeTagChangeListener) this.unsubscribeTagChangeListener()
  },
  methods: {
    initializeContact() {
      const defaults = this.clone(contactDefaults)

      this.localState.contact = { ...defaults, ...this.contact }
      if (this.contactId === 'NEW') this.localState.contact.id = uuid()
      if (this.contact.z_detail !== '')
        this.localState.contact.z_detail = this.cleanDescription(this.contact.z_detail)
      this.contactAtInitialization = this.clone(this.localState.contact)
    },
    listenForTagChange() {
      console.log('listening for tag change')
      this.unsubscribeTagChangeListener = this.$store.subscribeAction((action, state) => {
        if (action.type !== 'toggleOpenContactTag') return
        this.localState.contact.tags = action.payload
      })
    },
    saveContact() {
      const number = this.localState.contact.number
        ? this.getPn(this.localState.contact.number, this.$store.state.resortMeta.country)
            .getNumber('international')
            .replace(/ /g, '-')
        : ''
      const sms = this.localState.contact.sms
        ? this.getPn(this.localState.contact.sms, this.$store.state.resortMeta.country).getNumber(
            'international'
          )
        : ''
      const contact = {
        ...this.localState.contact,
        number,
        sms,
      }
      this.$store
        .dispatch('saveContact', {
          groupId: this.groupId,
          updatedContact: contact,
        })
        .then(() => {
          if (this.pendingFileDeletion)
            this.$store.dispatch('destroyImageFile', this.pendingFileDeletion)
          this.$emit('closeContact', {
            resetDirtyState: true,
            contactId: this.contactId,
            highlight: true,
            scrollIntoView: true,
          })
        })
    },
    cancelEdits() {
      this.initializeContact()
      this.$emit('closeContact', {
        resetDirtyState: false,
        contactId: this.contactId,
        scrollIntoView: true,
      })
    },
    deleteContact() {
      const onConfirm = () => {
        this.$emit('closeContact', { resetDirtyState: true }) // why won't this work in the .then cb below??
        this.$store.commit('SHOW_MODAL', {
          loading: true,
          heading: 'Are you sure you want to delete this contact?',
        })
        this.$store
          .dispatch('deleteContact', {
            groupIndex: this.groupIndex,
            contactId: this.contactId,
          })
          .then(() => {
            // this.$emit('cancelEdits')      // ...nerp..doesn't do shit here
            this.$store.dispatch('showSuccessModal', 'Contact deleted successfully')
            setTimeout(() => {
              this.$store.commit('CLOSE_MODAL')
            }, 1500)
          })
      }

      this.$store.commit('SHOW_MODAL', {
        heading: 'Are you sure you want to delete this contact?',
        onConfirm,
      })
    },
    duplicateContact() {
      if (this.contactIsDirty) {
        return this.$store.dispatch('showModal', {
          heading: 'Contact has unsaved changes',
          message: 'Please save or cancel contact edits before duplicating',
          confirmButtonLabel: 'OK',
          hideCancel: true,
        })
      }
      this.$store
        .dispatch('duplicateContact', { groupId: this.groupId, contactId: this.contactId })
        .then(({ id, tags }) => this.$emit('openSibling', { id, tags, scrollTo: true }))
    },
    onImageUpload({ url, fileName }) {
      this.$store.commit('SET_UPLOAD_BUFFER_URL', url)
      if (this.localState.contact.imageUrl)
        this.$store.dispatch('destroyImageFile', this.localState.contact.imageUrl)
      this.$store.dispatch('listenForScaledImage', { url, fileName })
      this.localState.contact.imageUrl = url
    },
    removeImage() {
      this.pendingFileDeletion = this.localState.contact.imageUrl
      this.localState.contact.imageUrl = ''
    },
    cleanDescription(description) {
      return description
        .replace(/<div>/g, '')
        .replace(/<\/div>/g, '')
        .replace(/(\r\n|\n|\r)/gm, ' ')
    },
    onCoordinateClick({ x, y, mapId }) {
      const existing = this.localState.contact.coordinates[mapId]
        ? this.localState.contact.coordinates[mapId]
        : null
      const radius =
        existing && existing && existing.split('}')[1] ? existing.split('}')[1] : ',{80,80'
      this.localState.contact.coordinates[mapId] = `{{${x},${y}}${radius}}}`
    },
    resetMapCoordinates(mapId) {
      delete this.localState.contact.coordinates[mapId]
    },
    phoneIsValid(number) {
      const regionCode = this.$store.state.resortMeta.country
      if (!number) return true
      if (number === '000') return true
      return this.getPn(number, regionCode).a.valid
    },
  },
}
</script>

<style lang="scss">
.edit-contact {
  padding-top: 0.6em;
}
.field .control:not(.no-expando) {
  flex-grow: 1;
}
.toggle-container,
.manage-image,
.proximate-pins,
.matching-pins,
div.control,
.editr {
  width: 100%;
  max-width: 480px;
}
.test-link {
  pointer-events: auto !important;
  cursor: pointer !important;
  a {
    color: black;
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
}
.field.toggle {
  margin-bottom: 0.26em;
}
.active-toggles {
  padding-bottom: 0;
  margin-bottom: 0.65em !important;
  .title {
    margin-bottom: 0.3em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #c3c3c3;
  }
  .field-label {
    flex-basis: 172px;
  }
  .field.toggle {
    margin-bottom: 0.2em;
  }
}

.editors-container {
  textarea {
    width: 480px;
    padding: 0.3em;
  }
}

.quill-editor {
  width: 480px;
  .ql-container {
    height: auto;
  }
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
      padding-top: 0.2em;
      font-size: 0.9em;
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
  margin-bottom: 0.75rem;
}
// Nearby and matching locations
.location-group {
  border: 1px solid grey;
  margin-bottom: 0.1em;
  padding: 0.2em 0.4em;
  border-radius: 6px;
  .location {
    display: flex;
    justify-content: space-between;
  }
}

.proximate-pins {
  .location-group {
    cursor: pointer;
    &:hover {
      background-color: #d0d0d0;
    }
  }
}

.invalid-form-warning {
  margin: 0.6em 0;
  text-align: right;
}
.bottom-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .duplicate {
    margin-bottom: 0 !important;
  }
}
</style>
