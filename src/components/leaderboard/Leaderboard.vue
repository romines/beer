<template>
  <div class="leaderboard">

    <site-header title="Leaderboard" />

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
import store from '../../store'
import stringHelper from '../../helpers/stringHelper'

export default {
  components: {
    SiteHeader,
    LoadingSpinner
  },
  data () {
    return {
      isLoading:        true,
      tableParams:      {},
      columns:          ['rank', 'emailAddress', 'displayName', 'totalDaysSkied', 'totalTracks', 'vert', 'view'],
      options: {
        requestFunction (data) {
          let parentComponent = this.$parent.$parent
          let appendUrl = parentComponent.createAppendUrl(data)
          return this.axios.get('/leaderboard' + appendUrl).then((data) => {
            return {
              data:   data.leaderboard,
              count:  data.count
            }
          })
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
  },
  beforeRouteEnter (to, from, next) {
    if (!localStorage.leaderboardToken) store.dispatch('authenticateLeaderboard').then(() => next() )
    else next()
  },
  created () {
    // this.getLeaderboardData()
  },
  methods: {
    getLeaderboardData (data) {
      if (data) this.tableParams = data

      return this.axios.get('/leaderboard' + this.currentAppendUrl).then((response) => {
        this.$refs.usersTable.data  = response.data.leaderboard
        this.$refs.usersTable.count = response.data.count
        return response.data
      })
    },
    createAppendUrl (data) {
      let string = ''
      string += '?resort_identifier=' + this.currentResort.id
      string += '&exclude_profile_image=true'
      string += '&additional_properties=[ "total_days_skied", "total_distance_vertical", "total_tracks"]'

      // Hack... maps column name to query string we want. Maybe move to a function if it gets unwieldy
      if (data.orderBy && data.orderBy === 'vert') data.orderBy = "total_distance_vertical"

      if (data.orderBy)             string += '&order_by=' + stringHelper.unCamelize(data.orderBy)
      if (data.orderBy)             string += '&sort_order=' + (data.ascending ? "ASC" : "DESC")
      if (data.query.displayName)   string += '&display_name=' + data.query.displayName
      if (data.query.emailAddress)  string += '&email_address=' + data.query.emailAddress
      if (data.limit)               string += '&limit=' + data.limit
      if (data.page)                string += '&offset=' + data.page

      return string
    },
    showUser (user) {
      this.$router.push({ name: 'LeaderboardUser', params: { external_id: user.externalId } })
    }
  }
}
</script>

<style lang="scss" scoped>

.leaderboard {

}

</style>
