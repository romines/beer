<template>
  <div class="webcam-manager">
    <site-header title="Webcam Management" />

    <span v-if="currentUser.canManageWebcams" class="button is-primary new-webcam-button" @click="showCreateWebcam = !showCreateWebcam">Create Webcam</span>

    <transition name="fade">
      <WebcamForm
        v-if="showCreateWebcam"
        v-on:save="onWebcamSave"
        v-on:cancel="showCreateWebcam = false"
        class="new-webcam-container">
      </WebcamForm>
    </transition>

    <webcam-list ref="webcamList" class="webcam-list" />

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import SiteHeader from './SiteHeader.vue'
import WebcamList from './webcams/WebcamList.vue'
import WebcamForm from './webcams/WebcamForm.vue'

export default {
  components: {
    SiteHeader,
    WebcamForm,
    WebcamList
  },
  data () {
    return {
      showCreateWebcam:     false
    }
  },
  computed: {
    ...mapGetters(['webcams', 'currentUser'])
  },
  created () {

  },
  methods: {
    onWebcamSave (newWebcam) {
      this.showCreateWebcam = false
      this.$store.dispatch('createWebcamForResort', newWebcam).then((webcam) => {
        this.$store.dispatch('showSuccessModal', 'Webcam created!')
      })
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
