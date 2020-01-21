<template>
  <div class="create-push">
    <h2 class="subtitle">New Push Notification</h2>

    <textarea v-model="messageBody" maxlength="200" class="push-message-body" placeholder="Type your push message here..." />

    <div class="remaining-characters">
      <span class="">Notifications may be up to 200 characters in length. Available characters:</span>
      <input v-bind:value="remainingCharacters" type="text" name="limit" size="4" readonly>
    </div>

    <div class="cancel-save">
      <span class="button is-primary new-push-button" :disabled="!messageIsValid" @click="showConfirmModal()">Send</span>
      <span class="button is-light new-push-button" @click="cancelMessage()">Cancel</span>
    </div>

  </div>
</template>

<script>

export default {
  components: {

  },
  data() {
    return {
      messageBody:      '',
      messageLimit:     200,
      messageLink:      ''
    }
  },
  computed: {
    remainingCharacters () {
      return this.messageLimit - this.messageBody.length
    },
    messageIsValid () {
      return this.messageBody.length > 0
    }
  },
  methods: {
    cancelMessage () {
      this.messageBody = ''
      this.messageLink = ''
      this.$emit('closeCreatePush')
    },
    showConfirmModal () {

      const onConfirm = () => {
        let baseUrl = 'http://localhost:5001/rta-staging/us-central1/createPushNotification'

        this.$store.dispatch('setModalLoadingState', true)

        this.axios.post(baseUrl, {
          messageBody: this.messageBody
        }).then((response) => {
          this.$store.dispatch('setModalLoadingState', false)
          console.log(response)
          this.$store.dispatch('showSuccessModal', 'Message successfully sent!')
          this.cancelMessage()
        }).catch((response) => {
          console.log(response)
          this.$store.dispatch('setModalLoadingState', false)
          this.$store.dispatch('showErrorModal', 'There was an error with your request and your message was not sent. Please try again later or contact Resorts Tapped for support.')
          this.cancelMessage()
        })
      }

      this.$store.commit('SHOW_MODAL', {
        heading: 'Please confirm that you want to send the following message:',
        message: this.messageBody,
        showLoading: false,
        onConfirm,
      })
    }
  }
}
</script>

<style scoped lang="scss">

.create-push {

  .push-message-body {
    height:                     10em;
    width:                      75%;
    font-size:                  1em;
    display:                    block;
    padding:                    0.5em;
    border-radius:              0.25em;
  }

  .remaining-characters {
    margin-top:                 1em;

    > input {
      font-size:                0.9em;
      text-align:               center;
    }
  }

  .cancel-save {
    margin-top:                 1em;
  }

}

</style>
