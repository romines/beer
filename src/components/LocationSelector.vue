<template>
  <div class="location-selector">
    <span
      class="map-pin"
      v-show="showPin"
      :style="{ top: yPinLocation + 'px', left: xPinLocation + 'px' }"
    >
      <i class="fas fa-map-marker-alt"/>
    </span>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Map Coordinates</label>
      </div>

      <div class="control">
        <viewer
          :options="viewerOptions"
          :images="maps"
          @inited="initializeViewer"
          class="viewer"
          ref="viewer"
        >
          <div class="tabs is-boxed">
            <ul>
              <li
                v-for="(map, index) in maps"
                :key="map.id"
                class="tab"
                :class="{'is-active': index === 0}"
              >
                <a class="map-name">{{ map.name }}</a>
              </li>
            </ul>
          </div>
          <div class="thumb-container" v-for="(map, index) in maps" :key="map.id">
            <div class="inner-container" :class="validMapCoordinatesExist(index) ? 'selected' : ''">
              <span class="icon is-small remove" @click="$emit('resetMapCoordinates')">
                <i class="fas fa-times-circle"/>
              </span>
              <img :src="map.url">
              <small v-if="mapId == index">
                <span class="marker"> <i class="fas fa-map-marker-alt" /> </span>
                {{ `(${xCoordinate}, ${yCoordinate})` }}
              </small>
            </div>
          </div>
        </viewer>
      </div>
    </div>
  </div>
</template>

<script>
import Viewer from 'v-viewer/src/component.vue'
import 'viewerjs/dist/viewer.css'

export default {
  components: { Viewer },
  props: {
    coordinateString: {
      type: String,
    },
    mapId: {
      type: Number,
    },
  },
  data() {
    return {
      hidePin: true,
      viewingMapIndex: -1,
      xMargin: 0,
      yMargin: 0,
      xCoordinate: 0,
      yCoordinate: 0,
      zoomLevel: 1,
      viewerOptions: {
        rotatable: false,
        movable: true,
        navbar: false,
        loop: true,
        ready: this.initializeMapUI,
        viewed: this.onMapViewed,
        zoomed: this.resetMapUI,
        moved: this.resetMapUI,
      },
      viewerDOM: {
        bodyEl: document.querySelector('body'),
        currentImage: document.createElement('img'),
        saveCancelButtons: document.createDocumentFragment().childNodes,
      },
      mapMargins: {
        marginLeft: 0,
        marginTop: 0,
      },
    }
  },
  computed: {
    xPinLocation() {
      return this.xMargin + this.xCoordinate * this.zoomLevel
    },
    yPinLocation() {
      return this.yMargin + this.yCoordinate * this.zoomLevel
    },
    showPin() {
      return (
        (this.xCoordinate || this.yCoordinate) &&
        this.mapId === this.viewingMapIndex &&
        !this.hidePin
      )
    },
    maps() {
      // return this.$store.state.resortMeta.mapFiles.map(fileName => imageDefinitions[fileName])
      return this.$store.state.resortMeta.maps.filter(map => map.active)
    },
  },

  watch: {
    // re-initialize localState when new values come down from above
    coordinateString: {
      immediate: true,
      handler() {
        this.initializeCoordinates()
        this.toggleButtonState()
      },
    },
    mapId: {
      immediate: true,
      handler() {
        this.initializeMapId()
      },
    },
  },
  methods: {
    initializeViewer(viewer) {
      this.$viewer = viewer
    },
    initializeCoordinates() {
      const str = this.coordinateString.split('}')[0]
      this.xCoordinate = parseInt(str.substring(2, str.indexOf(',')))
      this.yCoordinate = parseInt(str.substring(str.indexOf(',') + 1, str.length))
    },
    initializeMapId() {
      this.viewingMapIndex = this.mapId
    },

    getZoomLevel() {
      this.zoomLevel =
        this.viewerDOM.currentImage.scrollWidth / this.viewerDOM.currentImage.naturalWidth
    },

    getMarginOffset() {
      const justTheNumber = str => str.substring(str.lastIndexOf(' ') + 1, str.length - 2)
      const styles = this.viewerDOM.currentImage.getAttribute('style').split(';')
      this.xMargin = parseFloat(
        styles.filter(str => str.indexOf('margin-left') > -1).map(justTheNumber)[0]
      )
      this.yMargin = parseFloat(
        styles.filter(str => str.indexOf('margin-top') > -1).map(justTheNumber)[0]
      )
    },

    onMapViewed({ detail }) {
      // TODO initialize all handlers here? compose with component methods?
      document.querySelector('.viewer-canvas img').addEventListener('pointerdown', e => {
        this.mapMargins.marginLeft = e.target.style.marginLeft
        this.mapMargins.marginTop = e.target.style.marginTop
      })
      this.viewingMapIndex = detail.index
      this.viewerDOM.currentImage = document.querySelector(`[alt="${detail.image.alt}"]`)
      this.resetMapUI()
    },

    initializeMapUI() {
      const insertSaveCancelButtons = () => {
        const markupString = `
          <li class="accept persistence" title="Accept placement">
            <span><i class="fas fa-save"></i></span>
          </li>
          <li class="clear persistence" title="Clear pin">
            <span><i class="fas fa-minus-circle"></i></span>
          </li>
        `
        const controls = document.querySelector('.viewer-toolbar ul')
        controls.insertBefore(
          document.createRange().createContextualFragment(markupString),
          controls.firstElementChild
        )
        this.viewerDOM.saveCancelButtons = document.querySelectorAll('.persistence')
      }

      const addMapEventHandlers = () => {
        // pin placement
        document.body.addEventListener('pointerup', e => {
          if (!e.target.matches('.viewer-canvas img')) return

          if (
            e.target.style.marginLeft === this.mapMargins.marginLeft &&
            e.target.style.marginTop === this.mapMargins.marginTop
          ) {
            this.xCoordinate = Math.round(e.offsetX / this.zoomLevel)
            this.yCoordinate = Math.round(e.offsetY / this.zoomLevel)
            this.$emit('coordinateClick', {
              x: this.xCoordinate,
              y: this.yCoordinate,
              mapIndex: this.viewingMapIndex,
            })
            this.toggleButtonState()
          } else {
            // pointerup followed drag event
            this.resetMapUI()
          }
        })

        // save/cancel click
        const handleSaveCancel = e => {
          if (e.target.closest('.persistence').classList.contains('inactive')) return
          if (e.target.closest('.persistence').classList.contains('accept')) {
            this.hidePin = true
            this.$viewer.hide()
          } else {
            this.$emit('coordinateClick', { x: 0, y: 0, mapIndex: this.viewingMapIndex })
          }
        }
        this.viewerDOM.saveCancelButtons.forEach(el =>
          el.addEventListener('click', handleSaveCancel)
        )

        // close map click(s)
        const hidePin = e => {
          if (e.target.nodeName === 'IMG') return
          this.hidePin = true
        }
        document.querySelector('.viewer-canvas').addEventListener('click', hidePin)
        document.querySelector('.viewer-close').addEventListener('click', hidePin)

        // toolbar button click
        document
          .querySelectorAll('.viewer-zoom-in, .viewer-zoom-out, .viewer-one-to-one, .viewer-reset')
          .forEach(el => el.addEventListener('click', this.resetMapUI))

        // window resize
        window.addEventListener('resize', () => {
          this.resetMapUI()
        })
      }

      insertSaveCancelButtons()
      addMapEventHandlers()
    },

    resetMapUI() {
      this.hidePin = true
      setTimeout(() => {
        this.getZoomLevel()
        this.getMarginOffset()
        this.hidePin = false
      }, 600)
      this.toggleButtonState()
    },

    toggleButtonState() {
      if ((this.xCoordinate || this.yCoordinate) && this.mapId === this.viewingMapIndex) {
        this.viewerDOM.saveCancelButtons.forEach(el => el.classList.remove('inactive'))
      } else {
        this.viewerDOM.saveCancelButtons.forEach(el => el.classList.add('inactive'))
      }
    },

    validMapCoordinatesExist(index) {
      return this.mapId === index && (this.xCoordinate || this.yCoordinate)
    },
  },
}
</script>

