<template>
  <div class="create-push">
    <h2 class="subtitle">New Push Notification</h2>

    <h2>Title:</h2>
    <input v-model="messageTitle" class="input message-title" type="text" name="title">

    <h2>Message Body:</h2>
    <textarea v-model="messageBody" maxlength="1000" class="push-message-body" placeholder="Type your push message here..." />

    <div v-if="messageBody.length > 200" class="message-warning alert alert-warning">
      <span>Your message is over 200 characters in length. Please note that your message may appear truncated on some device home screens.</span>
    </div>

    <!-- <div class="remaining-characters">
      <span class="">Notifications may be up to 200 characters in length. Available characters:</span>
      <input v-bind:value="remainingCharacters" type="text" name="limit" size="4" readonly>
    </div> -->

    <div class="link-container">
      <h2>Link:</h2>
      <input v-model="messageLink" class="input" type="text" name="limit">
    </div>

    <div class="options-list">
      <h2>Your Cities</h2>

      <div v-if="pushWooshData.preferredCityOptions.length > 0" class="options-container">
        <span v-for="city in pushWooshData.preferredCityOptions" v-on:click="addOrRemoveCityFromSelected(city)" class="option" v-bind:class="{ selected : isCitySelected(city) }">
          {{ findSafeCityData(city, 'cityName') }} - <b>{{ findSafeCityData(city, 'count') }}</b>
        </span>
      </div>
      <div v-else class="no-results">
        You do not have any preferred cities. Please visit the settings page.
      </div>
    </div>

    <!-- <div class="geo-zones-list options-list">
      <h2>Your GeoZones</h2>

      <div class="geo-zone-container">
        <LoadingSpinner v-if="geoZonesAreLoading" isBlack="true"></LoadingSpinner>
        <div v-else-if="geoZonesExist" v-for="cluster in geoZones" class="cluster">
          <span class="cluster-name">{{cluster.name}}:</span>
          <span v-for="zone in cluster.geoZones" v-on:click="selectGeoZone(zone)" class="option" v-bind:class="{ selected : isGeoZoneSelected(zone) }">
            {{zone.name}}
          </span>
        </div>
        <div v-else class="no-results">
          You do not have any geo zones set up yet.
        </div>
      </div>
    </div> -->

    <div class="silent-push">
      <input v-model="isSilentPush" type="checkbox">
      <label>Silent Push</label>
      <span class="tooltip">
        <i class="fa fa-info-circle"></i>
        <span class="tooltiptext top">Enable to pass custom data to the app without having the user informed</span>
      </span>

      <transition name="fade">
        <div v-if="isSilentPush" class="silent-push-options">
          <div class="option">
            <span>Time Valid (mins):</span><input v-model="silentSettings.validMinutes" class="input" type="number">
          </div>
          <div class="option">
            <span>Repeat Limit:</span><input v-model="silentSettings.repeatLimit" class="input" type="number">
          </div>
          <div class="option">
            <span>Repeat Interval:</span><input v-model="silentSettings.repeatInterval" class="input" type="number">
          </div>
          <!-- <div class="option">
            <span>Start Time:</span><input v-model="silentSettings.startTime" class="input" type="date">
            {{silentSettings.startTime}}
          </div> -->
        </div>
      </transition>
    </div>

    <div class="local-push">
      <input v-model="isLocalPush" type="checkbox">
      <label>Local Push</label>
      <span class="tooltip">
        <i class="fa fa-info-circle"></i>
        <span class="tooltiptext top">Will send notification to resort area.</span>
      </span>
    </div>

    <div class="cancel-save">
      <span class="button is-primary new-push-button" :disabled="!messageIsValid" @click="showConfirmModal()">{{sendMessageText}}</span>
      <span class="button is-light new-push-button" @click="cancelMessage()">Cancel</span>
    </div>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import LoadingSpinner from '../utilities/LoadingSpinner.vue'
import moment from 'moment'
import { functionsBaseUrl } from '../../firebaseInit.js'

