<template>
  <div class="home">
    <div class="links">
      <router-link v-if="$store.state.resortId" to="/history">Revision History</router-link>
      <router-link v-if="$store.state.resortId" v-show="$store.state.user.superAdmin" to="/maps">Maps</router-link>
    </div>
    <site-header title="Contact Management" />
    <save-publish />
    <contacts />
  </div>
</template>

<script>
import Contacts from './Contacts'
import SiteHeader from './SiteHeader.vue'
import SavePublish from './SavePublish.vue'

export default {
  components: {
    Contacts,
    SiteHeader,
    SavePublish,
  },
  data() {
    return {}
  },
  computed: {},
  created() {},
  methods: {},
}
</script>

<style scoped lang="scss">

.home {

  .links {
    text-align:             right;

    a:last-of-type {
      margin-left:          1.5em;
    }
  }
}

</style>
