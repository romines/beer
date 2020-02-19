<template>
  <div class="settings">
    <site-header title="Settings" />
    <button v-on:click="setExportSubscribersRequestId()">Refresh request_id</button>
    <button v-on:click="resetApplicationSubscribers(currentRequestData.currentRequestId)">Reset subscribers</button>
    <button v-on:click="saveSubscriberCityOptions()">Save Subscribers</button>

    <div class="preferred-cities-container">
      Preferred Cities: {{pushWooshData.preferredCities}}
      {{topCityOptions}}
    </div>

    <LoadingSpinner v-if="isResettingSubscribers" isBlack="true"></LoadingSpinner>
    <div v-else class="city-options-container">
      <div class="current-request-id">Request Id: {{currentRequestData.currentRequestId}}</div>
      <div class="current-request-id">Request Date: {{currentRequestData.currentRequestDate}}</div>
      <div v-for="key in topCityOptionsKeys">
        {{key}} - {{pushWooshData.exportSubscribersCityOptions[key]}}
      </div>

    </div>
  </div>
</template>

<script>

// TODO
// Allow add/remove by click functionality for settings
// Allow typeahead search for other city options

import { mapGetters } from 'vuex'
import SiteHeader from './SiteHeader.vue'
import parse from 'csv-parse'
import Vue from 'vue'
import LoadingSpinner from './utilities/LoadingSpinner.vue'
import moment from 'moment'

export default {
  components: {
    SiteHeader,
    LoadingSpinner
  },
  data() {
    return {
      cityOptions:                  {},
      isResettingSubscribers:       false,
      isSettingExportSubscribers:   false,
      currentRequestData:           {}
    }
  },
  computed: {
    ...mapGetters(['pushWooshData']),
    sortedCityOptionsKeys () {
      let options = this.pushWooshData.exportSubscribersCityOptions
      return Object.keys(options).sort(function(a,b){return options[b]-options[a]})
    },
    topCityOptionsKeys () {
      let topNumber = 20
      return this.sortedCityOptionsKeys.slice(0, 20)
    }
  },
  created() {
    // this.setExportSubscribersRequestId()
    // this.resetApplicationSubscribers(this.pushWooshData.exportSubscribers.currentRequestId)
    this.setCurrentRequestData()
  },
  methods: {
    setCurrentRequestData () {
      this.currentRequestData["currentRequestId"]   = this.pushWooshData.exportSubscribers.currentRequestId
      this.currentRequestData["currentRequestDate"] = moment(this.pushWooshData.exportSubscribers.currentRequestDate)
    },
    setCurrentRequestDataToLast (pushWooshData) {
      this.currentRequestData["currentRequestId"]   = pushWooshData.exportSubscribers.lastRequestId
      this.currentRequestData["currentRequestDate"] = pushWooshData.exportSubscribers.lastRequestDate
    },
    setExportSubscribersRequestId () {
      this.isSettingExportSubscribers = true

      let baseUrl = 'http://localhost:5001/rta-staging/us-central1/exportSubscribers'
      baseUrl += "?applicationCode=" + this.pushWooshData.appId

      this.axios.get(baseUrl).then((response) => {

        this.pushWooshData.exportSubscribers.lastRequestId        = this.pushWooshData.exportSubscribers.currentRequestId   || ''
        this.pushWooshData.exportSubscribers.lastRequestDate      = this.pushWooshData.exportSubscribers.currentRequestDate || ''
        this.pushWooshData.exportSubscribers.currentRequestId     = response.data
        this.pushWooshData.exportSubscribers.currentRequestDate   = moment().utc().toDate().toString()

        this.$store.dispatch('savePushwooshData', this.pushWooshData).then(() => {
          this.isSettingExportSubscribers = false
          this.setCurrentRequestData()
        })
      })
    },
    // TODO
    // I think it would be better to store this raw data on the pushWooshData object in firestore, that way it would load faster.
    // We would then need to just periodically update that data (every day?). Ideally automagically but manual could be an option.
    resetApplicationSubscribers (requestId) {
      this.isResettingSubscribers = true

      let baseUrl = 'http://localhost:5001/rta-staging/us-central1/getResults'
      baseUrl += "?requestId=" + requestId

      this.axios.get(baseUrl).then((response) => {
        if (response.data.error) {
          this.isResettingSubscribers = false
          if (response.data.error === "Request is still being processed") {
            // TODO
            // Display error message on screen
            console.log("REQUEST STILL PROCESSING")
            // this.setCurrentRequestDataToLast(this.pushWooshData)
            // this.resetApplicationSubscribers(this.pushWooshData.exportSubscribers.lastRequestId)
          }
        } else {
          let csvData = response.data.body

          let parsed = parse(csvData, {}, (err, output) => {
            output.forEach((row, index) => {
              if (index === 0) return true // Skip headers
              if (row[5]) {
                let parsedRow = JSON.parse(row[5])
                if (parsedRow.City) this.incrementCityCount(parsedRow.City)
              }
            })
          })
          console.log('SUBSCRIBERS RESET')
          this.isResettingSubscribers = false
        }
      })
    },
    saveSubscriberCityOptions () {
      // Only allow save if cityOptions is set
      if (Object.keys(this.cityOptions).length === 0) return

      this.pushWooshData.exportSubscribersCityOptions = this.cityOptions

      this.$store.dispatch('savePushwooshData', this.pushWooshData).then(() => {
        console.log('SAVED CITY OPTIONS')
      })
    },
    incrementCityCount (city) {
      let newCityName = city.replace(/,/g, '').replace(/ /g, '_')

      if (this.cityOptions[newCityName]) {
        let currentValue = this.cityOptions[newCityName]
        Vue.set(this.cityOptions, newCityName, currentValue + 1)
      } else {
        Vue.set(this.cityOptions, newCityName, 1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.settings {


}
</style>
