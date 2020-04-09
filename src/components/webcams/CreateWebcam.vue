<template>
  <div class="create-webcam">
    <h2 class="subtitle">Create Webcam</h2>

    <h2>Name:</h2>
    <input v-model="newWebcam.name" class="input name" type="text" name="name">

    <h2>Short Name:</h2>
    <input v-model="newWebcam.shortName" class="input short-name" type="text" name="short-name">

    <h2>Static Image Url:</h2>
    <input v-model="newWebcam.staticImageUrl" class="input static-image-url" type="text" name="static-image-url">

    <h2>Streaming Url:</h2>
    <input v-model="newWebcam.streamingUrl" class="input streaming-url" type="text" name="streaming-url">

    <div class="toggle-container">
      <span>Is Streaming:</span>
      <label for="no-sort" class="switch">
        <input v-model="newWebcam.isWeb" id="no-sort" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>

    <div class="cancel-save">
      <span class="button is-primary new-push-button" :disabled="!webcamIsValid" @click="createWebcam()">Save</span>
      <span class="button is-light new-push-button" @click="cancelCreateWebcam()">Cancel</span>
    </div>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

export default {
  components: {

  },
  data () {
    return {
      newWebcam:          this.setNewWebcamDefaults()
    }
  },
  computed: {
    ...mapGetters(['webcams']),
    webcamIsValid () {
      return true
    }
  },
  created () {

  },
  methods: {
    setNewWebcamDefaults () {
      return {
        name:             '',
        shortName:        '',
        staticImageUrl:   '',
        streamingUrl:     '',
        isWeb:            false
      }
    },
    createWebcam () {
      this.$store.dispatch('setModalLoadingState', true)

      this.setWebcamDefaults()

      this.$store.dispatch('createWebcamForResort', this.newWebcam).then((webcam) => {
        this.cancelCreateWebcam()
        this.$store.dispatch('showSuccessModal', 'Webcam created!')
        this.$emit('webcamCreated')
      })
    },
    cancelCreateWebcam () {
      this.newWebcam = this.setNewWebcamDefaults()
      this.$emit('closeCreateWebcam')
    },
    setWebcamDefaults () {
      let createdAt = moment.utc().format('YYYY-MM-DD HH:mm:ss')

      this.newWebcam.createdAt  = createdAt
      this.newWebcam.updatedAt  = createdAt
      this.newWebcam.sortOrder  = this.webcams.length     // Make it the last in the list
      this.newWebcam.identifier = uuidv4()                // Unique Identifier
    }
  }
}
</script>

<style lang="scss" scoped>

.create-webcam {

  padding:                      1em;
  border:                       1px solid #dfe0e2;
  border-radius:                1em;

  input {
    width:                      80%;
    margin-bottom:              1em
  }

  .toggle-container {
    display:                    flex;
    align-items:                center;

    > span {
      margin-right:             1em;
    }
  }

  .cancel-save {
    margin-top:                     2em;
  }
}

</style>
