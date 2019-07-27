<template>
  <div class="maps">
    <site-header title="Manage Maps" />
    <map-manager
      :maps="$store.state.maps.maps"
      :path-prefix="$store.state.resortId"
      @mapUpload="onMapUpload"
      @nameChange="onNameChange"
      @removeMap="onMapRemove"
    >
      <template v-slot:default="slotProps">
        <div class="id">id: {{slotProps.map.id}}</div>
        <div class="toggle-container">
          <span class="the-label">active:</span>
          <label
            for="active"
            class="switch"
            @click.stop.prevent="toggleActive(slotProps.map.id, !slotProps.map.active)"
          >
            <input id="active" type="checkbox" v-model="slotProps.map.active" />
            <span class="slider round" />
          </label>
        </div>
        <div class="map-actions">
          <span @click="onMapRemove(slotProps.map.id)">remove</span>
          <image-upload
            file-name-prefix="map_"
            :path-prefix="`${$store.state.resortId}/map_files/`"
            button-label="Add a map..."
            @uploadComplete="({ url }) => onMapReplaceUpload(slotProps.map.id, url)"
            ref="replaceUploader"
          >
            <template v-slot:cta>
              <span>replace</span>
            </template>
          </image-upload>
        </div>
      </template>
    </map-manager>
  </div>
</template>

<script>
import SiteHeader from './SiteHeader.vue'
import MapManager from './MapManager.vue'
import ImageUpload from './ImageUpload.vue'
export default {
  components: {
    ImageUpload,
    SiteHeader,
    MapManager,
  },
  computed: {
    numberOfActiveMaps() {
      return this.$store.state.maps.maps.filter(map => map.active).length
    },
  },
  methods: {
    onMapUpload({ id, url, name }) {
      this.$store.dispatch('saveNewMap', { id, url, name, active: this.numberOfActiveMaps < 2 })
    },
    onMapReplaceUpload(id, url) {
      this.$store.dispatch('updateMap', { id, url })
    },
    onMapRemove(mapId) {
      this.$store.commit('SHOW_MODAL', {
        heading: 'Are you sure you want to delete this map?',
        message: 'References to it may still exist. Consider marking inactive instead.',
        onConfirm: () => {
          this.$store.dispatch('deleteMap', mapId)
          this.$store.commit('CLOSE_MODAL')
        },
      })
    },
    toggleActive(id, val) {
      if (val && this.numberOfActiveMaps > 1) {
        this.$store.dispatch('showModal', {
          heading: 'A maximum of two maps may be active at a time',
          message: 'Please mark another map as inactive and try again',
          confirmButtonLabel: 'OK',
          hideCancel: true,
        })
      } else {
        this.$store.dispatch('updateMap', { id, active: val })
      }
    },
    onNameChange({ index, val }) {
      this.$store.dispatch('updateMap', { id: this.$store.state.maps.maps[index].id, name: val })
    },
  },
}
</script>

<style scoped lang="scss">
.toggle-container {
  display: flex;
  align-items: center;
  .the-label {
    margin-right: 1em;
  }
}
.map-actions {
  font-size: 0.9em;
  span {
    cursor: pointer;
    margin-right: 1.6em;
  }
  /deep/ label { margin-top: 0; }
  .coming-soon {
    opacity: 0.7;
  }
}
</style>
