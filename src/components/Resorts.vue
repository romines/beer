<template>
  <div class="resorts">

    <site-header title="Resorts" />

    <ul>
      <li class="resort box" v-for="resort in resorts" @click="goToResort(resort.resortId)">
        <span class="name">{{ resort.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import SiteHeader from './SiteHeader.vue'
export default {
  components: {
    SiteHeader
  },
  data () {
    return {}
  },
  computed: {
    resorts () {
      return this.$store.state.resorts.slice().sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      })
    }
  },
  created () {
  },
  methods: {
    goToResort (resortId) {
      this.$store.commit('SET_LOADING_STATE', true)
      this.$router.push(`resorts/${resortId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.resorts {
  .resort {
    cursor: pointer;
    &.box:not(:last-child) {
      margin-bottom: .88rem;
    }
  }
}
</style>
