<template>
  <div class="create-push">
    <h2 class="subtitle">New Push Notification</h2>

    <textarea v-model="messageBody" maxlength="200" class="push-message-body" placeholder="Type your push message here..." />

    <div class="remaining-characters">
      <span class="">Notifications may be up to 200 characters in length. Available characters:</span>
      <input v-bind:value="remainingCharacters" type="text" name="limit" size="4" readonly>
    </div>

    <div class="city-options-list">
      <h2>Your Cities</h2>
      <span v-for="city in pushWooshData.preferredCityOptions" v-on:click="addOrRemoveCityFromSelected(city)" class="city-option" v-bind:class="{ selected : isCitySelected(city) }">
        {{city}} - <b>{{pushWooshData.exportSubscribersCityOptions[city]}}</b>
      </span>
    </div>

    <div class="cancel-save">
      <span class="button is-primary new-push-button" :disabled="!messageIsValid" @click="showConfirmModal()">Send</span>
      <span class="button is-light new-push-button" @click="cancelMessage()">Cancel</span>
    </div>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'

// TODO
// Add link input

export default {
  components: {},
  data() {
    return {
      messageBody:          '',
      messageLimit:         200,
      messageLink:          '',
      selectedCities:       []
    }
  },
  computed: {
    ...mapGetters(['pushWooshData']),
    remainingCharacters () {
      return this.messageLimit - this.messageBody.length
    },
    messageIsValid () {
      return this.messageBody.length > 0
    }
  },
  created () {
    // this.getCities()
  },
  methods: {
    getCities () {
      // This tests the getTagStats functionality, but it does not quite give us what we want, I don't think.
      let baseUrl = 'http://localhost:5001/rta-staging/us-central1/getTagStats'
      baseUrl += '?tagName=City'

      this.axios.get(baseUrl).then((response) => {
        console.log(JSON.parse(response.data.body))
      })
    },
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
          // console.log(response)
          this.$store.dispatch('showSuccessModal', 'Message successfully sent!')
          this.cancelMessage()
          this.$emit('pushCreated')
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
    },
    addOrRemoveCityFromSelected (city) {
      if (this.selectedCities.includes(city)) {
        let index = this.selectedCities.indexOf(city)
        this.selectedCities.splice(index, 1)
      } else {
        this.selectedCities.push(city)
      }
    },
    isCitySelected (city) {
      return this.selectedCities.includes(city)
    },
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

  .city-options-list {

    > h2 {
      margin:                   0.5em 0;
      font-size:                1.15em;
    }

    .city-option {
      padding:                      0.5em;
      border-radius:                2em;
      border:                       1px solid black;
      display:                      inline-block;
      margin:                       0.25em;
      cursor:                       pointer;
      background-color:             whitesmoke;

      &:hover {
        background-color:           black;
        color:                      white;
        border:                     1px solid white;
      }

      &.selected {
        background-color:           #209cee;
        color:                      white;
        border:                     1px solid white;
      }
    }
  }

  .cancel-save {
    margin-top:                 1em;
  }

}

</style>