<style lang="scss">
.map-name {
  font-size: 1em;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 16em;
}

div.control {
  max-width: 480px;
}
.viewer {
  padding-bottom: 1.1em;

  .thumb-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30%;
    &:not(:first-child) {
      margin-left: 0.6em;
    }

    .inner-container {
      position: relative;

      small {
        position: absolute;
        display: inline-block;
        padding-top: 0.2em;
        .marker {
          opacity: 0.65;
          margin-right: 0.5em;
        }
      }

      &:not(.selected) {
        filter: grayscale(50%);
        &:after {
          pointer-events: none;
          content: ' ';
          z-index: 10;
          display: inline-block;
          position: absolute;
          height: 100%;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.32);
        }
      }

      .icon.remove {
        position: absolute;
        z-index: 10;
        top: -6px;
        left: -6px;
        &:hover {
          color: red;
        }
      }
      &:not(.selected) {
        .icon.remove {
          display: none;
        }
      }
    }

    img {
      filter: opacity(85%);
      width: 100%;
    }
  }
}

.map-pin {
  color: #002bff;
  position: fixed;
  display: none;
  z-index: 2016;
}

.viewer-footer {
  color: white;
  p.pan-notice {
    span.inner {
      display: inline-block;
      padding: 0.3em;
      margin-bottom: 0.6em;
      background: rgba(0, 0, 0, 0.32);
    }
    font-size: 16px;
    line-height: 16px;
  }
  .viewer-toolbar > ul {
    padding: 10px 0;
    overflow: visible;
    & > li {
      &.viewer-play {
        display: none;
      }
      &[class^='viewer-flip-'] {
        display: none;
      }
      &.inactive {
        opacity: 0.5;
        filter: grayscale(100%);
      }
      &.accept,
      &.clear {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        transform: translateY(-8px);
        width: 40px;
        height: 40px;
        font-size: 16px;
        line-height: 16px;
      }
      // &.accept { color: green; }
      // &.clear { color: red; }
    }
  }
}
.viewer-open .map-pin {
  display: inline-block;
  font-size: 22px;
  .svg-inline--fa {
    transform: translate(-50%, -100%);
  }
}
body:not(.viewer-drag) .viewer-move {
  cursor: default;
}
</style>
