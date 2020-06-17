<template>
  <div class="resorts">
    <div class="links">
      <router-link v-if="currentResort.id && currentUser.canEditContacts()" to="/history">Revision History</router-link>
      <router-link v-if="currentResort.id && currentUser.superAdmin" to="/maps">Maps</router-link>
      <router-link v-if="currentResort.id && currentUser.superAdmin" to="/tags">Tags</router-link>
    </div>
    <site-header title="Contacts" />
    <save-publish v-if="currentUser.canEditContacts()" />
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
    ...mapGetters(['currentUser', 'currentResort'])
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
