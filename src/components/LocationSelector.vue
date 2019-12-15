<template>
  <div class="location-selector">
    <span
      class="map-pin"
      v-show="showPin"
      :style="{ top: yPinLocation + 'px', left: xPinLocation + 'px' }"
    >
      <i class="fas fa-map-marker-alt" />
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
          <div class="tabs is-boxed map-selectors">
            <ul>
              <li
                v-for="map in maps"
                :key="map.id"
                class="tab map-name-container"
                :class="{'is-active': activeMapId === map.id}"
                @click="selectMap(map.id)"
              >
                <a class="map-name">{{ map.name }}</a>
              </li>
            </ul>
          </div>
          <div
            class="tab-contents"
            v-for="map in maps"
            :key="map.id"
            v-show="activeMapId === map.id"
          >
            <div class="map-container" :class="validMapCoordinatesExist(map.id) ? 'selected' : ''">
              <span class="icon is-small remove" @click="$emit('resetMapCoordinates', map.id)">
                <i class="fas fa-times-circle" />
              </span>
              <img :src="map.url" />
            </div>
            <div class="coordinate-info">
              <div class="map-name">{{map.name}}</div>
              <div class="map-id">Map ID: {{map.id}}</div>
              <div
                class="coordinates"
                v-if="coordinates[map.id]"
              >Coordinates: {{`${getCoordinates(coordinates[map.id]).x}, ${getCoordinates(coordinates[map.id]).y}`}}</div>
            </div>
          </div>

          <div class="field is-horizontal" v-if="matchingLocations && matchingLocations.length">
            <div class="matching-pins">
              <div class="proximity-warning">
                <div
                  class="heading"
                >This contact shares coordinates for this map with the following contact(s)</div>
              </div>
              <ul class="location-group">
                <li class="location" v-for="location in matchingLocations" :key="location.id">
                  <span class="name">{{ location.name }}</span>
                  <!-- <span class="coordinates">({{ location.x }}, {{ location.y }})</span> -->
                </li>
              </ul>
            </div>
          </div>

          <div
            class="field is-horizontal"
            v-if="groupedNearbyLocations && Object.keys(groupedNearbyLocations).length"
          >
            <div class="proximate-pins">
              <div class="proximity-warning">
                <div class="heading">
                  <span class="warning-title">
                    <strong>NOTICE: Nearby locations exist.</strong>
                  </span>
                  <span class="coordinates" v-if="myCoordinates.x || myCoordinates.y">
                    Selected coordinates: ({{ myCoordinates.x }},
                    {{ myCoordinates.y }})
                  </span>
                </div>
              </div>
              <ul
                class="location-group"
                v-for="(group, key) in groupedNearbyLocations"
                @click="locationGroupClick(group)"
                :key="key"
              >
                <li class="location" v-for="location in group" :key="location.name">
                  <span class="name">{{ location.name }}</span>
                  <span class="coordinates">({{ location.x }}, {{ location.y }})</span>
                </li>
              </ul>
              <small>
                Click location(s) above to apply existing coordinates. This ensures contacts which share a
                location appear together on the map
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
import uuid from 'uuid/v4'

