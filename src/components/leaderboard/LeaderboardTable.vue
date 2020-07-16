<template>
  <div class="leaderboard-table">

    <v-server-table ref="usersTable" v-bind:columns="columns" v-bind:options="options">
      <span slot="vert" slot-scope="props" class="vert">{{commaSeparateNumber(props.row.totalDistanceVertical)}}</span>
      <a slot="view" slot-scope="props" class="view-user" v-on:click="showUser(props.row)">View</a>
    </v-server-table>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SiteHeader from '../SiteHeader.vue'
import { LoadingSpinner } from '../../components'
import AdminDatepicker from '../../components/utilities/AdminDatepicker'
import store from '../../store'
import stringHelper from '../../helpers/stringHelper'

export default {
  components: {
    SiteHeader,
    LoadingSpinner,
    AdminDatepicker
  },
  props: ['startDate', 'endDate', 'queryStartDate', 'queryEndDate'],
  data () {
    return {
      isLoading:        true,
      customQuery:      {
        column:         null,
        operator:       null,
        value:          null
      },
      tableData:        {},
      columns:          ['rank', 'emailAddress', 'displayName', 'totalDaysSkied', 'totalTracks', 'vert', 'view'],
      options: {
        requestFunction (data) {
          return this.$parent.getLeaderboardData(data)

          // let parentComponent = context.$parent.createAppendUrl ? context.$parent : context.$parent.$parent
          //
          // let appendUrl = parentComponent.createAppendUrl(data)
          // return context.axios.get('/leaderboard' + appendUrl).then((data) => {
          //   return {
          //     data:   data.leaderboard,
          //     count:  data.count
          //   }
          // })
        },
        filterByColumn: true,
        perPage: 25,
        perPageValues: [10, 25, 50, 100, 250, 500],
        texts: {
          filter:   'Filter:',
          filterBy: 'Filter by {column}',
          count:    ''
        },
        pagination: { chunk: 25, dropdown: false },
        filterable: ['emailAddress', 'displayName'],
        sortable: ['totalDaysSkied', 'vert', 'totalTracks'],
        headings: {
          'displayName':      'Display Name',
          'emailAddress':     'Email Address',
          'totalDaysSkied':   'Days Skied',
          'vert':             'Total Vert.',
          'totalTracks':      'Total Tracks',
          'view':             ''
        }
      }
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'currentResort']),
    isQueryValid () {
      return this.customQuery.column && this.customQuery.operator && this.customQuery.value
    },
    isDateRangeValid () {
      return true
    }
  },
  beforeRouteEnter (to, from, next) {
    if (!localStorage.leaderboardToken) store.dispatch('authenticateLeaderboard').then(() => next() )
    else next()
  },
  created () {
    // this.getLeaderboardData()
  },
  methods: {
    getLeaderboardData (tableData) {
      if (tableData) this.tableData = tableData

      return this.axios.get('/leaderboard' + this.createAppendUrl(this.tableData)).then((response) => {
        this.$refs.usersTable.data  = response.leaderboard
        this.$refs.usersTable.count = response.count
        return {
          data:   response.leaderboard,
          count:  response.count
        }
      })
    },
    createAppendUrl (tableData) {
      let string = ''
      string += '?resort_identifier=' + this.currentResort.id
      string += '&exclude_profile_image=true'
      string += '&additional_properties=[ "total_days_skied", "total_distance_vertical", "total_tracks"]'

      // Hack... maps column name to query string we want. Maybe move to a function if it gets unwieldy
      if (tableData.orderBy && tableData.orderBy === 'vert') tableData.orderBy = "total_distance_vertical"

      if (tableData.orderBy)  string += '&order_by=' + stringHelper.unCamelize(tableData.orderBy)
      if (tableData.orderBy)  string += '&sort_order=' + (tableData.ascending ? "ASC" : "DESC")
      if (tableData.limit)    string += '&limit=' + tableData.limit
      if (tableData.page)     string += '&offset=' + tableData.page

      if (tableData.query) {
        if (tableData.query.displayName)   string += '&display_name=' + tableData.query.displayName
        if (tableData.query.emailAddress)  string += '&email_address=' + tableData.query.emailAddress
      }

      if (this.customQuery.column)    string += '&query_column=' + this.customQuery.column
      if (this.customQuery.operator)  string += '&query_operator=' + this.customQuery.operator
      if (this.customQuery.value)     string += '&query_value=' + this.customQuery.value

      if (this.queryStartDate)  string += '&start_date=' + this.queryStartDate
      if (this.queryEndDate)    string += '&end_date=' + this.queryEndDate

      return string
    },
    showUser (user) {
      this.$router.push({ name: 'LeaderboardUser', params: { external_id: user.externalId }, query: { startDate: this.startDate, endDate: this.endDate } })
    },
    runCustomQuery () {
      // this.$refs.usersTable.options.requestFunction({}, this.$refs.usersTable)
    }
  },
  watch: {
    '$route.query': {
      handler: function (newVal, oldVal) {
        // this.$refs.usersTable.options.requestFunction({}, this.$refs.usersTable)
        this.getLeaderboardData()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>

.leaderboard-table {

  .query-container {
    padding:                      0.5em 1em 1em 1em;;
    border:                       1px solid gray;
    background:                   #e1f0f6;
    border-radius:                0.5em;
    display:                      flex;
    align-items:                  center;
    flex-wrap:                    wrap;
    margin:                       1em 0;

    h2 {
      font-size:                  1.25em;
      margin-bottom:              0.25em;
      display:                    block;
      width:                      100%;
    }

    select, input {
      padding:                    0.25em 0.5em;
      margin-right:               0.5em;
    }

    .button {
      margin-left:                auto;
    }
  }

}

</style>
