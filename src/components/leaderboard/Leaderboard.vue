<template>
  <div class="leaderboard">

    <site-header title="Leaderboard" />

    <v-server-table ref="usersTable" v-bind:columns="columns" v-bind:options="options">
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
      columns:          ['rank', 'displayName', 'totalDaysSkied', 'totalTracks', 'totalDistanceVertical', 'view'],
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
        perPage: 5,
        perPageValues: [10, 25, 50, 100, 250, 500],
        texts: {
          filter:   'Filter:',
          filterBy: 'Filter by {column}',
          count:    ''
        },
        pagination: { chunk: 5, dropdown: false },
        filterable: ['displayName'],
        sortable: ['totalDaysSkied', 'totalDistanceVertical', 'totalTracks'],
        headings: {
          'displayName':            'Display Name',
          'totalDaysSkied':         'Days Skied',
          'totalDistanceVertical':  'Total Vertical Dist.',
          'totalTracks':            'Total Tracks'
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

      if (data.orderBy) string += '&order_by=' + stringHelper.unCamelize(data.orderBy)
      if (data.orderBy) string += '&sort_order=' + (data.ascending ? "ASC" : "DESC")
      if (data.query.displayName) string += '&display_name=' + data.query.displayName
      if (data.limit) string += '&limit=' + data.limit
      if (data.page) string += '&offset=' + data.page

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
