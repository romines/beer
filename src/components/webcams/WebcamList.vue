<template>
  <div class="webcam-list">
    <h2 class="subtitle">Current Webcams</h2>

    <div v-if="webcams.length > 0" class="webcam-list">
      {{webcams}}
    </div>
    <div v-else class="no-webcams">
      No webcams to display. Add a new webcam using the button above.
    </div>

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

    }
  },
  computed: {
    ...mapGetters(['webcams'])
  },
  created () {

  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>

.webcam-list {

  .no-webcams {
    font-style:                     italic;
    padding:                        1em;
  }
}

</style>
