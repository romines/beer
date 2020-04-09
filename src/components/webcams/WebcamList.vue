<template>
  <div class="webcam-list">
    <h2 class="subtitle">Current Webcams</h2>

    <div v-if="webcams.length > 0" class="webcam-list">
      <div v-for="webcam in webcams" class="webcam-container">
        <section class="header" @click="showWebcamDetails(webcam)">
          <span class="id">{{webcam.id}}</span>
          <span class="webcam-name">{{ webcam.name }}</span>
          <span class="created-at">{{webcam.createdAt}}</span>
        </section>
        <section v-if="showWebcam(webcam.name)" class="body">
          <div class="webcam-details">
            <div class="detail created">
              <label>Created At:</label><span class="created">{{webcam.createdAt}}</span>
            </div>
          </div>
        </section>

      </div>

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
      currentWebcamName:      {}
    }
  },
  computed: {
    ...mapGetters(['webcams'])
  },
  created () {

  },
  methods: {
    showWebcamDetails (webcam) {
      // Check if opening or closing...
      if (this.currentWebcamName == webcam.name) {
        this.currentWebcamName = null
        return
      } else {
        this.currentWebcamName = webcam.name
      }
    },
    showWebcam (name) {
      return this.currentWebcamName == name
    }
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
