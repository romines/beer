<template>
  <div class="settings">
    <site-header title="Settings" />

    <!-- <router-link v-if="currentUser.superAdmin || currentUser.isResortAdmin()" v-bind:to="{ name: 'UserManager' }">Manage Users</router-link> -->

    <div class="click-tabs">
      <router-link class="tablinks" v-bind:to="{ name: 'PushSettings' }">Push Notifications</router-link>
      <router-link v-if="currentUser.superAdmin || currentUser.isResortAdmin()" class="tablinks" v-bind:to="{ name: 'UserManager' }">Users</router-link>
      <router-link v-if="currentUser.superAdmin" class="tablinks" v-bind:to="{ name: 'ResortManager' }">Resort</router-link>
    </div>

    <router-view />
  </div>
</template>

<script>
import SiteHeader from './SiteHeader.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    SiteHeader
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  beforeRouteEnter (to, from, next) {
    if (to.path === '/settings') {
      next('/settings/push')
    } else {
      next()
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>

.settings {

  .click-tabs {
    overflow:                     hidden;
    border:                       1px solid #ccc;
    background-color:             #f1f1f1;
    margin-bottom:                1.5em;

    a {
      float:                      left;
      border:                     none;
      outline:                    none;
      cursor:                     pointer;
      padding:                    14px 16px;
      transition:                 0.3s;
      font-size:                  17px;
      color:                      black;

      &:hover {
        background-color:         #ddd;
      }

      &.router-link-exact-active {
        background-color:         #ccc;
      }
    }
  }


}
</style>
