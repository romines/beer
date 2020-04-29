<template>
  <div class="user-manager">
    <site-header title="User Management" />

    <span class="button is-primary new-user-button" @click="showCreateUser = !showCreateUser">Create User</span>

    <transition name="fade">
      <UserForm
        v-if="showCreateUser"
        v-on:save="onUserSave"
        v-on:cancel="showCreateUser = false"
        class="new-user-container">
      </UserForm>
    </transition>

    <user-list ref="userList" class="user-list" />

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import SiteHeader from './SiteHeader.vue'
import UserList from './users/UserList.vue'
import UserForm from './users/UserForm.vue'
import store from '../store'

export default {
  components: {
    SiteHeader,
    UserForm,
    UserList
  },
  data () {
    return {
      showCreateUser:     false
    }
  },
  computed: {},
  beforeRouteEnter (to, from, next) {
    store.dispatch('setResortUsers').then(() => {
      next()
    })
  },
  methods: {
    onUserSave (newUser, sendPasswordResetEmail) {
      this.showCreateUser = false
      this.$store.commit('SET_LOADING_STATE', true)
      this.$store.dispatch('createUserForResort', { user: newUser, sendPasswordResetEmail: sendPasswordResetEmail }).then((user) => {
        if (user) {
          this.$store.dispatch('setResortUsers')
          this.$store.dispatch('showSuccessModal', 'User created!')
        }
        this.$store.commit('SET_LOADING_STATE', false)
      }).catch((error) => {
        this.$store.dispatch('showErrorModal', error.message)
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.user-manager {

  position:                   relative;

  .new-user-button {
    position:                 absolute;
    top:                      3.5em;
    right:                    0.5em;
  }

  .new-user-container {
    margin-top:               1em;
  }

  .user-list {
    margin-top:               2em;
  }

}

</style>
