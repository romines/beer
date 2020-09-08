<template>
  <div class="leaderboard-table">

    <div class="query-container">
      <h2>Custom Query</h2>
      <select name="column" v-model="customQuery.column">
        <option disabled value="null">Select column...</option>
        <option value="total_days_skied">Days Skied</option>
        <option value="total_tracks">Total Tracks</option>
        <option value="total_distance_vertical">Total Vertical</option>
      </select>
      <select name="operator" v-model="customQuery.operator">
        <option disabled value="null">Select operator...</option>
        <option value="=">equals</option>
        <option value=">">is greater than</option>
        <option value="<">is less than</option>
      </select>
      <input v-model="customQuery.value" placeholder="Value (numbers only)" type="number">
      <div class="buttons">
        <span v-bind:disabled="!isQueryValid" v-on:click="runCustomQuery()" class="button is-primary">Search</span>
        <span v-on:click="removeCustomQuery()" class="button">Clear</span>
      </div>
    </div>

    <v-server-table ref="usersTable" v-bind:columns="columns" v-bind:options="options">
      <span slot="vert" slot-scope="props" class="vert">{{commaSeparateNumber(props.row.totalDistanceVertical)}}</span>
      <a slot="view" slot-scope="props" class="view-user" v-on:click="showUser(props.row)">View</a>
    </v-server-table>

    <VueJsonToCsv v-bind:json-data="exportData" csv-title="RT_Leaderboard" v-bind:labels="exportLabels" class="export-button">
      <button class="button is-primary" v-bind:disabled="!exportData.length > 0">Export Table</button>
    </VueJsonToCsv>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SiteHeader from '../SiteHeader.vue'
import { LoadingSpinner } from '../../components'
import AdminDatepicker from '../../components/utilities/AdminDatepicker'
import stringHelper from '../../helpers/stringHelper'
import VueJsonToCsv from 'vue-json-to-csv'

export default {
  components: {
    SiteHeader,
    LoadingSpinner,
    AdminDatepicker,
    VueJsonToCsv
  },
  props: ['startDate', 'endDate', 'queryStartDate', 'queryEndDate'],
  data () {
    return {
      isLoading:        true,
      customQuery: {
        column:         null,
        operator:       null,
        value:          null
      },
      queryIsActive:    false,
      tableData:        {},
      exportData:       [],
      columns:          ['rank', 'emailAddress', 'displayName', 'totalDaysSkied', 'totalTracks', 'vert', 'view'],
      options: {
        requestFunction (data) {
          return this.$parent.getLeaderboardData(data)
        },
        filterByColumn: true,
        perPage: 25,
        perPageValues: [10, 25, 50, 100, 50, 500],
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
      },
      exportLabels: {
        rank:                     { title: 'Rank' },
        emailAddress:             { title: 'Email Address' },
        displayName:              { title: 'Display Name'},
        totalDaysSkied:           { title: 'Total Days Skied' },
        totalTracks:              { title: 'Total Tracks' },
        totalDistanceVertical:    { title: 'Total Vertical' }
      }
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'currentResort']),
    isQueryValid () {
      return this.customQuery.column && this.customQuery.operator && this.customQuery.value
    }
  },
  created () {

  },
  methods: {
    getLeaderboardData (tableData) {
      if (tableData) this.tableData = tableData

      this.getExportData()

      return this.axios.get('/leaderboard' + this.createAppendUrl(this.tableData)).then((response) => {
        this.$refs.usersTable.data  = response.leaderboard
        this.$refs.usersTable.count = response.count
        return {
          data:   response.leaderboard,
          count:  response.count
        }
      })
    },
    getExportData () {
      this.exportData = []
      return this.axios.get('/leaderboard' + this.createAppendUrl(this.tableData, true)).then((response) => {
        this.exportData = response.leaderboard
      })
    },
    createAppendUrl (tableData, skipLimit) {
      let string = ''
      string += '?resort_identifier=' + this.currentResort.id
      string += '&exclude_profile_image=true'
      string += '&additional_properties=[ "total_days_skied", "total_distance_vertical", "total_tracks"]'

      // Hack... maps column name to query string we want. Maybe move to a function if it gets unwieldy
      if (tableData.orderBy && tableData.orderBy === 'vert') tableData.orderBy = "total_distance_vertical"

      // Do not allow orderBy when we also have custom query
      if (!this.queryIsActive) {
        if (tableData.orderBy)  string += '&order_by=' + stringHelper.unCamelize(tableData.orderBy)
        if (tableData.orderBy)  string += '&sort_order=' + (tableData.ascending ? "ASC" : "DESC")
      }

      if (tableData.query) {
        if (tableData.query.displayName)   string += '&display_name=' + tableData.query.displayName
        if (tableData.query.emailAddress)  string += '&email_address=' + tableData.query.emailAddress
      }

      if (!skipLimit) {
        if (tableData.limit)  string += '&limit=' + tableData.limit
        if (tableData.page)   string += '&offset=' + tableData.page
      }

      if (this.customQuery.column)    string += '&query_column=' + this.customQuery.column
      if (this.customQuery.operator)  string += '&query_operator=' + this.customQuery.operator
      if (this.customQuery.value)     string += '&query_value=' + this.customQuery.value

      if (this.queryStartDate)  string += '&start_date=' + this.queryStartDate
      if (this.queryEndDate)    string += '&end_date=' + this.queryEndDate

      if (this.currentResort.unitType === 'imperial') string += '&units=imperial'


      return string
    },
    showUser (user) {
      this.$router.push({ name: 'LeaderboardUser', params: { external_id: user.externalId }, query: { startDate: this.startDate, endDate: this.endDate } })
    },
    runCustomQuery () {
      this.queryIsActive = true
      this.getLeaderboardData()
    },
    removeCustomQuery () {
      this.customQuery = {
        column:         null,
        operator:       null,
        value:          null
      }
      this.queryIsActive = false
      this.getLeaderboardData()
    }
  },
  watch: {
    '$route.query': {
      handler: function (newVal, oldVal) {
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

    .buttons {

      margin-left:                auto;

      .button {

      }
    }
  }

}

</style>
