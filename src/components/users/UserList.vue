<template>
  <div class="user-list">
    <h2 class="subtitle">Current Resort Users</h2>

    <div v-if="resortUsers.length > 0" class="user-list">

      <div v-for="user in sortedResortUsers" class="user-container">
        <section class="header" @click="showUserDetails(user)">
          <span class="name">{{user.fullName()}}</span>
          <span class="email">{{ user.email }}</span>
          <span v-if="user.currentResortSettings().isResortAdmin" class="resort-admin">Admin</span>
          <span class="created-at">{{formatDate(user.createdAt, 'll')}}</span>
        </section>
        <section v-if="showUser(user.uid)" class="body">

          <div v-if="isEditingUser" class="edit-user">
            <UserForm
              v-on:save="onUserSave"
              v-on:cancel="isEditingUser = false"
              v-on:deleteUser="onUserDelete"
              v-bind:showDeleteUser="true"
              v-bind:existingUser="user"
              title="Edit User"
              class="edit-user-container">
            </UserForm>
          </div>

          <div v-else class="user-details">
            <!-- Only superAdmins can edit resortAdmins -->
            <span v-if="currentUser.canEditUser(user)" v-on:click="isEditingUser = true">
              <i class="fas fa-edit" />
            </span>
            <div class="detail name">
              <label>Name:</label><span class="created">{{ user.fullName() }}</span>
            </div>
            <div class="detail created">
              <label>Created At:</label><span class="created">{{formatDate(user.createdAt, 'lll')}}</span>
            </div>
            <div class="detail updated">
              <label>Last Updated:</label><span class="created">{{formatDate(user.updatedAt, 'lll')}}</span>
            </div>
            <section class="permissions">
              <div class="detail permission">
                <label>Is Resort Admin:</label><span class="created">{{ user.currentResortSettings().isResortAdmin ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail permission">
                <label>Manage Push:</label><span class="created">{{ user.currentResortSettings().canManagePushNotifications ? 'Yes' : 'No' }}</span>
              </div>
              <div v-if="resortPermissions.canManageContacts" class="detail permission">
                <label>View Contacts:</label><span class="created">{{ user.currentResortSettings().canViewContacts ? 'Yes' : 'No' }}</span>
              </div>
              <div v-if="resortPermissions.canManageContacts" class="detail permission">
                <label>Manage Contacts:</label><span class="created">{{ user.currentResortSettings().canManageContacts ? 'Yes' : 'No' }}</span>
              </div>
              <div v-if="resortPermissions.canManageWebcams" class="detail permission">
                <label>View Webcams:</label><span class="created">{{ user.currentResortSettings().canViewWebcams ? 'Yes' : 'No' }}</span>
              </div>
              <div v-if="resortPermissions.canManageWebcams" class="detail permission">
                <label>Manage Webcams:</label><span class="created">{{ user.currentResortSettings().canManageWebcams ? 'Yes' : 'No' }}</span>
              </div>
            </section>
          </div>
        </section>

      </div>

    </div>
    <div v-else class="no-users">
      No users to display. Add a new user using the button above.
    </div>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import moment from 'moment'
import UserForm from './UserForm.vue'
import arrayHelper from '../../helpers/arrayHelper'
import draggable from 'vuedraggable'

export default {
  components: {
    draggable,
    UserForm
  },
  data () {
    return {
      currentUserId:      null,
      isEditingUser:      false
    }
  },
  computed: {
    ...mapGetters(['resortUsers', 'currentUser', 'resortPermissions', 'currentResort']),
    sortedResortUsers () {
      // Need slice here to prevent render loop
      return this.resortUsers.slice().sort(this.compareDates)
    }
  },
  created () {

  },
  methods: {
    showUserDetails (user) {
      this.isEditingUser = false // close any open edit panel
      // Check if opening or closing...
      if (this.currentUserId == user.uid) {
        this.currentUserId = null
      } else {
        this.currentUserId = user.uid
      }
    },
    showUser (uid) {
      return this.currentUserId == uid
    },
    formatDate (date, format) {
      return moment.utc(date).local().format(format)
    },
    onUserSave (user, userPermissions) {
      user.updatedAt = moment.utc().format('YYYY-MM-DD HH:mm:ss')
      user.authorizedResorts[this.currentResort.id] = userPermissions   // reset permissions
      this.$store.commit('SET_LOADING_STATE', true)

      this.$store.dispatch('saveResortUser', user).then((user) => {
        this.$store.commit('REPLACE_RESORT_USER', user)
        this.currentUserId = null
        this.isEditingUser = false
        this.$store.commit('SET_LOADING_STATE', false)
        this.$store.dispatch('showSuccessModal', 'User updated!')
      })
    },
    onUserDelete (user) {
      this.$store.commit('SET_LOADING_STATE', true)

      this.$store.dispatch('removeResortFromUser', user).then((user) => {
        this.$store.dispatch('showSuccessModal', 'User removed!')
        this.$store.commit('SET_LOADING_STATE', false)
        this.currentUserId = null
        this.isEditingUser = false
      }).catch((error) => {

      })

      // this.$store.dispatch('deleteResortUser', user).then((error) => {
      //   this.$store.dispatch('showSuccessModal', 'User removed!')
      //   this.$store.commit('SET_LOADING_STATE', false)
      //   this.currentUserId = null
      //   this.isEditingUser = false
      // }).catch((error) => {
      //
      // })
    },
    compareDates (a, b) {
      if (a.createdAt < b.createdAt) {
        return 1
      }
      if (a.createdAt > b.createdAt) {
        return -1
      }
      return 0
    }
  }
}
</script>

<style lang="scss" scoped>

.user-list {

  .user-container {
    border:                       1px solid #dfe0e2;
    border-radius:                0.25em;
    margin-bottom:                0.88em;

    .header {
      display:                    flex;
      align-items:                center;
      cursor:                     pointer;
      background:                 #dfe0e2;
      padding:                    0.88em;

      > span {
        text-overflow:            ellipsis;
        overflow:                 hidden;
        white-space:              nowrap;
      }

      .name {
        width:                    8em
      }

      .email {
        margin-left:              1em;
        width:                    15em;
        font-style:               italic;
      }

      .resort-admin {
        margin-left:              auto;
        background:               black;
        color:                    white;
        padding:                  0.25em;
        border-radius:            0.5em;
      }

      .created-at {
        margin-left:              auto;
        padding:                  0.25em;
      }
    }

    .body {

      padding:                    1.5em 2em;

      .user-details {

        position:                 relative;

        .fa-edit {
          position:               absolute;
          right:                  0;
          top:                    0;

          &:hover {
            cursor:               pointer;
            opacity:              0.8;
          }
        }

        .detail {

          display:                flex;
          word-wrap:              break-word;

          > label {
            font-weight:          bold;
            width:                25%;
          }

          > span {
            width:                75%;
          }
        }

        .permissions {
          margin-top:             2em;
        }
      }
    }
  }

  .no-users {
    font-style:                     italic;
    padding:                        1em;
  }
}

</style>
