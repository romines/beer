<template>
  <div class="leaderboard">

    <site-header title="Leaderboard" />
    {{userData}}
    <v-server-table ref="usersTable" v-bind:columns="columns" v-bind:options="options">
      <!-- <a slot="sales" slot-scope="props" class="sales">{{numberToCurrency(props.row.totalSales)}}</a>
      <a slot="createdAt" slot-scope="props" class="date">{{formatDate(props.row.createdAt, 'MM/DD/YYYY - HH:MM:SS')}}</a>
      <a slot="lastSignInDate" slot-scope="props" class="date">{{formatDate(props.row.lastSignInDate, 'MM/DD/YYYY - HH:MM:SS')}}</a>
      <a slot="approved" slot-scope="props" class="approved">{{props.row.isApproved ? 'Yes' : 'No'}}</a>
      <a slot="reviewed" slot-scope="props" class="reviewed">{{props.row.isReviewed ? 'Yes' : 'No'}}</a> -->
      <a slot="view" slot-scope="props" class="view-user" v-on:click="showUser(props.row)">View</a>
    </v-server-table>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SiteHeader from '../SiteHeader.vue'
import { LoadingSpinner } from '../../components'
import store from '../../store'

export default {
  components: {
    SiteHeader,
    LoadingSpinner
  },
  data () {
    return {
      isLoading:        true,
      tableParams:      {},
      userData: {},
      columns:          ['rank', 'displayName', 'totalDaysSkied', 'totalDistanceVertical'],
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
        pagination: { chunk: 10, dropdown: false },
        filterable: ['displayName'],
        sortable: ['totalDaysSkied', 'totalDistanceVertical'],
        headings: {
          'displayName':            'Display Name',
          'totalDaysSkied':         'Days Skied',
          'totalDistanceVertical':  'Total Vertical Distance'
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
        console.log(this.$refs.usersTable)

        this.userData = response.data.leaderboard
        this.$refs.usersTable.data  = response.data.leaderboard
        this.$refs.usersTable.count = response.data.count
        return response.data
      })
    },
    createAppendUrl (data) {
      console.log(data)
      let string = ''
      string += '?resort_identifier=' + this.currentResort.id
      string += '&exclude_profile_image=true'
      string += '&include_count=true'
      string += '&additional_properties=[ "total_days_skied", "total_distance_vertical"]'
      return string
    },
    showUser (user) {
      this.$router.push({ name: 'LeaderboardUser', query: { external_id: user.external_id } })
    }
  }
}
</script>

<style lang="scss" scoped>

.leaderboard {

}

</style>
