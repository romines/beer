<template>
  <div class="settings">
    <site-header title="Settings" />

    {{this.cityOptions}}
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import SiteHeader from './SiteHeader.vue'
import parse from 'csv-parse'
import Vue from 'vue'

export default {
  components: {
    SiteHeader
  },
  data() {
    return {
      cityOptions:    {}
    }
  },
  computed: {
    ...mapGetters(['pushWooshData'])
  },
  created() {
    this.getApplicationSubscribers()
  },
  methods: {
    getApplicationSubscribers () {
      let baseUrl = 'http://localhost:5001/rta-staging/us-central1/exportSubscribers'
      baseUrl += "?applicationCode=" + this.pushWooshData.appId

      this.axios.get(baseUrl).then((response) => {
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

        // this.axios.get(url).then((response) => {
        //   console.log(response)
        // })
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
