<template>
  <div class="settings">
    <site-header title="Settings" />

    <button v-if="this.requestId" v-on:click="getApplicationSubscribers()">Get Subscribers</button>

    <LoadingSpinner v-if="isPageLoading" isBlack="true"></LoadingSpinner>
    <div v-else class="city-options-container">
      <div v-for="(value, key) in this.cityOptions">
        {{key}}
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

export default {
  components: {
    SiteHeader,
    LoadingSpinner
  },
  data() {
    return {
      cityOptions:      {},
      isPageLoading:    false,
      requestId:        ''
    }
  },
  computed: {
    ...mapGetters(['pushWooshData'])
  },
  created() {
    this.setExportSubscribersRequestId()
    // this.getApplicationSubscribers()
  },
  methods: {
    setExportSubscribersRequestId () {
      let baseUrl = 'http://localhost:5001/rta-staging/us-central1/exportSubscribers'
      baseUrl += "?applicationCode=" + this.pushWooshData.appId

      this.axios.get(baseUrl).then((response) => {
        this.requestId = response.data
      })
    },
    getApplicationSubscribers () {
      this.isPageLoading = true

      let baseUrl = 'http://localhost:5001/rta-staging/us-central1/getResults'
      baseUrl += "?requestId=" + this.requestId

      this.axios.get(baseUrl).then((response) => {

        if (response.data.error) {
          this.isPageLoading = false
        } else {
          let csvData = response.data.body

          let parsed = parse(csvData, {}, (err, output) => {
            output.forEach((row, index) => {
              if (index === 0) return true
              if (row[5]) {
                let parsedRow = JSON.parse(row[5])
                if (parsedRow.City) this.incrementCityCount(parsedRow.City)
              }
            })
          })

          this.isPageLoading = false
        }
      })
    },
    incrementCityCount (city) {
      if (this.cityOptions[city]) {
        let currentValue = this.cityOptions[city]
        Vue.set(this.cityOptions, city, currentValue + 1)
      } else {
        Vue.set(this.cityOptions, city, 1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.settings {


}
</style>
