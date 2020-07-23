<template>
  <div class="leaderboard">

    <div class="header">
      <h1>Leaderboard</h1>
    </div>

    <div class="query-container date-range">

      <div v-on:click="showDateRangePicker = !showDateRangePicker" class="header">
        <h2>Date Range</h2>

        <span v-show="showDateRangePicker">
          <i class="fas chevron fa-chevron-up" />
        </span>
        <span v-show="!showDateRangePicker">
          <i class="fas chevron fa-chevron-down" />
        </span>
      </div>

      <div v-if="showDateRangePicker" class="body">
        <AdminDatepicker
          v-bind:startDate="formattedStartDate"
          v-bind:endDate="formattedEndDate"
          v-on:removeDates="removeDates"
          v-on:runDateSearch="runDateSearch">
        </AdminDatepicker>
      </div>

    </div>

    <router-view
      v-bind:startDate="startDate"
      v-bind:endDate="endDate"
      v-bind:queryStartDate="queryStartDate"
      v-bind:queryEndDate="queryEndDate">
    </router-view>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SiteHeader from '../SiteHeader.vue'
import { LoadingSpinner } from '../../components'
import AdminDatepicker from '../../components/utilities/AdminDatepicker'
import store from '../../store'
import moment from 'moment'
import tz from 'moment-timezone'
import stringHelper from '../../helpers/stringHelper'

export default {
  components: {
    SiteHeader,
    LoadingSpinner,
    AdminDatepicker
  },
  data () {
    return {
      isLoading:              true,
      showDateRangePicker:    false,
      startDate:              this.$route.query.startDate,
      endDate:                this.$route.query.endDate
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'currentResort']),
    isQueryValid () {
      return this.customQuery.column && this.customQuery.operator && this.customQuery.value
    },
    formattedStartDate () {
      // Takes simple date string from URL and converts to date object for use in Datepicker component
      if (!this.startDate) return null
      let start = this.startDate
      let month = start.split('-')[0]
      let day   = start.split('-')[1]
      let year  = start.split('-')[2]

      return new Date(year, month -1, day)
    },
    formattedEndDate () {
      // Takes simple date string from URL and converts to date object for use in Datepicker component
      if (!this.endDate) return null
      let start = this.endDate
      let month = start.split('-')[0]
      let day   = start.split('-')[1]
      let year  = start.split('-')[2]

      return new Date(year, month -1, day)
    },
    queryStartDate () {
      // Date without timezones
      if (!this.startDate) return null
      return moment(this.startDate).format('YYYY-MM-DD') + 'T00:00:00-00:00'  // beginning of day
      // TODO convert timezone based on resort
    },
    queryEndDate () {
      // Date without timezones
      if (!this.endDate) return null
      return moment(this.endDate).format('YYYY-MM-DD') + 'T23:59:59-00:00'  // end of day
      // TODO convert timezone based on resort
    }
  },
  beforeRouteEnter (to, from, next) {
    if (!localStorage.leaderboardToken) {
      store.dispatch('authenticateLeaderboard').then(() => {
        if (to.name === 'Leaderboard') next('/leaderboard/table')
        else next()
      })
    } else {
      if (to.name === 'Leaderboard') next('/leaderboard/table')
      else next()
    }
  },
  created () {
    this.setDefaultDates()
  },
  methods: {
    removeDates () {
      this.startDate  = null
      this.endDate    = null

      this.$router.push({ query: {} }).catch(() => {})
    },
    runDateSearch (startDate, endDate) {
      let formatStart = moment.utc(startDate).format('MM-DD-YYYY')
      let formatEnd   = moment.utc(endDate).format('MM-DD-YYYY')

      this.$router.push({ query: { startDate: formatStart, endDate: formatEnd } }).catch(() => {})
    },
    setDefaultDates () {
      if (this.startDate || this.endDate) return
      if (!this.currentResort.seasonStart && this.currentResort.seasonEnd) return null
      this.startDate = this.currentResort.seasonStart
      this.endDate = this.currentResort.seasonEnd
      this.$router.push({ query: { startDate: this.startDate, endDate: this.endDate }}).catch(() => {})
    }
  },
  watch: {
    '$route.query': {
      handler: function (newVal, oldVal) {
        this.startDate  = this.$route.query.startDate
        this.endDate    = this.$route.query.endDate
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>

.leaderboard {

  .header {

    display:                      flex;
    align-items:                  center;

    > h1 {
      font-size:                  2em;
      display:                    inline-block;
    }
  }

  .date-range {
    padding:                      0.5em 1em;
    border:                       1px solid gray;
    background:                   #e1f0f6;
    border-radius:                0.5em;
    margin:                       1em 0;

    .header {
      display:                    flex;
      align-items:                center;
      cursor:                     pointer;

      h2 {
        font-size:                1.25em;
        display:                  block;
        width:                    100%;
      }

      .chevron {
        margin-left:              auto;
      }
    }
  }

}

</style>
