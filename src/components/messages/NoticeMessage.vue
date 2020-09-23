<template>
  <div class="notice-message">

    <div class="rt-dropdown" v-bind:class="{ 'is-open' : isDropdownOpen }">

      <div class="header" v-on:click="isDropdownOpen = !isDropdownOpen">
        <h2>Banner Message</h2>

        <i class="fas chevron fa-chevron-up" />
        <i class="fas chevron fa-chevron-down" />
      </div>

      <div class="body">
        <section v-if="messageExists" class="detail-container current-message">
          <div class="detail">
            <label>Title:</label>
            <span>{{currentNoticeMessage.title}}</span>
          </div>
          <div class="detail">
            <label>Url:</label>
            <span>{{currentNoticeMessage.url}}</span>
          </div>
          <div class="detail">
            <label>Before:</label>
            <span>{{currentNoticeMessage.beforeDate}}</span>
          </div>
          <div class="detail">
            <label>After:</label>
            <span>{{currentNoticeMessage.afterDate}}</span>
          </div>
          <div class="detail">
            <label>Message:</label>
            <span>{{currentNoticeMessage.message}}</span>
          </div>

          <div class="button-container">
            <button v-on:click="removeCurrentMessage()" class="button remove is-danger">Remove Message</button>
          </div>
        </section>

        <section v-else class="detail-container new-message">
          <div v-if="showNewMessage">
            <div class="detail">
              <label>Title:</label>
              <input v-model="newMessage.title" class="input">
            </div>
            <div class="detail">
              <label>Url:</label>
              <input v-model="newMessage.url" class="input">
            </div>
            <div class="detail">
              <label>Before:</label>
              <input v-model="newMessage.beforeDate" class="input">
            </div>
            <div class="detail">
              <label>After:</label>
              <input v-model="newMessage.afterDate" class="input">
            </div>
            <div class="detail">
              <label>Message:</label>
              <textarea v-model="newMessage.message" class="textarea"></textarea>
            </div>

            <div class="button-container">
              <span v-on:click="cancelNewMessage()" class="button cancel is-secondary">Cancel</span>
              <button v-on:click="publishNewMessage()" v-bind:disabled="!newMessageIsValid" class="button save is-primary">Save</button>
            </div>
          </div>
          <div v-else class="no-message">
            <span class="alert">No current message</span>
            <span v-on:click="showNewMessage = !showNewMessage" class="button is-primary">New Message</span>
          </div>
        </section>
      </div>

    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  components: {

  },
  data() {
    return {
      isDropdownOpen:       false,
      showNewMessage:       false,
      newMessage:           {},
      newMessageIsValid:    true
    }
  },
  computed: {
    ...mapGetters(['currentNoticeMessage']),
    messageExists () {
      return Object.keys(this.currentNoticeMessage).length > 0
    }
  },
  created() {
    this.$store.dispatch('getSetNoticeMessage')
  },
  methods: {
    cancelNewMessage () {
      this.showNewMessage = false
      this.newMessage     = {}
    },
    publishNewMessage () {
      this.$store.dispatch('createNoticeForResort', this.newMessage).then((message) => {
        this.$store.dispatch('showSuccessModal', 'Notice published!')
        this.cancelNewMessage()
      })
    },
    removeCurrentMessage () {
      this.$store.dispatch('createNoticeForResort', {}).then((message) => {
        this.$store.dispatch('showSuccessModal', 'Notice removed!')
        this.cancelNewMessage()
      })
    }
  },
}
</script>

<style lang="scss" scoped>

.notice-message {

  .rt-dropdown {

    .body {

      .detail-container {

        input {
          width:                    60%;
          display:                  block;
        }

        .button-container {
          margin:                   1.5em 0 0 0;
          display:                  flex;
          align-items:              center;

          .cancel, .remove {
            margin-left:            auto;
          }

          .save {
            margin-left:            0.5em;
          }
        }
      }

      .no-message {
        display:                    flex;
        align-items:                center;

        .button {
          margin-left:              auto;
        }
      }
    }
  }

}
</style>
