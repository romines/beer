<template>
  <div class="user-profile">
    <site-header title="Profile" />

    <div class="info">
      <label>First Name:</label>
      <span>{{currentUser.firstName}}</span>
    </div>
    <div class="info">
      <label>Last Name:</label>
      <span>{{currentUser.lastName}}</span>
    </div>
    <div class="info">
      <label>Password:</label>
      <span>********</span>
    </div>

    <span v-if="!isEditingPassword" class="button is-primary password-button" @click="isEditingPassword = !isEditingPassword">Change Password</span>
    <div v-else class="edit-password">
      <h2 class="subtitle">Edit Password</h2>

      <h2>Current Password:</h2>
      <input v-model="currentPassword" class="input name" type="password" name="name">

      <h2>New Password:</h2>
      <input v-model="newPassword" class="input name" type="password" name="name">

      <h2>Confirm New Password:</h2>
      <input v-model="confirmNewPassword" class="input name" type="password" name="name">

      <div v-if="passwordErrorMessage" class="alert alert-danger">{{passwordErrorMessage}}</div>

      <div class="cancel-save">
        <span class="button is-primary new-push-button" @click="save()">
          <LoadingSpinner v-if="isSavingPassword" isBlack="true"></LoadingSpinner>
          <span v-else>Save</span>
        </span>
        <span class="button is-light new-push-button" @click="cancel()">Cancel</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SiteHeader from './SiteHeader.vue'
import LoadingSpinner from './utilities/LoadingSpinner.vue'

export default {
  name: 'Profile',
  components: {
    SiteHeader,
    LoadingSpinner
  },
  data() {
    return {
      isEditingPassword:        false,
      currentPassword:          '',
      newPassword:              '',
      confirmNewPassword:       '',
      passwordErrorMessage:     '',
      isSavingPassword:         false
    }
  },
  computed: {
    ...mapGetters(['currentUser']),
    passwordIsValid () {
      return this.passwordIsLongEnough && this.passwordsMatch
    },
    passwordIsLongEnough () {
      return this.newPassword.length >= 8
    },
    passwordsMatch () {
      return this.newPassword === this.confirmNewPassword
    }
  },
  created() {},
  methods: {
    save () {
      if (this.isSavingPassword) return
      if (!this.validatePasswords()) return

      this.isSavingPassword = true

      this.$store.dispatch('setUserPassword', { currentPassword: this.currentPassword, newPassword: this.newPassword }).then(() => {
        this.cancel()
        this.isSavingPassword = false
        this.$store.dispatch('showSuccessModal', 'Password updated!')
      }).catch((error) => {
        if (error.code === 'auth/wrong-password') this.passwordErrorMessage = 'Current password is incorrect.'
        else this.passwordErrorMessage = error.message
        this.isSavingPassword = false
      })
    },
    cancel () {
      this.isEditingPassword    = false
      this.currentPassword      = ''
      this.newPassword          = ''
      this.confirmNewPassword   = ''
      this.passwordErrorMessage = ''
    },
    validatePasswords () {
      this.passwordErrorMessage = null

      if (this.passwordIsValid) return true

      if (!this.passwordIsLongEnough) this.passwordErrorMessage = 'Password must be at least 8 characters long'
      if (!this.passwordsMatch)       this.passwordErrorMessage = 'Passwords do not match'

      return false
    }
  },
}
</script>

<style lang="scss" scoped>

.user-profile {

  .info {
    > label {
      display:                    inline-block;
      min-width:                  8em;
    }
  }

  .password-button {
    margin:                       2em 0 2em 0;
  }

  .edit-password {
    margin-top:                   2em;
    padding:                      0.5em 1em;
    border:                       1px solid lightgray;
    border-radius:                1em;

    input {
      margin-bottom:              0.5em;
    }

    .password-error {
      font-color:                 red
    }

    .cancel-save {
      margin-top:                 1em;
      display:                    inline-block;
    }
  }

}

</style>
