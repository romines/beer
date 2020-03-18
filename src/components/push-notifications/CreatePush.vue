<template>
  <div class="create-push">
    <h2 class="subtitle">New Push Notification</h2>

    <h2>Title:</h2>
    <input v-model="messageTitle" class="input message-title" type="text" name="title">

    <h2>Message Body:</h2>
    <textarea v-model="messageBody" maxlength="200" class="push-message-body" placeholder="Type your push message here..." />

    <div class="remaining-characters">
      <span class="">Notifications may be up to 200 characters in length. Available characters:</span>
      <input v-bind:value="remainingCharacters" type="text" name="limit" size="4" readonly>
    </div>

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

    <div class="geo-zones-list options-list">
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
      geoZonesAreLoading:   false
    }
  },
  computed: {
    ...mapGetters(['pushWooshData']),
    remainingCharacters () {
      return this.messageLimit - this.messageBody.length
    },
    messageIsValid () {
      return this.messageBody.length > 0
    },
    sendMessageText () {
      if (Object.keys(this.selectedGeoZone).length > 0) return 'Send to all users in zone'
      else if (this.selectedCities.length > 0) return 'Send to selected cities'
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
      let baseUrl = 'http://localhost:5001/rta-staging/us-central1/getGeoZones'
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
        let baseUrl = 'http://localhost:5001/rta-staging/us-central1/createPushNotification'
        baseUrl += '?applicationCode=' + this.pushWooshData.appId

        this.$store.dispatch('setModalLoadingState', true)

        this.axios.post(baseUrl, {
          messageBody:      this.messageBody,
          messageTitle:     this.messageTitle,
          selectedCities:   this.selectedCityNames,
          geoZone:          this.selectedGeoZone,
          messageLink:      this.messageLink
        }).then((response) => {
          this.$store.dispatch('setModalLoadingState', false)
          // console.log(response)
          this.$store.dispatch('showSuccessModal', 'Message successfully sent!')
          this.cancelMessage()
          this.$emit('pushCreated')
        }).catch((response) => {
          this.$store.dispatch('setModalLoadingState', false)
          this.$store.dispatch('showErrorModal', 'There was an error with your request and your message was not sent. Please try again later or contact Resorts Tapped for support.')
          this.cancelMessage()
        })
      }

      this.$store.commit('SHOW_MODAL', {
        heading:      'Please confirm that you want to send the following message:',
        bolded:       this.messageTitle,
        message:      this.messageBody,
        showLoading:  false,
        onConfirm,
      })
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

  .remaining-characters {
    margin-top:                 1em;

    > input {
      font-size:                0.9em;
      text-align:               center;
    }
  }

  .link-container {
    display:                    flex;
    align-items:                center;
    margin:                     0.75em 0;

    > h2 {
      margin:                   0.5em 0;
      font-size:                1.15em;
    }

    > input {
      width:                    60%;
      margin-left:              0.5em;
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

  .cancel-save {
    margin-top:                 2em;
  }

}

</style>
