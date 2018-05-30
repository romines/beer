<template>
  <div class="site-header">
    <div class="left">
      <router-link to="/"><img src="../assets/logo.png"></router-link>
    </div>
    <div class="right">
      <!-- <h3 class="sub-heading title is-3"> TODO: show resort name if superAdmin and not on /resorts
      </h3> -->
      <h1 class="title page-title">
        <slot name="title" />
      </h1>
    </div>

  </div>
</template>

<script>

export default {
  components: {
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
    .page-title {
      margin-left: 1em;
    }
  }
</style>
