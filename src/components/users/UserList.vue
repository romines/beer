<template>
  <div class="user-list">
    <h2 class="subtitle">Current Users</h2>

    <div v-if="users.length > 0" class="user-list">

      <div v-for="user in users" class="user-container">
        <section class="header" @click="showUserDetails(user)">
          <span class="grippy" />
          <span class="id">{{user.id}}</span>
          <span class="user-name">{{ user.name }}</span>
          <span class="created-at">{{formatDate(user.createdAt, 'll')}}</span>
        </section>
        <section v-if="showUser(user.identifier)" class="body">

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
            <span v-on:click="isEditingUser = true">
              <i class="fas fa-edit" />
            </span>
            <div class="detail name">
              <label>Name:</label><span class="created">{{ user.name }}</span>
            </div>
            <div class="detail short-name">
              <label>Short Name:</label><span class="created">{{ user.shortName }}</span>
            </div>
            <div class="detail static-url">
              <label>Still URL:</label><span class="created">{{ user.staticImageUrl }}</span>
            </div>
            <div class="detail streaming-url">
              <label>Streaming Url:</label><span class="created">{{ user.streamingUrl }}</span>
            </div>
            <!-- <div class="detail is-web">
              <label>Is Streaming?:</label><span class="created">{{ user.isWeb }}</span>
            </div> -->
            <div class="detail created">
              <label>Created At:</label><span class="created">{{formatDate(user.createdAt, 'lll')}}</span>
            </div>
            <div class="detail updated">
              <label>Last Updated:</label><span class="created">{{formatDate(user.updatedAt, 'lll')}}</span>
            </div>
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
      isEditingUser:      false,
      users:              []
    }
  },
  computed: {
    // ...mapGetters(['users'])
  },
  created () {

  },
  methods: {
    showUserDetails (user) {
      // Check if opening or closing...
      if (this.currentUserId == user.identifier) {
        this.currentUserId = null
      } else {
        this.currentUserId = user.identifier
      }
    },
    showUser (identifier) {
      return this.currentUserId == identifier
    },
    formatDate (date, format) {
      return moment.utc(date).local().format(format)
    },
    onUserSave (user) {
      user.updatedAt = moment.utc().format('YYYY-MM-DD HH:mm:ss')
      arrayHelper.replaceObjectByValue(this.users, user, user.identifier, 'identifier')
      this.$store.dispatch('saveResortUsers', this.users).then(() => {
        this.isEditingUser = false
      })
    },
    onUserDelete (user) {
      arrayHelper.removeObjectByValue(this.users, user.identifier, 'identifier')
      this.$store.dispatch('saveResortUsers', this.users).then(() => {
        this.$store.dispatch('showSuccessModal', 'User removed!')
        this.currentUserId = null
        this.isEditingUser = false
      })
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

      .user-name {
        margin-left:              3em;
        text-overflow:            ellipsis;
        overflow:                 hidden;
        white-space:              nowrap;
        max-width:                25em;
      }

      .created-at {
        margin-left:              auto;
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
            width:                20%;
          }

          > span {
            width:                80%;
          }
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
