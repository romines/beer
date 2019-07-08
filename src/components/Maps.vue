<template>
  <div class="maps">
    <site-header title="Manage Maps" />
    <map-manager
      :maps="$store.state.maps.maps"
      :path-prefix="$store.state.resortId"
      @mapUpload="onMapUpload"
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
          <span>remove</span>
          <span>replace</span>
        </div>
      </template>
    </map-manager>
  </div>
</template>

<script>
import SiteHeader from './SiteHeader.vue'
import MapManager from './MapManager.vue'
export default {
  components: {
    SiteHeader,
    MapManager,
  },
  methods: {
    onMapUpload({ url, index }) {
      debugger
    },
    onMapRemove(mapId) {
      debugger
    },
    toggleActive(id, val) {
      debugger
      if (val && numActive > 1) alert('active  map limit warning')
      console.log({ id, val })
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
</style>
