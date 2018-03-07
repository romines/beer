<template>
  <div class="location-selector">
    <span class="map-pin" v-show="showPin" :style="{top: yPinLocation + 'px', left: xPinLocation + 'px'}"><i class="fas fa-map-pin" /></span>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Map Coordinates</label>
      </div>
      <div class="control">

        <viewer :options="viewerOptions" :images="images"
                class="viewer" ref="viewer">
          <img v-for="src in images" :src="src" :key="src">
        </viewer>
      </div>
    </div>

  </div>
</template>

<script>
import Viewer from "v-viewer/src/component.vue"

export default {
  components: { Viewer },
  props: {
    images: {
      type: Array
    },
    coordinateString: {
      type: String
    },
  },
  data () {
    return {
      showPin: false,
      imageEl: document.createElement('img'),
      xMargin: 0,
      yMargin: 0,
      xCoordinate: 0,
      yCoordinate: 0,
      zoomLevel: 1,
      viewerOptions: {
        rotatable: false,
        movable: false,
        navbar: false,
        loop: true,
        viewed: this.initializeMapClickability,
        zoomed: this.resetMap,
      }
    }
  },
  computed: {
    xPinLocation () {
      return this.xMargin + this.xCoordinate * this.zoomLevel
    },
    yPinLocation () {
      return this.yMargin + this.yCoordinate * this.zoomLevel
    }
  },

  watch: {
    // re-initialize localState if coordinateString prop changes
    coordinateString () {
      this.initializeCoordinates()
    }
  },
  created () {
    this.initializeCoordinates()
  },
  methods: {
    initializeCoordinates () {
      const str = this.coordinateString.split('}')[0]
      this.xCoordinate = str.substring(2, str.indexOf(','))
      this.yCoordinate = str.substring(str.indexOf(',') + 1, str.length)
    },

    setZoomLevel () {
      this.zoomLevel = this.imageEl.scrollWidth / this.imageEl.naturalWidth
    },

    setMarginOffset () {
      const justTheNumber = str => str.substring(str.lastIndexOf(" ")+1, str.length - 2)
      const styles = this.imageEl.getAttribute('style').split(';')
      this.xMargin = parseFloat(styles.filter(str => str.indexOf('margin-left') > -1).map(justTheNumber)[0])
      this.yMargin = parseFloat(styles.filter(str => str.indexOf('margin-top') > -1).map(justTheNumber)[0])
    },


    initializeMapClickability () {

      const addMapEventHandlers = () => {

        // pin drop click
        this.imageEl.addEventListener('click', e => {
          e.stopPropagation()
          this.xCoordinate = Math.round(e.offsetX / this.zoomLevel)
          this.yCoordinate = Math.round(e.offsetY / this.zoomLevel)
        })

        // close map click(s)
        const mask = this.imageEl.parentElement
        mask.addEventListener('click', () => { this.showPin = false })
        document.querySelector('.viewer-close').addEventListener('click', () => { this.showPin = false })

        // toolbar click
        document.querySelectorAll('.viewer-toolbar li').forEach( el => el.addEventListener('click', this.resetMap) )

        // window resize
        window.addEventListener('resize', this.resetMap);
      }

      this.imageEl = document.querySelector('img.viewer-transition')
      this.resetMap()
      addMapEventHandlers()

    },

    resetMap () {
      this.showPin = false
      setTimeout(() => {
        this.setZoomLevel()
        this.setMarginOffset()
        this.showPin = true;
      }, 600)
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
  .viewer-toolbar > ul > li {
    display: none;
    &.viewer-zoom-in { display: inline; }
    &.viewer-zoom-out { display: inline; }
    &.viewer-zoom-one-to-one { display: inline; }
    &.viewer-reset { display: inline; }
    &.viewer-prev { display: inline; }
    &.viewer-next { display: inline; }

  }
  .viewer-open .map-pin {
    display: inline-block;
    .svg-inline--fa {
      transform: translate(-50%, -100%);
    }
  }
</style>
