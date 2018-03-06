<template>
  <div class="edit-contact">

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Name - X: {{ xOffset }}, Y: {{ yOffset }}</label>
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

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Map Coordinates</label>
      </div>
      <div class="control">

        <viewer :options="viewerOptions.options" :images="viewerOptions.images"
                @inited="inited"
                class="viewer" ref="viewer">
          <img v-for="src in viewerOptions.images" :src="src" :key="src">
        </viewer>
      </div>
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
// import ImageViewer from './ImageViewer.vue'
import Viewer from "v-viewer/src/component.vue"
// import jh_village from '../assets/pixel_grid.png'
import jh_village from '../assets/jh_village.png'
let $viewerContainer
let $tooltip

export default {
  components: {
    Viewer
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
      xOffset: 0,
      yOffset: 0,
      localState: {
        contact: {}
      },
      viewerOptions: {
        images: [jh_village],
        options: {
          rotatable: false,
          movable: false,
          navbar: false,
          loop: true,
          shown: this.initializeMapClickWidget,
          hidden () { $('body').find('.map-pin').remove() }
        }
      }
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
    getZoomLevel ($tooltip) {
      const text = $tooltip.text()
      if (text === '') return 1
      return parseInt(text.substring(0, text.length - 1)) / 100
    },
    initializeMapClickWidget () {

      const addMapClickHandler = () => {
        $('body').off().on('click', 'img.viewer-transition', e => {
          // const img = $(e.target)[0]
          // const pixelHeight = img.naturalHeight
          // const pixelWidth = img.naturalWidth
          const zoomLevel = this.getZoomLevel($tooltip)
          this.xOffset = Math.round(e.offsetX / zoomLevel)
          this.yOffset = Math.round(e.offsetY / zoomLevel)
        })

        $viewerContainer.off().on('click', '.viewer-reset', () => {
          $tooltip.text('100%')
        })

      }

      const renderPin = () => {

        const $image = $viewerContainer.find('img.viewer-transition')
        const $body = $('body')
        const styles = $image.attr('style').split(';')
        const justTheNumber = str => str.substring(str.lastIndexOf(" ")+1, str.length - 2)
        const xMargin = parseFloat(styles.filter(str => str.indexOf('margin-left') > -1).map(justTheNumber)[0])
        const yMargin = parseFloat(styles.filter(str => str.indexOf('margin-top') > -1).map(justTheNumber)[0])

        setTimeout(() => {
          $body.append(`<span class="map-pin" style="top: ${yMargin}px; left: ${xMargin}px;"><i class="fas fa-map-pin" /></span>`)
        }, 600);
      }

      $viewerContainer = $('body').find('.viewer-container')
      $tooltip = $viewerContainer.find('.viewer-tooltip')
      addMapClickHandler()
      renderPin()

    },
    inited (viewer) {
      this.$viewer = viewer;
    },
    initializeContact () {
      this.localState.contact = Object.assign({}, this.contact)
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

    }
  }
}
</script>

<style lang="scss">
  div.control {
    max-width: 480px;
  }
  .map-pin {
    color: red;
    position: fixed;
    display: none;
    z-index: 2016;
  }
  .viewer-open .map-pin {
    display: inline-block;
    .svg-inline--fa {
      transform: translate(-50%, -100%);
    }
  }
  .edit-contact {
    padding-top: .6em;
  }
  .field .control:not(.no-expando) {
    flex-grow: 1;
  }
</style>
