<template>
  <div class="leaderboard-user">

    <LoadingSpinner v-if="isLoadingUser"></LoadingSpinner>

    <div v-else class="user-summary">
      <div v-on:click="backToTable()" class="go-back"><< Back to table</div>

      <section class="header">
        <img v-if="userSummary.profileImage" v-bind:src="userImage" />
        <div class="header-right">
          <h1>{{userSummary.displayName}}</h1>
          <span class="email">Email Address: {{ userSummary.emailAddress }} </span>
          <span class="created-at">Member Since: {{ formatDate(userSummary.createdAt, 'MM/DD/YYYY') }} </span>
        </div>
      </section>

      <section class="body">
        <div class="block">
          <span class="metric">{{ commaSeparateNumber(userSummary.totalDaysSkied) }}</span>
          <span class="name">Total Days</span>
        </div>
        <div class="block">
          <span class="metric">{{ commaSeparateNumber(userSummary.totalLiftRides) }}</span>
          <span class="name">Total Lift Rides</span>
        </div>
        <div class="block">
          <span class="metric">{{ commaSeparateNumber(userSummary.totalTracks) }}</span>
          <span class="name">Total Tracks</span>
        </div>
        <div class="block">
          <span class="metric">{{ commaSeparateNumber(userSummary.totalKcals) }}</span>
          <span class="name">Total Kcals</span>
        </div>
        <div class="block">
          <span class="metric">{{ commaSeparateNumber(convertToKph(userSummary.speedAverage)) }}</span>
          <span class="name">Avg. Speed (km/h)</span>
        </div>
        <div class="block">
          <span class="metric">{{ commaSeparateNumber(convertToKph(userSummary.speedMax)) }}</span>
          <span class="name">Max Speed (km/h)</span>
        </div>
        <div class="block">
          <span class="metric">{{ commaSeparateNumber(userSummary.totalDistanceVertical) }}</span>
          <span class="name">Total Vertical Distance (m)</span>
        </div>
        <div class="block">
          <span class="metric">{{ commaSeparateNumber(surfaceDistanceInKm) }}</span>
          <span class="name">Total Surface Distance (km)</span>
        </div>
      </section>
    </div>


    <LoadingSpinner v-if="isLoadingResortDays"></LoadingSpinner>
    <div v-else class="resort-days">

      <h2>Ski Days</h2>

      <div v-if="resortDays.length > 0">
        <div v-for="resortDay in resortDays" class="resort-day-container">
          <section class="header" v-on:click="showResortDay(resortDay, $event)">
            <span class="date">{{ formatDate(resortDay.date, 'll', true) }}</span> <!-- We do not want to convert this date to a specific timezone, as it is stored as beginning of day in UTC -->
            <span class="tracks">{{ resortDay.tracks.length }} Runs</span>
          </section>
          <section class="body" v-if="openPanels.includes(resortDay.id)">
            <div class="detail">
              <label>Kcals:</label><span class="kcals">{{resortDay.kcals || 'N/A'}}</span>
            </div>

            <v-client-table v-bind:data="resortDay.tracks" v-bind:columns="trackColumns" v-bind:options="trackOptions" class="track-table">
              <span slot="startTime" slot-scope="props" class="start-date">{{ formatDate(props.row.startTime, 'HH:mm:ss') }}</span>
            </v-client-table>
          </section>
        </div>
      </div>
      <div v-else class="no-results">
        No results found, please refine your search.
      </div>

    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { LoadingSpinner } from '../../components'
import SiteHeader from '../SiteHeader.vue'
import moment from 'moment'
import arrayHelper from '../../helpers/arrayHelper.js'
import numberHelper from '../../helpers/numberHelper.js'

