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

    <div class="link-container">
      <h2>Link:</h2>
      <input v-model="messageLink" v-bind:class="{ 'is-danger': !messageLinkIsValid }" class="input" type="text" name="limit">
      <span class="icon is-small is-right test-link" v-show="messageLink.length > 0">
        <a :href="messageLink" tabindex="-1" target="_blank">
          <i class="fas fa-external-link-alt" />
        </a>
      </span>
      <span class="tooltip">
        <i class="fa fa-info-circle"></i>
        <span class="tooltiptext top">Optional URL for web page containing additional information</span>
      </span>
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

    <div class="push-choice">
      <input v-model="isSelectedCitiesPush" type="checkbox">
      <label>Send to select cities</label>
      <span class="tooltip">
        <i class="fa fa-info-circle"></i>
        <span class="tooltiptext top">Sends message to only selected cities</span>
      </span>

      <transition name="fade">
        <div v-if="isSelectedCitiesPush" class="selected-cities-container options-list">
          <div v-if="pushWooshData.preferredCityOptions.length > 0" class="options-container">
            <span v-for="city in pushWooshData.preferredCityOptions" v-on:click="addOrRemoveCityFromSelected(city)" class="option" v-bind:class="{ selected : isCitySelected(city) }">
              {{ findSafeCityData(city, 'cityName') }} - <b>{{ findSafeCityData(city, 'count') }}</b>
            </span>
          </div>
          <div v-else class="no-results">
            You do not have any preferred cities. Please visit the settings page.
          </div>
        </div>
      </transition>
    </div>


    <div class="push-choice local-push">
      <input v-model="isLocalPush" type="checkbox">
      <label>Send to Local Area</label>
      <span v-if="localDevicesCount" class="device-count">&nbsp;({{localDevicesCount}} devices)</span>
      <span class="tooltip">
        <i class="fa fa-info-circle"></i>
        <span class="tooltiptext top">Sends the message only to users within 20km of the resort. To receive the message an app must be permitted to always track the user’s location.</span>
      </span>
    </div>

    <div class="push-choice">
      <input v-model="isSilentPush" type="checkbox">
      <label>Send as In-App Message</label>
      <span class="tooltip">
        <i class="fa fa-info-circle"></i>
        <span class="tooltiptext top">Presents the message only when the user brings the app to the foreground.</span>
      </span>

      <transition name="fade">
        <div v-if="isSilentPush" class="push-choice-options">
          <div class="option">
            <span class="option-title">Valid Duration:</span>
            <input v-model="silentSettings.validMinutes" class="input" type="number"><span>&nbsp;(min)</span>
            <span class="tooltip">
              <i class="fa fa-info-circle"></i>
              <span class="tooltiptext top">Time for which the message remains valid after it is sent.</span>
            </span>
          </div>
          <div class="option">
            <span class="option-title">Repeat Interval:</span><input v-model="silentSettings.repeatInterval" class="input" type="number"><span>&nbsp;(min)</span>
            <span class="tooltip">
              <i class="fa fa-info-circle"></i>
              <span class="tooltiptext top">Minimum interval between message presentations when the app comes to the foreground.</span>
            </span>
          </div>
          <div class="option">
            <span class="option-title">Repeat Limit:</span><input v-model="silentSettings.repeatLimit" class="input" type="number">
            <span class="tooltip">
              <i class="fa fa-info-circle"></i>
              <span class="tooltiptext top">The maximum number of times the message will be shown to the user.</span>
            </span>
          </div>
          <div class="option">
            <span class="option-title">Persists Until Dismissed:</span>
            <div class="toggle-container">
              <label for="no-sort" class="switch">
                <input v-model="silentSettings.isHighPriority" id="no-sort" type="checkbox">
                <span class="slider round"></span>
              </label>
            </div>
            <span class="tooltip">
              <i class="fa fa-info-circle"></i>
              <span class="tooltiptext top">Leaves the message on the screen until the user dismisses it.</span>
            </span>
          </div>
        </div>
      </transition>
    </div>

    <!-- <div class="push-choice home-tile">
      <input v-model="isTilePush" type="checkbox">
      <label>Send as Home Screen Tile</label>
      <span class="tooltip">
        <i class="fa fa-info-circle"></i>
        <span class="tooltiptext top">Display the message as a tile inserted at the top of the Home screen. Remains part of the Home screen until replaced with an empty message or a new message.</span>
      </span>
    </div> -->

    <div class="invalid-form-warning help is-danger" v-show="!formIsValid">Form contains missing or invalid data. Please fix errors.</div>
    <div class="invalid-form-warning help is-danger" v-show="!messageBodyExists && !isTilePush">Message Body is required.</div>
    <div class="invalid-form-warning help is-danger" v-show="!messageLinkIsValid">Message link is invalid. Link must begin with either "http://" or "https://".</div>

    <div class="cancel-save">
      <span class="button is-primary new-push-button" :disabled="!formIsValid" @click="showConfirmModal()">{{sendMessageText}}</span>
      <span class="button is-light new-push-button" @click="cancelMessage()">Cancel</span>
    </div>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import LoadingSpinner from '../utilities/LoadingSpinner.vue'
