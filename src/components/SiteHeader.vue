<template>
  <div class="site-header">
    <div class="left">
      <router-link to="/"><img src="../assets/logo.png"></router-link>
    </div>
    <div class="right">

      <div class="super-admin-nav" v-if="$route.name === 'resort'">
        <span class="icon back is-small" @click="$router.push('/')" title="Back to All Resorts">
          <i class="fas fa-arrow-left"/>
        </span>
        <span class="resort-name">{{ $store.state.resortMeta.name }}</span>
      </div>

      <h1 class="title page-title is-primary">{{ title }}</h1>
    </div>

  </div>
</template>

<script>

export default {
  components: {
  },
  props: {
    title: {
      type: String
    },
    subHeading: {
      type: String
    },
  },
  data () {
    return {}
  },
  computed: {
  },
  created () {
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
  .site-header {
    padding-bottom: .6em;
    display: flex;
    align-items: flex-start;
    .right {
      margin-left: 1.3em;
      .super-admin-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
</style>