export default {
  components: { Viewer },
  props: {
    contactId: {
      type: String,
    },
    coordinates: {
      type: Object,
    },
    flattenedContacts: {
      type: Array,
    },
  },
  data() {
    return {
      hidePin: true,
      activeMapId: 0,
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
  mounted() {
    this.setActiveMapId()
  },
  computed: {
    xPinLocation() {
      return this.xMargin + this.xCoordinate * this.zoomLevel
    },
    yPinLocation() {
      return this.yMargin + this.yCoordinate * this.zoomLevel
    },
    showPin() {
      return (this.xCoordinate || this.yCoordinate) && !this.hidePin
    },
    maps() {
      return this.$store.state.maps.maps.filter(map => map.active)
    },
    activeMap() {
      if (!this.$store.state.maps.maps) {
        return {}
      } else {
        return this.$store.state.maps.maps.find(map => map.id === this.activeMapId)
      }
    },
    myCoordinates() {
      return this.getCoordinates(this.coordinates[this.activeMapId])
    },
    nearbyLocations() {
      const isMatch = contact => {
        if (!contact.coordinates || !contact.coordinates[this.activeMapId] || !this.myCoordinates)
          return false
        const testCoords = this.getCoordinates(contact.coordinates[this.activeMapId])
        return (
          contact.id !== this.contactId && // not same contact
          (testCoords.x !== this.myCoordinates.x || testCoords.y !== this.myCoordinates.y) && // not exact match
          Math.abs(testCoords.x - this.myCoordinates.x) < 81 && // within tolerance
          Math.abs(testCoords.y - this.myCoordinates.y) < 81
        )
      }
      return this.flattenedContacts.filter(isMatch).map(this.contactToLocation)
    },
    matchingLocations() {
      if (!this.myCoordinates) return
      if (!(this.myCoordinates.x && this.myCoordinates.y)) return []

      return this.flattenedContacts
        .filter(contact => {
          if (!contact.coordinates || !contact.coordinates[this.activeMapId] || !this.myCoordinates)
            return false
          if (contact.id === this.contactId) return false
          const testCoords = this.getCoordinates(contact.coordinates[this.activeMapId])
          return this.myCoordinates.x === testCoords.x && this.myCoordinates.y === testCoords.y
        })
        .map(this.contactToLocation)
    },
    groupedNearbyLocations() {
      return this.nearbyLocations.reduce((acc, coordinateObject) => {
        const coordString = coordinateObject.x.toString() + coordinateObject.y.toString()
        if (!acc[coordString]) acc[coordString] = []
        acc[coordString].push(coordinateObject)
        return acc
      }, {})
    },
  },
  methods: {
    initializeViewer(viewer) {
      this.$viewer = viewer
    },
    initializeCoordinates() {
      this.xCoordinate = 0
      this.yCoordinate = 0
      if (!(this.activeMap && this.coordinates)) return
      const { x, y } = this.getCoordinates(this.coordinates[this.activeMapId])
      this.xCoordinate = x
      this.yCoordinate = y
    },
    getZoomLevel() {
      this.zoomLevel =
        this.viewerDOM.currentImage.scrollWidth / this.viewerDOM.currentImage.naturalWidth
    },
    getCoordinates(coordinateString) {
      if (!coordinateString) {
        return { x: 0, y: 0 }
      }
      const str = coordinateString.split('}')[0]
      return {
        x: parseInt(str.substring(2, str.indexOf(','))),
        y: parseInt(str.substring(str.indexOf(',') + 1, str.length)),
      }
    },
    contactToLocation({ name, coordinates }) {
      const { x, y } = this.getCoordinates(coordinates[this.activeMapId])
      return {
        name,
        id: uuid(),
        x,
        y,
      }
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
    selectMap(id) {
      this.activeMapId = parseInt(id)
    },
    setActiveMapId() {
      if (!(this.maps && this.maps.length)) return
      if (this.coordinates && Object.keys(this.coordinates).length) {
        const mapIdsWithCoordinates = this.maps
          .map(({ id }) => id)
          .filter(id =>
            !!Object.keys(this.coordinates).find(
              idFromCoordinats => parseInt(idFromCoordinats) === id
            )
          )
        if (mapIdsWithCoordinates.length === 1) {
          return this.selectMap(mapIdsWithCoordinates[0])
        }
        if (mapIdsWithCoordinates.length === 2) {
          // select newer map if two exist
          return this.selectMap(mapIdsWithCoordinates.sort((a, b) => parseInt(b) - parseInt(a))[0])
        }
      }
      this.selectMap(this.maps[this.maps.length - 1].id)
    },
    onMapViewed({ detail }) {
      // calling this.selectMap() is necessary because viewer allows scrolling through maps
      //
      // alternative to parsing filename and finding map ID this way:
      // use a slot withing (v-viewer) <viewer /> component to allow wrapping <img /> with
      // arbitrary markup. attach id with a data-id attribute which we could read of this
      // event 'detail'

      if (this.getMapIdFromAlt(detail.image.alt))
        this.selectMap(this.getMapIdFromAlt(detail.image.alt))

      document.querySelector('.viewer-canvas img').addEventListener('pointerdown', e => {
        this.mapMargins.marginLeft = e.target.style.marginLeft
        this.mapMargins.marginTop = e.target.style.marginTop
      })

      this.viewerDOM.currentImage = document.querySelector(`[alt="${detail.image.alt}"]`)
      this.initializeCoordinates()
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
              mapId: this.activeMapId,
            })
            this.showHidePersistButtons()
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
            // remove coordinates click
            this.$emit('coordinateClick', { x: 0, y: 0, mapId: this.activeMapId })
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
      this.showHidePersistButtons()
    },

    showHidePersistButtons() {
      if (this.xCoordinate || this.yCoordinate) {
        this.viewerDOM.saveCancelButtons.forEach(el => el.classList.remove('inactive'))
      } else {
        this.viewerDOM.saveCancelButtons.forEach(el => el.classList.add('inactive'))
      }
    },

    locationGroupClick(group) {
      this.$emit('coordinateClick', {
        x: group[0].x,
        y: group[0].y,
        mapId: this.activeMapId,
      })
      this.$store.dispatch('showSuccessModal', 'Coordinates applied successfully')
    },

    validMapCoordinatesExist(mapId) {
      const { x, y } = this.getCoordinates(this.coordinates[mapId])
      return !!(x || y)
    },
    getMapIdFromAlt(altText) {
      return this.maps.filter(({ url }) => {
        const mapInStoreSlug = url.split('2Fmap_files%2Fmap_')[1].substring(0, 13)
        const mapViewedSlug = altText.split('2Fmap_files%2Fmap_')[1].substring(0, 13)
        return mapInStoreSlug === mapViewedSlug
      })[0].id
    },
  },
}
</script>

<style lang="scss">
.tabs.map-selectors {
  .map-name-container {
    .map-name {
      font-size: 0.9em;
      display: inline-block;
      max-width: 13em;
      flex-grow: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
}

div.control {
  max-width: 480px;
}
.viewer {
  padding-bottom: 1.1em;

  .tab-contents {
    display: flex;
    align-items: center;

    .map-container {
      position: relative;
      flex-basis: 45%;

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

    .coordinate-info {
      padding-left: 1.6em;
      font-size: 0.87em;
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
