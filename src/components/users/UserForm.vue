<template>
  <div class="user-form">
    <h2 class="subtitle">{{title}}</h2>

    <h2>First Name:</h2>
    <input v-model="newUser.firstName" class="input name" type="text" name="name">

    <h2>Last Name:</h2>
    <input v-model="newUser.lastName" class="input name" type="text" name="name">

    <div class="toggle-container">
      <span>Resort Admin:</span>
      <label for="resort-admin" class="switch">
        <input v-model="newUser.isResortAdmin" id="resort-admin" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div class="toggle-container">
      <span>View Push:</span>
      <label for="view-push" class="switch">
        <input v-model="newUser.canViewPushNotifications" id="view-push" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div class="toggle-container">
      <span>Manage Push:</span>
      <label for="manage-push" class="switch">
        <input v-model="newUser.canManagePushNotifications" id="manage-push" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div class="toggle-container">
      <span>View Contacts:</span>
      <label for="view-contacts" class="switch">
        <input v-model="newUser.canViewContacts" id="view-contacts" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div class="toggle-container">
      <span>Manage Contacts:</span>
      <label for="manage-contacts" class="switch">
        <input v-model="newUser.canManageContacts" id="manage-contacts" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div class="toggle-container">
      <span>View Webcams:</span>
      <label for="view-webcams" class="switch">
        <input v-model="newUser.canViewWebcams" id="view-webcams" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>
    <div class="toggle-container">
      <span>Manage Webcams:</span>
      <label for="manage-webcams" class="switch">
        <input v-model="newUser.canManageWebcams" id="manage-webcams" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>

    <div class="cancel-save">
      <span class="button is-primary new-push-button" @click="save()">Save</span>
      <span class="button is-light new-push-button" @click="cancel()">Cancel</span>
    </div>

    <div v-if="showDeleteWebcam" @click="showDeleteModal()" class="delete-button button is-danger is-outlined">
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
    showDeleteWebcam: {
      type:     Boolean,
      default:  false
    }
  },
  data () {
    return {
      newUser:        this.initializeUserObject()
    }
  },
  computed: {

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
    setNewUserDefaults () {
      return {
        firstName:                    '',
        lastName:                     '',
        canViewWebcams:               false,
        canManageWebcams:             false,
        canViewPushNotifications:     false,
        canManagePushNotifications:   false,
        canViewContacts:              false,
        canManageContacts:            false
      }
    },
    save () {
      // Only set defaults on new user
      if (!this.existingUser) this.setWebcamDefaults()
      this.$emit('save', this.newUser)
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
        this.$emit('deleteWebcam', this.existingUser)
      }

      this.$store.commit('SHOW_MODAL', {
        heading:      'Are you sure you want to delete this user?',
        showLoading:  false,
        onConfirm,
      })
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
    margin-bottom:              1em
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
