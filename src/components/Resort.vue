<template>
  <div class="resorts">
    <h1 class="title">
      <router-link to="/"><img src="../assets/logo.png"></router-link>
      <span class="page-title">
        <span class="icon back is-small" @click="goBack" title="Back to All Resorts">
          <i class="fas fa-arrow-left"/>
        </span>
        {{ name }}
      </span>
    </h1>
    <h2 class="section-title title is-4">Contacts</h2>
    <contacts />
  </div>
</template>

<script>
import Contacts from './Contacts.vue'

export default {
  components: {
    Contacts
  },
  data () {
    return {}
  },
  computed: {
    name () {
      console.log(this.$store.state.resortId);
      return this.$store.state.resorts.filter(resort => resort.resortId === this.$store.state.resortId)[0].name
    }
  },
  created () {
  },
  methods: {
    goBack () {
      this.$store.commit('SET_LOADING_STATE', true)
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-title {
  display: inline-flex;
  align-items: center;
  .icon.back {
    font-size: .8em;
    margin-right: .6em;
  }
}
</style>
