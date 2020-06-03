<template>
  <div class="user-form">
    <h2 class="subtitle">{{title}}</h2>

    <h2>First Name:</h2>
    <input v-model="newUser.firstName" class="input name" type="text" name="name">

    <h2>Last Name:</h2>
    <input v-model="newUser.lastName" class="input name" type="text" name="name">

    <h2>Email Address:</h2>
    <input v-model="newUser.email" class="input name" type="text" name="name">

    <div v-if="!existingUser">
      <h2>Password:</h2>
      <input v-model="newUser.password" class="input name" type="text" name="name">
    </div>

    <div v-if="currentUser.superAdmin" class="toggle-container">
      <span>Resort Admin:</span>
      <label for="resort-admin" class="switch">
        <input v-model="newUserPermissions.isResortAdmin" id="resort-admin" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div class="toggle-container">
      <span>Manage Push:</span>
      <label for="manage-push" class="switch">
        <input v-model="newUserPermissions.canManagePushNotifications" id="manage-push" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div v-if="currentUser.canAccessContacts()" class="toggle-container">
      <span>View Contacts:</span>
      <label for="view-contacts" class="switch">
        <input v-model="newUserPermissions.canViewContacts" id="view-contacts" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div v-if="currentUser.canAccessContacts()" class="toggle-container">
      <span>Manage Contacts:</span>
      <label for="manage-contacts" class="switch">
        <input v-model="newUserPermissions.canManageContacts" id="manage-contacts" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div v-if="currentUser.canAccessWebcams()" class="toggle-container">
      <span>View Webcams:</span>
      <label for="view-webcams" class="switch">
        <input v-model="newUserPermissions.canViewWebcams" id="view-webcams" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div v-if="currentUser.canAccessWebcams()" class="toggle-container">
      <span>Manage Webcams:</span>
      <label for="manage-webcams" class="switch">
        <input v-model="newUserPermissions.canManageWebcams" id="manage-webcams" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>

    <div v-if="!existingUser">
      <input v-model="sendPasswordResetEmail" type="checkbox" class="reset-email">
      <span>Send password reset email</span>
    </div>

    <div class="cancel-save">
      <span class="button is-primary new-push-button" @click="save()">Save</span>
      <span class="button is-light new-push-button" @click="cancel()">Cancel</span>
    </div>

    <div v-if="showDeleteUser" @click="showDeleteModal()" class="delete-button button is-danger is-outlined">
      <span class="">Delete</span>
      <span class="icon is-small">
        <i class="fas fa-trash-alt"/>
      </span>
    </div>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import moment from 'moment'
import validationHelper from '../../helpers/validationHelper'
import { v4 as uuidv4 } from 'uuid'

export default {
  components: {

  },
  props: {
    title: {
      type:     String,
      default:  "Create User"
    },
    existingUser: {
      type:     Object,
      default:  () => {}
    },
    showDeleteUser: {
      type:     Boolean,
      default:  false
    }
  },
  data () {
    return {
      newUser:                  this.initializeUserObject(),
      newUserPermissions:       this.initializeUserPermissions(),
      sendPasswordResetEmail:   true
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'resortPermissions'])
  },
  created () {

  },
  methods: {
    initializeUserObject () {
      if (this.existingUser) {
        return JSON.parse(JSON.stringify(this.existingUser))
      } else {
        return this.setNewUserDefaults()
      }
    },
    initializeUserPermissions () {
      if (this.existingUser) {
        let permissions = this.existingUser.currentUserResortPermissions()
        return JSON.parse(JSON.stringify(permissions))
      } else {
        return this.setNewUserPermissionsDefaults()
      }
    },
    setNewUserDefaults () {
      return {
        firstName:                    '',
        lastName:                     '',
        email:                        '',
        password:                     Math.random().toString(36).slice(-10),
        superAdmin:                   false
      }
    },
    setNewUserPermissionsDefaults () {
      return {
        isResortAdmin:                false,
        canViewWebcams:               false,
        canManageWebcams:             false,
        canViewPushNotifications:     false,
        canManagePushNotifications:   false,
        canViewContacts:              false,
        canManageContacts:            false
      }
    },
    setAllPermissions (value) {
      this.$set(this.newUserPermissions, 'canViewWebcams', value)
      this.$set(this.newUserPermissions, 'canManageWebcams', value)
      this.$set(this.newUserPermissions, 'canViewPushNotifications', value)
      this.$set(this.newUserPermissions, 'canManagePushNotifications', value)
      this.$set(this.newUserPermissions, 'canViewContacts', value)
      this.$set(this.newUserPermissions, 'canManageContacts', value)
    },
    save () {
      // Only set defaults on new user
      if (!this.existingUser) this.setWebcamDefaults()
      this.$emit('save', this.newUser, this.newUserPermissions, this.sendPasswordResetEmail)
    },
    cancel () {
      this.newUser = this.setNewUserDefaults()
      this.$emit('cancel')
    },
    setWebcamDefaults () {
      let createdAt = moment.utc().format('YYYY-MM-DD HH:mm:ss')

      this.newUser.createdAt  = createdAt
      this.newUser.updatedAt  = createdAt
      this.newUser.identifier = uuidv4()                // Unique Identifier
    },
    showDeleteModal () {

      const onConfirm = () => {
        this.$emit('deleteUser', this.existingUser)
      }

      this.$store.commit('SHOW_MODAL', {
        heading:      'Are you sure you want to delete this user?',
        showLoading:  false,
        onConfirm,
      })
    }
  },
  watch: {
    'newUserPermissions.isResortAdmin': {
      handler(val) {
        this.setAllPermissions(val)
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>

.user-form {

  padding:                      1em;
  border:                       1px solid #dfe0e2;
  border-radius:                1em;

  input {
    width:                      80%;
    margin-bottom:              1em;

    &.reset-email {
      width:                    2em;
      margin-top:               2em;
    }
  }

  .toggle-container {
    display:                    flex;
    align-items:                center;

    > span {
      min-width:                10em;
    }
  }

  .cancel-save {
    margin-top:                 2em;
    display:                    inline-block;
  }

  .delete-button {

    margin-top:                 2em;
    float:                      right;
    margin-right:               1em;

    .icon {
      height:                   1.5em;
      width:                    1.5em;
    }
  }
}

</style>
