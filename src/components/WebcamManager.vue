<template>
  <div class="webcam-manager">
    <site-header title="Webcam Management" />

    <span class="button is-primary new-webcam-button" @click="showCreateWebcam = !showCreateWebcam">Create Webcam</span>

    <transition name="fade">
      <create-webcam v-if="showCreateWebcam" v-on:closeCreateWebcam="showCreateWebcam = false" v-on:webcamCreated="onWebcamCreated()" class="new-webcam-container" />
    </transition>

    <webcam-list class="webcam-list" />

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import SiteHeader from './SiteHeader.vue'
import WebcamList from './webcams/WebcamList.vue'
import CreateWebcam from './webcams/CreateWebcam.vue'

export default {
  components: {
    SiteHeader,
    CreateWebcam,
    WebcamList
  },
  data () {
    return {
      showCreateWebcam:     false
    }
  },
  computed: {
    ...mapGetters(['webcams'])
  },
  created () {

  },
  methods: {
    onWebcamCreated () {
      console.log("MEOW")
    }
  }
}
</script>

<style lang="scss" scoped>

.webcam-manager {

  position:                   relative;

  .new-webcam-button {
    position:                 absolute;
    top:                      3.5em;
    right:                    0.5em;
  }

  .new-webcam-container {
    margin-top:               1em;
  }

  .webcam-list {
    margin-top:               2em;
  }

}

</style>
