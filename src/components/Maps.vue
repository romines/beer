<template>
  <div class="map-manager">
    <site-header title="Manage Maps" />
    <div>Maps View</div>
    <map-manager @mapAdded="onMapAdded" />
  </div>
</template>

<script>
import { SiteHeader, MapManager } from './'
export default {
  components: {
    SiteHeader,
    MapManager,
  },
  methods: {
    onMapAdded(foo, bar) {
      debugger
    },
  },
}
</script>

<style scoped lang="scss"></style>
