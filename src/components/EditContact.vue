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
        <label class="label">SMS</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model="localState.contact.sms"
          class="input"
          placeholder="SMS">
        <span class="icon is-small is-left">
          <i class="fas fa-mobile-alt" />
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
      <div class="control has-icons-left">
        <input
          v-model="localState.contact.menu"
          class="input"
          placeholder="Menu URL">
        <span class="icon is-small is-left">
          <i class="fas fa-globe" />
        </span>
      </div>
    </div>

    <div class="field is-horizontal" v-show="localState.contact.dining">
      <div class="field-label is-normal">
        <label class="label">Reservations URL</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model="localState.contact.reservations"
          class="input"
          placeholder="Reservations URL">
        <span class="icon is-small is-left">
          <i class="fas fa-globe" />
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
      <wysiwyg v-model="localState.contact.z_detail" />
    </div>

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

// fields that might be missing should be initialized with default values to ensure reactivity
const contactDefaults = {
  rect :  '{{0,0}{80,80}}',
  mapId : 0,
  tags :  {
    summer: true,
    winter: true,
    dining: false
  },
  menu: '',
  sms: '',
  z_reservations: '',
  z_detail: ''
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
      this.localState.contact = Object.assign({...contactDefaults}, this.contact)
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
  .time-active-tags {
    display: flex;
    align-items: center;
    .tag {
      cursor: pointer;
      margin-top: .3em;
      margin-right: .3em;
      &:not(.selected) {
        opacity: .45;
      }
    }
  }
  .time-active-tags, .toggle-container {
    width: 100%;
  }
  .location-selector {
    margin-bottom: .75rem;
  }

  .editr { max-width: 480px; }
  .editr--toolbar div:nth-child(14) {
    display: none;
  }

  /* Toggle Switch
    *
    * Source: https://www.w3schools.com/howto/howto_css_switch.asp
    *
    * */
  .switch {
    transform: scale(.75);              // mod
    margin-left: -.45em;                // mod
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  /* Hide default HTML checkbox */
  .switch input {display:none;}

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }

  input:checked + .slider {
    background-color: #209cee;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #209cee;
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }

</style>