import validationHelper from '../../helpers/validationHelper'
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
      isTilePush:           false,
      isSelectedCitiesPush: false,
      localDevicesCount:    null,
      currentRetryCount:    0,
      formerRetryCount:     0,
      maxRetryCount:        3,
      silentSettings: {
        validMinutes:       60,
        repeatInterval:     1,
        repeatLimit:        1,
        isHighPriority:     false
      }
    }
  },
  computed: {
    ...mapGetters(['pushWooshData']),
    formIsValid () {
      if (this.isTilePush) return true
      if (this.messageBodyExists) return true
      return false
    },
    messageLinkIsValid () {
      if (this.messageLink.length === 0) return true
      return validationHelper.url(this.messageLink)
    },
    messageBodyExists () {
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
    // this.getGeoZones()
    this.getBaseDistanceStats(this.pushWooshData.baseDistanceRequestIds.current)
  },
  methods: {
    findSafeCityData (city, fieldName) {
      if (this.pushWooshData.exportSubscribersCityOptions[city]) return this.pushWooshData.exportSubscribersCityOptions[city][fieldName]
      else if (fieldName === 'count') return 'N/A'
      else return city
    },
    getGeoZones () {
      this.geoZonesAreLoading = true

      let baseUrl = functionsBaseUrl + '/getGeoZones'
      baseUrl += '?applicationCode=' + this.pushWooshData.appId

      this.axios.get(baseUrl).then((response) => {
        let body                = JSON.parse(response.data.body)
        this.geoZones           = body.response.clusters
        this.geoZonesAreLoading = false
      })
    },
    getBaseDistanceStats (requestId) {
      this.currentRetryCount  = 0      // Reset retry count on new open
      this.formerRetryCount   = 0
      this.getBaseDistanceStatsResults(requestId)
    },
    getBaseDistanceStatsResults (requestId) {
      let baseUrl = functionsBaseUrl + '/getResults'
      baseUrl += "?requestId=" + requestId

      this.axios.get(baseUrl).then((response) => {
        // If request is still processing, get older data, if it exists
        if (response.data.error && this.pushWooshData.baseDistanceRequestIds.former) {
          if (this.currentRetryCount < this.maxRetryCount) {
            this.currentRetryCount += 1
            this.getBaseDistanceStatsResults(this.pushWooshData.baseDistanceRequestIds.current)
          } else {
            if (this.formerRetryCount > this.maxRetryCount) return
            this.formerRetryCount += 1
            this.getBaseDistanceStatsResults(this.pushWooshData.baseDistanceRequestIds.former)
          }
        } else {
          // Reset pending retry values
          this.currentRetryCount  = 0
          this.formerRetryCount   = 0

          let parsed = JSON.parse(response.data.body)
          this.localDevicesCount = parsed.response.devices_count
        }
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
        startTime:        moment.utc().format(),
        selectedCities:   this.selectedCityNames,
        geoZone:          this.selectedGeoZone,
        messageLink:      this.messageLink,
        silentSettings:   this.isSilentPush ? this.silentSettings : undefined,     // only send if active
        isTilePush:       this.isTilePush
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
        this.isSilentPush         = false
        this.selectedCities       = []
        this.isSelectedCitiesPush = false
        this.isTilePush           = false
      }
    },
    isSilentPush (val) {
      if (val) {
        this.isLocalPush          = false
        this.selectedCities       = []
        this.isSelectedCitiesPush = false
        this.isTilePush           = false
      }
    },
    isSelectedCitiesPush (val) {
      if (val) {
        this.isLocalPush  = false
        this.isSilentPush = false
        this.isTilePush   = false
      }
    },
    isTilePush (val) {
      if (val) {
        this.isLocalPush          = false
        this.selectedCities       = []
        this.isSelectedCitiesPush = false
        this.isSilentPush         = false
      }
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
    width:                      65%;
    position:                   relative;

    .icon {
      position:                 absolute;
      right:                    0.5em;
      top:                      0.65em;
      right:                    3.5em;
      top:                      2.1em;
    }

    > input {
      width:                    90%;
    }
  }

  .options-list {

    padding:                      0.25em 1em;

    > h2 {
      margin:                     0.5em 0;
      font-size:                  1.15em;
    }

    .options-container {
      padding:                    0 0.5em;
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

  .local-push {

    .device-count {
      font-style:                   italic;
    }
  }

  .push-choice {
    display:                        flex;
    align-items:                    center;
    flex-wrap:                      wrap;
    margin:                         0.25em 0;

    > input {
      margin-right:                 0.5em;
      display:                      inline-block;
    }

    .fa-info-circle {
      margin-left:                  0.5em;
      cursor:                       pointer;
    }

    .selected-cities-container {
      width:                        100%;
    }

    .push-choice-options {
      display:                      block;
      width:                        100%;
      padding:                      0.25em 1em;

      &.no-results {
        font-style:                 italic;
      }

      .option {
        display:                    flex;
        align-items:                center;
        margin:                     0.5em 0;

        .option-title {
          width:                    12em;
        }

        .toggle-container {
          width:                    auto;
        }

        .input {
          max-width:                5em;
          height:                   1.75em;
        }
      }
    }
  }

  .invalid-form-warning {
    text-align:                     left;
    margin-top:                     0.5em;
  }

  .cancel-save {
    margin-top:                     2em;
  }

}

</style>
