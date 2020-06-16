<template>
  <div class="user-manager">

    <h1 class="setting-title">Users</h1>

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
import UserList from '../users/UserList.vue'
import UserForm from '../users/UserForm.vue'
import store from '../../store'

export default {
  components: {
    UserForm,
    UserList
  },
  data () {
    return {
      showCreateUser:     false
    }
  },
  computed: {
    ...mapGetters(['currentResort'])
  },
  beforeRouteEnter (to, from, next) {
    store.dispatch('setResortUsers').then(() => {
      next()
    })
  },
  methods: {
    onUserSave (newUser, newUserPermissions, sendPasswordResetEmail) {
      this.showCreateUser = false
      this.$store.commit('SET_LOADING_STATE', true)

      // Check to see if user already exists...
      this.$store.dispatch('lookupUserByEmailAddress', newUser.email).then((existingUser) => {
        if (existingUser) {
          // User exists for this resort already... show error
          if (existingUser["authorizedResorts"] && existingUser["authorizedResorts"][this.currentResort.id]) {
            this.$store.commit('SET_LOADING_STATE', false)
            this.$store.dispatch('showErrorModal', 'User already exists for this resort.')
          } else {
            // If user exists for another resort, set new authorizedResorts and permissions
            if (!existingUser['authorizedResorts']) existingUser['authorizedResorts'] = {}
            existingUser['authorizedResorts'][this.currentResort.id] = newUserPermissions
            this.$store.dispatch('saveUserForCurrentResort', existingUser).then((user) => {
              this.$store.dispatch('showSuccessModal', 'User added!')
            })
          }
        } else {
          // User does not exist. Create!
          this.$store.dispatch('createUserForResort', {
            user:                     newUser,
            permissions:              newUserPermissions,
            sendPasswordResetEmail:   sendPasswordResetEmail
          }).then((user) => {
            if (user) {
              this.$store.dispatch('setResortUsers')
              this.$store.dispatch('showSuccessModal', 'User created!')
            }
            this.$store.commit('SET_LOADING_STATE', false)
          }).catch((error) => {
            this.$store.dispatch('showErrorModal', error.message)
          })
        }
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
    top:                      -0.25em;
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