export default {
  components: {
    LoadingSpinner,
    SiteHeader
  },
  props: ['startDate', 'endDate', 'queryStartDate', 'queryEndDate'],
  data () {
    return {
      userSummary:          {},
      resortDays:           [],
      isLoadingUser:        true,
      isLoadingResortDays:  true,
      openPanels:           [],
      trackColumns:         ['startTime', 'liftName', 'duration', 'distanceVertical', 'distanceSurface', 'speedMax'],
      trackOptions: {
        filterable: false,
        filterByColumn: false,
        perPage: 25,
        perPageValues: [10, 25, 50, 100, 250, 500],
        pagination: { chunk: 10, dropdown: false },
        sortable: ['startTime', 'liftName', 'duration', 'distanceVertical', 'distanceSurface', 'speedMax'],
        headings: {
          'startTime': 'Time',
          'liftName': 'Lift',
          'distanceVertical': 'Vertical Dist.',
          'distanceSurface': 'Surface Dist.',
          'speedMax': 'Max Speed'
        },
        descOrderColumns: ['createdAt'],
        orderBy: {
          column: 'createdAt',
          ascending: false
        },
        rowAttributesCallback (row) {
          for (var key in row) {
            if (row.hasOwnProperty(key)) {
              if (['distanceSurface', 'distanceVertical', 'duration'].includes(key)) {
                row[key] = numberHelper.commaSeparateNumber(row[key])
              }
              if (key === 'speedMax') row[key] = parseInt(row[key])
            }
          }
        }
      },
    }
  },
  computed: {
    ...mapGetters(['currentResort']),
    userImage () {
      return 'data:image/png;base64,' + this.userSummary.profileImage
    },
    currentParams () {
      let string = '?'
      if (this.queryStartDate)  string += '&start_date=' + this.queryStartDate
      if (this.queryEndDate)    string += '&end_date=' + this.queryEndDate
      return string
    },
    surfaceDistanceInKm () {
      return (this.userSummary.totalDistanceSurface / 1000).toFixed(2)
    }
  },
  created () {
    this.getUserSummaryData()
    this.getUserResortDays()
  },
  methods: {
    getUserSummaryData () {
      this.axios.get('/users/' + this.$route.params.external_id + '/summary' + this.currentParams).then((data) => {
        this.userSummary    = data.userSummary
        this.isLoadingUser  = false
      }).catch((err) => {
        console.log(err)
      })
    },
    getUserResortDays () {
      this.isLoadingResortDays = true
      this.axios.get('/users/' + this.$route.params.external_id + '/resort_days' + this.currentParams).then((data) => {
        this.resortDays           = data.resortDays
        this.isLoadingResortDays  = false
      }).catch((err) => {
        console.log(err)
      })
    },
    formatDate (date, format, isUtc) {
      if (isUtc) return moment.utc(date).format(format)
      return moment(date).tz(this.currentResort.timezone).format(format)
    },
    showResortDay (resortDay, event) {
      if (this.openPanels.includes(resortDay.id)) {
        arrayHelper.removeValue(this.openPanels, resortDay.id)
      } else {
        this.openPanels.push(resortDay.id)
      }
    },
    backToTable () {
      this.$router.push({ name: 'LeaderboardTable', query: { startDate: this.startDate, endDate: this.endDate } })
    },
    convertToKph (speed) {
      return (speed * 3.6).toFixed(2)
    }
  },
  watch: {
    '$route.query': {
      handler: function (newVal, oldVal) {
        this.getUserSummaryData()
        this.getUserResortDays()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>

.leaderboard-user {

  .user-summary {

    .go-back {
      cursor:                           pointer;
      color:                            #42b983;

      &:hover {
        color:                          black;
      }
    }

    margin-top:                         1em;

    .header {

      display:                          flex;
      align-items:                      center;

      > img {
        height:                         4em;
        width:                          auto;
        margin-right:                   1em;
      }

      .header-right {

        > h1 {
          font-size:                    2em;
          font-weight:                  bold;
        }

        > span {
          display:                      block;
        }
      }
    }

    .body {
      display:                          flex;
      flex-wrap:                        wrap;
      margin-top:                       2em;

      .block {
        display:                        flex;
        flex-wrap:                      wrap;
        width:                          23%;
        margin:                         1%;
        text-align:                     center;
        margin-top:                     1em;
        min-height:                     8em;
        padding:                        0.5em;
        border:                         1px solid black;
        border-radius:                  5px;

        .metric {
          font-size:                    2em;
          width:                        100%;
          word-wrap:                    break-word;
        }

        .name {
          display:                      block;
          width:                        100%;
          word-wrap:                    break-word;
        }
      }
    }
  }

  .resort-days {

    margin-top:                         1.5em;

    > h2 {
      font-size:                        2em;
      margin-bottom:                    0.5em;
    }

    .resort-day-container {
      border:                           1px solid #dfe0e2;
      border-radius:                    0.25em;
      margin-bottom:                    0.88em;

      .header {
        display:                        flex;
        align-items:                    center;
        cursor:                         pointer;
        background:                     #dfe0e2;
        padding:                        0.88em;

        .date {
          margin-left:                  0.5em;
        }

        .tracks {
          margin-left:                  auto;
          margin-right:                 1em;
        }
      }

      .body {
        padding:                        1.5em 2em;

        .detail {

          display:                      flex;
          word-wrap:                    break-word;

          > label {
            font-weight:                bold;
            width:                      15%;
          }

          > span {
            width:                      80%;
          }
        }

        .track-table {
          margin-top:                   2em;
        }
      }
    }
  }
}

</style>
