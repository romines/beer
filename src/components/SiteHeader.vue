<template>
  <div class="site-header">
    <div class="right">
      <div class="back" v-if="showBack" @click="$router.go(-1)" title="Go Back">
        <span class="icon back is-small"> <i class="fas fa-arrow-left" /> </span>
        <span class="resort-name" v-show="currentUser.superAdmin">{{
          $store.state.resortMeta.name
        }}</span>
        <span class="resort-name" v-show="!currentUser.superAdmin">Back</span>
      </div>

      <h1 class="title page-title is-primary">{{ title }}</h1>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

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
    ...mapGetters(['currentUser']),
    showBack() {
      if (this.currentUser.superAdmin) {
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
  padding-bottom:         0.6em;
  display:                flex;
  align-items:            flex-start;

  .right {

    .back {
      display:            flex;
      align-items:        center;
      justify-content:    space-between;
      cursor:             pointer;
    }
  }
}
</style>
