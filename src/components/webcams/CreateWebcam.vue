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
        <input v-model="newWebcam.isStreaming" id="no-sort" type="checkbox">
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
        isStreaming:      false
      }
    },
    createWebcam () {
      this.$store.dispatch('setModalLoadingState', true)
      this.$store.dispatch('createWebcamForResort', this.newWebcam).then((webcam) => {
        console.log(webcam)
      })
    },
    cancelCreateWebcam () {
      this.newWebcam = this.setNewWebcamDefaults()
      this.$emit('closeCreateWebcam')
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
