<template>
  <div class="leaderboard">

    <site-header title="Leaderboard" />

    <LoadingSpinner v-if="isLoading"></LoadingSpinner>
    <div v-else>
      <ul class="leaderboard-users">
        <li v-for="user in leaderboardUsers">
          <span v-on:click="goToUser(user)">{{user.display_name}}</span>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SiteHeader from '../SiteHeader.vue'
import { LoadingSpinner } from '../../components'
import leaderboardConfig from '../../leaderboardConfig.js'

export default {
  components: {
    SiteHeader,
    LoadingSpinner
  },
  data () {
    return {
      isLoading:        true,
      leaderboardUsers: [
        {
            "display_name": "Griffin",
            "external_id": "BNFCrTzJ0WhFFsEOWb11fQhIxIQ2",
            "profile_image": "",
            "total_tracks": 37,
            "total_lift_rides": 35,
            "speed_average": 3.01,
            "speed_max": 27.1,
            "total_distance_surface": 81734,
            "total_distance_vertical": 19082,
            "total_kcals": 1700,
            "total_days_skied": 15
        },
        {
            "display_name": "JackAttack",
            "external_id": "adjnfadskjfnasdkjnasd",
            "profile_image": "",
            "total_tracks": 42,
            "total_lift_rides": 54,
            "speed_average": 13.01,
            "speed_max": 2.41,
            "total_distance_surface": 78474,
            "total_distance_vertical": 34342,
            "total_kcals": 1200,
            "total_days_skied": 10
        },
      ]
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'currentResort'])
  },
  created () {
    // If app is not authenticated, do that first
    if (!localStorage.leaderboardToken) {
      this.authenticate().then((success) => {
        if (success) {
          this.getLeaderboardData()
        }
      })
    } else {
      this.getLeaderboardData()
    }
  },
  methods: {
    getLeaderboardData () {
      this.axios.get('/leaderboard?resort_identifier=' + this.currentResort.id + '&exclude_profile_image=true').then((data) => {
        console.log(data)
      })
    },
    authenticate () {
      let password = leaderboardConfig.auth[this.currentResort.id]

      return this.axios.post('/auth?app_id=' + this.currentResort.id + '&auth_id=' + password)
        .then(request => this.authSuccess(request))
        .catch(request => this.authFailed(request))
    },
    authSuccess (request) {
      if (!request.data.token) {
        this.authFailed(request)
        return
      }

      localStorage.leaderboardToken = request.data.token
      return true
    },
    authFailed (request) {
      delete localStorage.leaderboardToken
      this.$store.dispatch('showErrorModal', 'Could not connect to Leaderboard. Please try again later. If problem persists, contact Resorts Tapped.')
      this.$router.push({ name: 'PushNotifications' })
      return false
    },
    goToUser (user) {
      this.$router.push({ name: 'LeaderboardUser', query: { external_id: user.external_id } })
    }
  }
}
</script>

<style lang="scss" scoped>

.leaderboard {

}

</style>
