<template>
  <div class="settings">
    <site-header title="Settings" />
    <button v-on:click="setExportSubscribersRequestId()">Refresh request_id</button>
    <button v-on:click="resetApplicationSubscribers(currentRequestData.currentRequestId)">Reset subscribers</button>
    <button v-on:click="saveSubscriberCityOptions()">Save Subscribers</button>
    <div class="current-request-id">Request Id: {{currentRequestData.currentRequestId}}</div>
    <div class="current-request-id">Request Date: {{currentRequestData.currentRequestDate}}</div>

    <div class="preferred-cities-container">
      <h2 class="subtitle">Your Preferred Cities</h2>
      <div class="city-options-list">
        <span v-for="city in pushWooshData.preferredCityOptions" v-on:click="addOrRemoveCityOptionFromPreferred(city)" class="city-option preferred">
          {{ findSafeCityData(city, 'cityName') }} - <b>{{ findSafeCityData(city, 'count') }}</b>
          <span> (X) </span>
        </span>
      </div>
    </div>

    <LoadingSpinner v-if="isResettingSubscribers" isBlack="true"></LoadingSpinner>
    <div v-else>
      <div class="city-options-container city-options-list">
        <h2 class="subtitle">Most Popular Cities</h2>
        <span v-for="key in topCityOptionsKeys" v-on:click="addOrRemoveCityOptionFromPreferred(key)" class="city-option" v-bind:class="{ preferred : isCityPreferredCityOption(key) }">
          {{ findSafeCityData(key, 'cityName') }} - <b>{{ findSafeCityData(key, 'count') }}</b>
        </span>
      </div>

      <div class="city-options-search-container city-options-list">
        <h2 class="subtitle">Search All Your Cities</h2>
        <input v-model="currentCityOptionsSearch" class="input" placeholder="Search by city name..." />
        <div v-if="currentSearchResults.length > 0">
          <span v-for="city in currentSearchResults" v-on:click="addOrRemoveCityOptionFromPreferred(city)" class="city-option" v-bind:class="{ preferred : isCityPreferredCityOption(city) }">
            {{ findSafeCityData(city, 'cityName') }} - <b>{{ findSafeCityData(city, 'count') }}</b>
          </span>
        </div>
        <div v-else-if="currentCityOptionsSearch.length > 0" class="no-results">
          No results. Please refine your search
        </div>
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
      currentRequestData:           {},
      currentCityOptionsSearch:     ''
    }
  },
  computed: {
    ...mapGetters(['pushWooshData']),
    sortedCityOptionsKeys () {
      let options = this.pushWooshData.exportSubscribersCityOptions
      return Object.keys(options).sort((a,b) => { return options[b]['count'] - options[a]['count'] })
    },
    topCityOptionsKeys () {
      let topNumber = 20
      return this.sortedCityOptionsKeys.slice(0, 20)
    },
    currentSearchResults () {
      if (this.currentCityOptionsSearch.length === 0) return []

      let results = []

      Object.keys(this.pushWooshData.exportSubscribersCityOptions).forEach((key) => {
        if (this.pushWooshData.exportSubscribersCityOptions[key]['cityName'].includes(this.currentCityOptionsSearch)) results.push(key)
      })

      return results
    }
  },
  created() {
    // this.setExportSubscribersRequestId()
    // this.resetApplicationSubscribers(this.pushWooshData.exportSubscribers.currentRequestId)
    this.setCurrentRequestData()
  },
  methods: {
    findSafeCityData (city, fieldName) {
      if (this.pushWooshData.exportSubscribersCityOptions[city]) return this.pushWooshData.exportSubscribersCityOptions[city][fieldName]
      else if (fieldName === 'count') return 'N/A'
      else return city
    },
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
    isCityPreferredCityOption (key) {
      return this.pushWooshData.preferredCityOptions.includes(key)
    },
    addOrRemoveCityOptionFromPreferred (key) {
      if (this.isCityPreferredCityOption(key)) {
        // remove city
        let index = this.pushWooshData.preferredCityOptions.indexOf(key)
        this.pushWooshData.preferredCityOptions.splice(index, 1)
        this.$store.dispatch('savePushwooshData', this.pushWooshData)
      } else {
        // TODO
        // Add loading step
        this.pushWooshData.preferredCityOptions.push(key)
        this.$store.dispatch('savePushwooshData', this.pushWooshData)
      }

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

      })
    },
    incrementCityCount (city) {
      let newCityName = city.replace(/,/g, '').replace(/ /g, '_')

      if (this.cityOptions[newCityName]) {
        let currentValue = this.cityOptions[newCityName]
        currentValue.count += 1
        Vue.set(this.cityOptions, newCityName, currentValue)
      } else {
        Vue.set(this.cityOptions, newCityName, { cityName: city, count: 1 } )
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.settings {

  .subtitle {
    margin-top:                     1em;
  }

  .city-options-list {

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

      &.preferred {
        background-color:           #209cee;
        color:                      white;
        border:                     1px solid white;
      }
    }
  }

  .city-options-search-container {
    margin-bottom:                  8em;

    .no-results {
      margin:                       1em 0.5em;
      font-style:                   italic;
    }
  }

}
</style>
