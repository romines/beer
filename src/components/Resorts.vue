<template>
  <div class="resorts">
    <h1 class="title">
      <router-link to="/"><img src="../assets/logo.png"></router-link>
      <span class="page-title">
        Resort Management
      </span>
    </h1>
    <ul>
      <li class="resort box" v-for="resort in resorts" @click="goToResort(resort.resortId)">
        <span class="name">{{ resort.name }}</span>
      </li>
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

<style lang="scss" scoped>
.resorts {
  .resort.box:not(:last-child) {
    margin-bottom: .88rem;
  }
}
</style>
