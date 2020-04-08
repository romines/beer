<template>
  <div class="create-webcam">
    <site-header title="Create Webcam" />


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

.create-webcam {

  .no-webcams {
    font-style:                     italic;
    padding:                        1em;
  }
}

</style>
