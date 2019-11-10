<template>
  <div class="tags">
    <site-header title="Manage Tags" />
  </div>
</template>

<script>
import { storage } from '../firebaseInit.js'
import SiteHeader from './SiteHeader.vue'

export default {
  name: 'Tags',
    components: {
    SiteHeader,
  },
  props: {
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<style scoped>
</style>
