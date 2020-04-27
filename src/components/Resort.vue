<template>
  <div class="resorts">
    <div class="links">
      <router-link v-if="$store.state.resortId" to="/history">Revision History</router-link>
      <router-link v-if="$store.state.resortId && $store.state.user.superAdmin" to="/maps">Maps</router-link>
      <router-link v-if="$store.state.resortId && $store.state.user.superAdmin" to="/tags">Tags</router-link>
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
  computed: {},
  created() {},
  methods: {},
}
</script>

<style lang="scss" scoped>

.resorts {

  .links {
    text-align:             right;

    a {
      margin-left:          1.5em;
    }
  }
}
</style>
