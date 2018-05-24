<template>
  <div class="resorts">
    <h3>Resorts</h3>
    <ul>
      <li class="resort" v-for="resort in resorts" @click="goToResort(resort.resortId)">{{ resort.name }}</li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  components: {
  },
  data () {
    return {}
  },
  computed: {
    ...mapState([
      'resorts'
    ])

  },
  created () {
  },
  methods: {
    goToResort (resortId) {
      this.$router.push(`resorts/${resortId}`)
    }
  }
}
</script>

<style scoped>
</style>
