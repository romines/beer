<template>
  <div class="settings">
    <site-header title="Settings" />

    <div class="preferred-cities-container">
      <h2 class="subtitle">Your Preferred Cities</h2>
      <span class="tooltip">
        <i class="fa fa-info-circle"></i>
        <span class="tooltiptext top">Click on a city to remove it from the list</span>
      </span>
      <div v-if="pushWooshData.preferredCityOptions.length > 0" class="city-options-list">
        <span v-for="city in pushWooshData.preferredCityOptions" v-on:click="addOrRemoveCityOptionFromPreferred(city)" class="city-option preferred">
          {{ findSafeCityData(city, 'cityName') }} - <b>{{ findSafeCityData(city, 'count') }}</b>
          <span> (X) </span>
        </span>
      </div>
      <div v-else class="no-cities">
        No preferred cities have been set.
      </div>
    </div>

    <LoadingSpinner v-if="isResettingSubscribers" isBlack="true"></LoadingSpinner>
    <div v-else>
      <h2 class="subtitle">Most Popular Cities</h2>
      <span class="tooltip">
        <i class="fa fa-info-circle"></i>
        <span class="tooltiptext top">Click on a city to add it to your Preferred Cities</span>
      </span>
      <div class="city-options-container city-options-list">
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

import { mapGetters } from 'vuex'
import SiteHeader from './SiteHeader.vue'
import parse from 'csv-parse'
import Vue from 'vue'
import LoadingSpinner from './utilities/LoadingSpinner.vue'
import moment from 'moment'
import { functionsBaseUrl } from '../firebaseInit.js'

export default {
  components: {
    SiteHeader,
    LoadingSpinner
  },
  data () {
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
  created () { },
  methods: {
    findSafeCityData (city, fieldName) {
      if (this.pushWooshData.exportSubscribersCityOptions[city]) return this.pushWooshData.exportSubscribersCityOptions[city][fieldName]
      else if (fieldName === 'count') return 'N/A'
      else return city
    },
    isCityPreferredCityOption (key) {
      return this.pushWooshData.preferredCityOptions.includes(key)
    },
    addOrRemoveCityOptionFromPreferred (key) {
      if (this.isCityPreferredCityOption(key)) {
        // Remove city
        let index = this.pushWooshData.preferredCityOptions.indexOf(key)
        this.pushWooshData.preferredCityOptions.splice(index, 1)
        this.$store.dispatch('updatePushWooshData', this.pushWooshData)
      } else {
        // Add city
        this.pushWooshData.preferredCityOptions.push(key)
        this.$store.dispatch('updatePushWooshData', this.pushWooshData)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.settings {

  .subtitle {
    margin-top:                     1em;
    display:                        inline-block;
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

  .no-cities {
    font-style:                     italic;
    padding:                        0.5em 1em;
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
