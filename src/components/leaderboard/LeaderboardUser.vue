<template>
  <div class="leaderboard-user">

    <LoadingSpinner v-if="isLoadingUser"></LoadingSpinner>

    <div v-else class="user-summary">
      <div class="header">
        <img v-bind:src="userImage" />
        <div class="header-right">
          <h1>{{userSummary.displayName}}</h1>
          <span class="created-at">Member Since: {{ formatDate(userSummary.createdAt, 'MM/DD/YYYY') }} </span>
        </div>
      </div>

      <div class="body">
        <div class="block">
          <span class="metric">{{userSummary.speedAverage}}</span>
          <span class="name">Avg. Speed</span>
        </div>
        <div class="block">
          <span class="metric">{{userSummary.speedMax}}</span>
          <span class="name">Max Speed</span>
        </div>
        <div class="block">
          <span class="metric">{{userSummary.totalDaysSkied}}</span>
          <span class="name">Total Days</span>
        </div>
        <div class="block">
          <span class="metric">{{userSummary.totalDistanceVertical}}</span>
          <span class="name">Total Vertical Distance</span>
        </div>
        <div class="block">
          <span class="metric">{{userSummary.totalDistanceSurface}}</span>
          <span class="name">Total Surface Distance</span>
        </div>
        <div class="block">
          <span class="metric">{{userSummary.totalKcals}}</span>
          <span class="name">Total Kcals</span>
        </div>
        <div class="block">
          <span class="metric">{{userSummary.totalLiftRides}}</span>
          <span class="name">Total Lift Rides</span>
        </div>
        <div class="block">
          <span class="metric">{{userSummary.totalTracks}}</span>
          <span class="name">Total Tracks</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { LoadingSpinner } from '../../components'
import store from '../../store'

export default {
  components: {
    LoadingSpinner
  },
  data () {
    return {
      userSummary:      {},
      isLoadingUser:    true,
    }
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  beforeRouteEnter (to, from, next) {
    if (!localStorage.leaderboardToken) store.dispatch('authenticateLeaderboard').then(() => next() )
    else next()
  },
  created () {
    this.getUser()
  },
  computed: {
    userImage () {
      return 'data:image/png;base64,' + this.userSummary.profileImage
    }
  },
  methods: {
    getUser () {
      this.axios.get('/users/' + this.$route.params.external_id + '/summary').then((data) => {
        this.userSummary    = data.userSummary
        this.isLoadingUser  = false
        console.log(data.userSummary)
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.leaderboard-user {

  .user-summary {

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
      }
    }

    .body {
      display:                          flex;
      flex-wrap:                        wrap;
      margin-top:                       2em;

      .block {
        display:                        flex;
        flex-wrap:                      wrap;
        width:                          20%;
        margin:                         1%;
        text-align:                     center;
        margin-top:                     1em;
        height:                         8em;
        padding:                        0.5em;
        border:                         1px solid black;
        border-radius:                  5px;

        .metric {
          font-size:                    2em;
          width:                        100%;
        }

        .name {
          display:                      block;
          width:                        100%;
        }
      }
    }
  }
}

</style>