export default {
  components: {
    LoadingSpinner
  },
  data() {
    return {
      messageBody:          '',
      messageTitle:         '',
      messageLimit:         200,
      messageLink:          '',
      selectedCities:       [],
      geoZones:             {},
      selectedGeoZone:      {},
      geoZonesAreLoading:   false,
      isSilentPush:         false,
      isLocalPush:          false,
      silentSettings: {
        // startTime:          undefined,
        validMinutes:       60,
        repeatInterval:     1,
        repeatLimit:        1
      }
    }
  },
  computed: {
    ...mapGetters(['pushWooshData']),
    // remainingCharacters () {
    //   return this.messageLimit - this.messageBody.length
    // },
    messageIsValid () {
      return this.messageBody.length > 0
    },
    sendMessageText () {
      if (Object.keys(this.selectedGeoZone).length > 0) return 'Send to all users in zone'
      else if (this.selectedCities.length > 0) return 'Send to selected cities'
      else if (this.isLocalPush) return 'Send to local users'
      else return 'Send to all users'
    },
    geoZonesExist () {
      if (Object.keys(this.geoZones).length > 1) return true
      return this.geoZones[0].geoZones
    },
    selectedCityNames () {
      return this.selectedCities.map((city) => {
        return this.pushWooshData.exportSubscribersCityOptions[city]['cityName']
      })
    }
  },
  created () {
    this.getGeoZones()
  },
  methods: {
    findSafeCityData (city, fieldName) {
      if (this.pushWooshData.exportSubscribersCityOptions[city]) return this.pushWooshData.exportSubscribersCityOptions[city][fieldName]
      else if (fieldName === 'count') return 'N/A'
      else return city
    },
    getGeoZones () {
      this.geoZonesAreLoading = true
      // This tests the getTagStats functionality, but it does not quite give us what we want, I don't think.
      let baseUrl = functionsBaseUrl + '/getGeoZones'
      baseUrl += '?applicationCode=' + this.pushWooshData.appId

      this.axios.get(baseUrl).then((response) => {
        let body                = JSON.parse(response.data.body)
        this.geoZones           = body.response.clusters
        this.geoZonesAreLoading = false
      })
    },
    cancelMessage () {
      this.messageBody = ''
      this.messageLink = ''
      this.$emit('closeCreatePush')
    },
    showConfirmModal () {

      const onConfirm = () => {
        if (this.isLocalPush) this.sendTargetedMessage()
        else this.sendPushNotification()
      }

      this.$store.commit('SHOW_MODAL', {
        heading:      'Please confirm that you want to send the following message:',
        bolded:       this.messageTitle,
        message:      this.messageBody,
        showLoading:  false,
        onConfirm,
      })
    },
    sendPushNotification () {
      let baseUrl = functionsBaseUrl + '/createPushNotification'
      baseUrl += '?applicationCode=' + this.pushWooshData.appId

      this.$store.dispatch('setModalLoadingState', true)

      this.axios.post(baseUrl, {
        messageBody:      this.messageBody,
        messageTitle:     this.messageTitle,
        selectedCities:   this.selectedCityNames,
        geoZone:          this.selectedGeoZone,
        messageLink:      this.messageLink,
        silentSettings:   this.isSilentPush ? this.silentSettings : undefined     // only send if active
      }).then((response) => {
        this.onMessageSuccess()
      }).catch((response) => {
        this.onMessageFail()
      })
    },
    sendTargetedMessage () {
      let baseUrl = functionsBaseUrl + '/createTargetedMessage'
      baseUrl += '?applicationCode=' + this.pushWooshData.appId

      this.$store.dispatch('setModalLoadingState', true)

      this.axios.post(baseUrl, {
        messageBody:      this.messageBody,
        messageTitle:     this.messageTitle,
        messageLink:      this.messageLink,
      }).then((response) => {
        this.onMessageSuccess()
      }).catch((response) => {
        this.onMessageFail()
      })
    },
    onMessageSuccess () {
      this.$store.dispatch('setModalLoadingState', false)
      // console.log(response)
      this.$store.dispatch('showSuccessModal', 'Message successfully sent!')
      this.cancelMessage()
      this.$emit('pushCreated')
    },
    onMessageFail () {
      this.$store.dispatch('setModalLoadingState', false)
      this.$store.dispatch('showErrorModal', 'There was an error with your request and your message was not sent. Please try again later or contact Resorts Tapped for support.')
      this.cancelMessage()
    },
    addOrRemoveCityFromSelected (city) {
      this.selectedGeoZone = {}
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
    selectGeoZone (zone) {
      this.selectedCities = []
      if (zone === this.selectedGeoZone) this.selectedGeoZone = {}
      else this.selectedGeoZone = zone
    },
    isGeoZoneSelected (zone) {
      return this.selectedGeoZone.id == zone.id
    },
  },
  watch: {
    isLocalPush (val) {
      if (val) {
        // Reset other push options if local push is selected
        this.isSilentPush   = false
        this.selectedCities = []
      }
    },
    isSilentPush (val) {
      if (val) this.isLocalPush = false
    },
    selectedCities (val) {
      if (val.length > 0) this.isLocalPush = false
    }
  }
}
</script>

<style scoped lang="scss">

.create-push {

  padding:                      1em;
  border:                       1px solid #dfe0e2;
  border-radius:                1em;

  .message-title {
    width:                      60%;
    margin-bottom:              1em;
  }

  .push-message-body {
    height:                     10em;
    width:                      75%;
    font-size:                  1em;
    display:                    block;
    padding:                    0.5em;
    border-radius:              0.25em;
    border-color:               #dbdbdb;
    box-shadow:                 inset 0 1px 2px rgba(10, 10, 10, 0.1);
    color:                      #363636;
  }

  .message-warning {
    width:                      75%;
    font-style:                 italic;
    font-size:                  0.9em;
    margin-top:                 0.5em;
  }

  .remaining-characters {
    margin-top:                 1em;

    > input {
      font-size:                0.9em;
      text-align:               center;
    }
  }

  .link-container {
    margin:                     1em 0;

    > input {
      width:                    60%;
    }
  }

  .options-list {

    margin-top:                 1.25em;

    > h2 {
      margin:                   0.5em 0;
      font-size:                1.15em;
    }

    .options-container {
      padding:                  0 0.5em;
    }

    .option {
      padding:                      0.25em 0.5em;
      border-radius:                1em;
      border:                       1px solid black;
      display:                      inline-block;
      margin:                       0.25em;
      cursor:                       pointer;
      background-color:             whitesmoke;
      font-size:                    0.8em;

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

    .no-results {
      font-style:                   italic;
      padding:                      0.25em 0.5em;
    }
  }

  .geo-zones-list {
    .geo-zone-container {
      padding:                      0 0.5em;
    }
  }

  .silent-push {
    display:                        flex;
    align-items:                    center;
    flex-wrap:                      wrap;
    margin-top:                     1em;

    > input {
      margin-right:                 0.5em;
      display:                      inline-block;
    }

    .fa-info-circle {
      margin-left:                  0.5em;
      cursor:                       pointer;
    }

    .silent-push-options {
      display:                      block;
      width:                        100%;
      padding:                      0.25em 1em;

      .option {
        display:                    flex;
        align-items:                center;
        margin:                     0.5em 0;

        > span {
          width:                    9em;
        }

        .input {
          max-width:                5em;
          height:                   1.75em;
        }
      }
    }
  }

  .cancel-save {
    margin-top:                     2em;
  }

}

</style>
