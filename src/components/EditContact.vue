<template>
  <div class="edit-contact">

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Name</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model="localState.contact.name"
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
        <input
          v-model="localState.contact.number"
          class="input"
          placeholder="Phone (w/ country code)">
        <span class="icon is-small is-left">
          <i class="fas fa-phone" />
        </span>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Website</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model="localState.contact.url"
          class="input"
          placeholder="Website">
        <span class="icon is-small is-left">
          <i class="fas fa-globe" />
        </span>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Email Address</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model="localState.contact.mailto"
          class="input"
          placeholder="Email Address">
        <span class="icon is-small is-left">
          <i class="fas fa-envelope" />
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

    <div class="field is-grouped is-grouped-right">
      <p class="control no-expando">
        <a class="button is-primary" @click="saveContact">
          Save
        </a>
      </p>
      <p class="control no-expando">
        <a class="button is-light" @click="initializeContact(); $emit('cancelEdits')">
          Cancel
        </a>
      </p>
      <p class="control no-expando" v-show="contactIndex !== -1">
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
import LocationSelector from './LocationSelector.vue'
import pixel_grid from '../assets/pixel_grid.png'
import jh_village from '../assets/jh_village.png'
const mapDefaults = {
  rect :  '{{0,0}{80,80}}',
  mapId : 0
}

export default {
  components: {
    LocationSelector
  },
  props: {
    contact: {
      type: Object
    },
    groupIndex: {
      type: Number
    },
    contactIndex: {
      type: Number
    },
  },
  data () {
    return {
      localState: {
        contact: {}
      },
      images: [
        {
          fileName: 'jh_village.png',
          path: jh_village
        },{
          fileName: 'pixel_grid.png',
          path: pixel_grid
        }
      ],
    }
  },

  watch: {
    // re-initialize localState when 'contact' prop changes
    contact () {
      this.initializeContact()
    }
  },
  created () {
    this.initializeContact()
  },
  methods: {
    initializeContact () {
      this.localState.contact = Object.assign({...mapDefaults}, this.contact)
    },
    saveContact () {
      this.$store.dispatch('saveContact', {
        groupIndex: this.groupIndex,
        contactIndex: this.contactIndex,
        updatedContact: this.localState.contact
      })
      this.$emit('cancelEdits')
    },
    deleteContact () {

      const onConfirm = () => {
        this.$emit('cancelEdits') // why won't this work in the .then cb below??
        this.$store.commit('SHOW_MODAL', { loading: true, heading: 'Are you sure you want to delete this contact?' })
        this.$store.dispatch('deleteContact', {
          groupIndex: this.groupIndex,
          contactIndex: this.contactIndex
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

    onCoordinateClick ({ x, y, mapIndex }) {
      this.localState.contact.rect = `{{${x},${y}}}${this.localState.contact.rect.split('}')[1]}}}`
      this.localState.contact.mapId = mapIndex
    },

    resetMapCoordinates () {
      this.localState.contact = {...this.localState.contact, ...mapDefaults}
    }
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
</style>
