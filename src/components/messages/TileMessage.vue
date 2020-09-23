<template>
  <div class="tile-message">

    <div class="rt-dropdown" v-bind:class="{ 'is-open' : isDropdownOpen }">
      <div class="header" v-on:click="isDropdownOpen = !isDropdownOpen">
        <h2>Banner Message</h2>

        <i class="fas chevron fa-chevron-up" />
        <i class="fas chevron fa-chevron-down" />
      </div>
      <div class="body">
        THIS IS THE BODY
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  components: {

  },
  data() {
    return {
      isDropdownOpen:      false
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'currentResort'])
  },
  created() {},
  methods: {},
}
</script>

<style lang="scss" scoped>

.tile-message {

}
</style>
