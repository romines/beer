<template>
  <div class="resorts">
    <div class="links">
      <router-link v-if="$store.state.resortId" to="/history">Revision History</router-link>
      <router-link v-if="$store.state.resortId && currentUser.superAdmin" to="/maps">Maps</router-link>
      <router-link v-if="$store.state.resortId && currentUser.superAdmin" to="/tags">Tags</router-link>
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
import { mapGetters } from 'vuex'

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
    ...mapGetters(['currentUser'])
  },
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
