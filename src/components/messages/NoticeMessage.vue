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
            <span>Meow</span>
          </div>
          <div class="detail">
            <label>Message:</label>
            <span>Meow</span>
          </div>
          <div class="detail">
            <label>Url:</label>
            <span>Meow</span>
          </div>
          <div class="detail">
            <label>Before:</label>
            <span>Meow</span>
          </div>
          <div class="detail">
            <label>After:</label>
            <span>Meow</span>
          </div>
        </section>

        <section v-else class="detail-container new-message">
          <div v-if="showNewMessage">
            <div class="detail">
              <label>Title:</label>
              <input v-model="newMessage.title">
            </div>
            <div class="detail">
              <label>Message:</label>
              <input v-model="newMessage.message">
            </div>
            <div class="detail">
              <label>Url:</label>
              <input v-model="newMessage.url">
            </div>
            <div class="detail">
              <label>Before:</label>
              <input v-model="newMessage.beforeDate">
            </div>
            <div class="detail">
              <label>After:</label>
              <input v-model="newMessage.afterDate">
            </div>

            <div class="button-container">
              <span v-on:click="cancelNewMessage()" class="button cancel is-secondary">Cancel</span>
              <span class="button save is-primary">Save</span>
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
      messageExists:        false,
      showNewMessage:       false,
      newMessage:           {}
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'currentResort'])
  },
  created() {},
  methods: {
    cancelNewMessage () {
      this.showNewMessage = false
      this.newMessage     = {}
    }
  },
}
</script>

<style lang="scss" scoped>

.notice-message {

  .rt-dropdown {

    .body {

      .new-message {

        .button-container {
          margin:                   1.5em 0 0 0;
          display:                  flex;
          align-items:              center;

          .cancel {
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
