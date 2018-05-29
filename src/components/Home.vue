<template>
  <div class="home">

    <site-header>
      <span slot="title">Contact Management</span>
    </site-header>

    <contacts />

  </div>
</template>

<script>
import Contacts from './Contacts'
import SiteHeader from './SiteHeader'

export default {
  components: {
    Contacts,
    SiteHeader
  },
  data () {
    return {
    }
  },
  computed: {

  },
  created () {
  },
  methods: {

  }
}
</script>

<style scoped>
</style>
