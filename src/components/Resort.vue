<template>
  <div class="resorts">
    <div class="links">
      <router-link v-if="$store.state.resortId" to="/history">Revision History</router-link>
      <router-link v-if="$store.state.resortId" v-show="$store.state.user.superAdmin" to="/maps">Maps</router-link>
    </div>
    <site-header title="Contacts" />
    <save-publish />
    <contacts />
  </div>
</template>

<script>
import SiteHeader from './SiteHeader.vue'
import SavePublish from './SavePublish.vue'
import Contacts from './Contacts.vue'

export default {
  components: {
    SiteHeader,
    SavePublish,
    Contacts,
  },
  data() {
    return {}
  },
  computed: {
    name() {
      if (!this.$store.state.resortId) return
      return this.$store.state.resorts.filter(
        resort => resort.resortId === this.$store.state.resortId
      )[0].name
    },
  },
  created() {},
  methods: {
    goBack() {
      this.$store.commit('SET_LOADING_STATE', true)
      this.$router.push('/resorts')
    },
  },
}
</script>

<style lang="scss" scoped>

.resorts {

  .links {
    text-align:             right;

    a:last-of-type {
      margin-left:          1.5em;
    }
  }
}
</style>
