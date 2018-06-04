<template>
  <div class="resorts">
    <site-header title="Contacts" />
    <contacts />
  </div>
</template>

<script>
import Contacts from './Contacts.vue'
import SiteHeader from './SiteHeader.vue'

export default {
  components: {
    Contacts,
    SiteHeader
  },
  data () {
    return {}
  },
  computed: {
    name () {
      if (!this.$store.state.resortId) return
      return this.$store.state.resorts.filter(resort => resort.resortId === this.$store.state.resortId)[0].name
    }
  },
  created () {
  },
  methods: {
    goBack () {
      this.$store.commit('SET_LOADING_STATE', true)
      this.$router.push('/resorts')
    }
  }
}
</script>

<style lang="scss" scoped>
.title-container {
  // color: red !important;
  h1 {
    margin-bottom: 0;
  }
  .icon.back {
    font-size: .8em;
    // margin-right: .6em;
  }
}
</style>
