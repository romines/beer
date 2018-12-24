<template>
  <div class="site-header">
    <div class="left">
      <router-link to="/"><img src="../assets/logo.png"/></router-link>
    </div>
    <div class="right">
      <div class="back" v-if="showBack" @click="$router.go(-1)" title="Go Back">
        <span class="icon back is-small"> <i class="fas fa-arrow-left" /> </span>
        <span class="resort-name" v-show="$store.state.user.superAdmin">{{
          $store.state.resortMeta.name
        }}</span>
        <span class="resort-name" v-show="!$store.state.user.superAdmin">Back</span>
      </div>

      <h1 class="title page-title is-primary">{{ title }}</h1>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    title: {
      type: String,
    },
    subHeading: {
      type: String,
    },
  },
  data() {
    return {}
  },
  computed: {
    showBack() {
      if (this.$store.state.user.superAdmin) {
        return this.$route.path !== '/resorts'
      } else {
        return this.$route.path !== '/'
      }
    },
  },
  created() {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.site-header {
  padding-bottom: 0.6em;
  display: flex;
  align-items: flex-start;
  .right {
    margin-left: 1.3em;
    .back {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }
  }
}
</style>
