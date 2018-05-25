<template>
  <div class="home">

    <h1 class="title">
      <router-link to="/"><img src="../assets/logo.png"></router-link>
      <span class="page-title">
        Contact Management
      </span>
    </h1>

    <contacts />

  </div>
</template>

<script>
import Contacts from './Contacts'

export default {
  components: {
    Contacts
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
