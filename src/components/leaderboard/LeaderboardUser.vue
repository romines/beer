<template>
  <div class="leaderboard-user">

    <LoadingSpinner v-if="isLoadingUser"></LoadingSpinner>

    <div v-else>{{user.display_name}}</div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { LoadingSpinner } from '../../components'

export default {
  components: {
    LoadingSpinner
  },
  data () {
    return {
      user:             {},
      isLoadingUser:    true,
    }
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  created () {
    this.getUser()
  },
  methods: {
    getUser () {
      this.axios.get('/users/' + this.$route.query.external_id + '/summary').then((user) => {

      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.leaderboard-user {

}

</style>
