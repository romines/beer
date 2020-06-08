<template>
  <div class="leaderboard">

    <p>YAY</p>
    
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  components: {

  },
  data () {
    return {

    }
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  created () {

  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>

.leaderboard {

}

</style>
