<template>
  <div class="leaderboard">

    <site-header title="Leaderboard" />

    <ul class="leaderboard-users">
      <li v-for="user in leaderboardUsers">
        <span v-on:click="goToUser(user)">{{user.display_name}}</span>
      </li>
    </ul>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SiteHeader from '../SiteHeader.vue'

export default {
  components: {
    SiteHeader
  },
  data () {
    return {
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
    ...mapGetters(['currentUser'])
  },
  created () {

  },
  methods: {
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
