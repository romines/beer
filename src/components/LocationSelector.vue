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
          <div
            v-for="image in images"
            class="thumb-container"
            :key="image.path">

            <span class="inner-container" :class="selectedMap === image.fileName ? 'selected' : ''">
              <span class="icon is-small remove">
                <i class="fas fa-times-circle" />
              </span>
              <img :src="image.path">
            </span>

          </div>
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
    selectedMap: {
      type: String
    }
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
        movable: true,
        navbar: false,
        loop: true,
        viewed: this.initializeMapClickability,
        zoomed: this.resetMap,
        moved: this.resetMap
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

      const bodyEl = document.querySelector('body')

      const addMapEventHandlers = () => {

        // pin drop click
        this.imageEl.addEventListener('click', e => {
          if (bodyEl.classList.contains('viewer-drag')) return
          e.stopPropagation()

          this.xCoordinate = Math.round(e.offsetX / this.zoomLevel)
          this.yCoordinate = Math.round(e.offsetY / this.zoomLevel)
          this.$emit('coordinateClick', {
            x: this.xCoordinate,
            y: this.yCoordinate,
            mapId: this.imageEl.getAttribute('alt')
          })

        })

        // shift key is down
        window.addEventListener('keydown', e => {
          if (!e.shiftKey) return
          bodyEl.classList.add('viewer-drag')
        })
        window.addEventListener('keyup', e => {
          bodyEl.classList.remove('viewer-drag')
        })

        // close map click(s)
        const mask = this.imageEl.parentElement
        mask.addEventListener('click', () => { this.showPin = false })
        document.querySelector('.viewer-close').addEventListener('click', () => { this.showPin = false })

        // toolbar click
        document.querySelectorAll('.viewer-toolbar li').forEach( el => el.addEventListener('click', this.resetMap) )

        // window resize
        window.addEventListener('resize', () => {
          console.log('Resize event handler!!!');
          this.resetMap()
        });
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
  .viewer {
    // overflow-x: auto;
    // white-space: nowrap;
    display: flex;

    .thumb-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30%;
      &:not(:first-child) { margin-left: .6em; }

      .inner-container {

        position: relative;

        &:not(.selected):not(:hover) {
          filter: grayscale(50%);
          &:after {
            content: " ";
            z-index: 10;
            display: inline-block;
            position: absolute;
            height: 100%;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.5);
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
        &:not(.selected) { .icon.remove { display: none; }}

      }

      img {
        filter: opacity(85%);
        width: 100%;
      }

    }
  }
  .map-pin {
    color: red;
    position: fixed;
    display: none;
    z-index: 2016;
  }
  .viewer-toolbar > ul > li {
    display: none;
    &.viewer-zoom-in          { display: inline; }
    &.viewer-zoom-out         { display: inline; }
    &.viewer-zoom-one-to-one  { display: inline; }
    &.viewer-reset            { display: inline; }
    &.viewer-prev             { display: inline; }
    &.viewer-next             { display: inline; }

  }
  .viewer-open .map-pin {
    display: inline-block;
    .svg-inline--fa {
      transform: translate(-50%, -100%);
    }
  }
  body:not(.viewer-drag) .viewer-move {
    cursor: default;
  }

</style>
