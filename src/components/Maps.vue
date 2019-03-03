<template>
  <div class="maps">
    <site-header title="Manage Maps" />
    <map-manager :path-prefix="$store.state.resortId" @removeMap="onMapRemove" />
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
    onMapRemove({ url, index }) {
      debugger
    },
  },
}
</script>

<style scoped lang="scss"></style>
