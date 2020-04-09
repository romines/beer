<template>
  <div class="webcam-form">
    <h2 class="subtitle">{{title}}</h2>

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
      <span class="button is-primary new-push-button" :disabled="!webcamIsValid" @click="save()">Save</span>
      <span class="button is-light new-push-button" @click="cancel()">Cancel</span>
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
  props: {
    title: {
      type:     String,
      default:  "Create Webcam"
    },
    existingWebcam: {
      type:     Object,
      default:  () => {}
    }
  },
  data () {
    return {
      newWebcam:        this.initializeWebcamObject()
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
    initializeWebcamObject () {
      if (this.existingWebcam) {
        return JSON.parse(JSON.stringify(this.existingWebcam))
      } else {
        return this.setNewWebcamDefaults()
      }
    },
    setNewWebcamDefaults () {
      return {
        name:             '',
        shortName:        '',
        staticImageUrl:   '',
        streamingUrl:     '',
        isWeb:            false
      }
    },
    save () {
      if (!this.existingWebcam) this.setWebcamDefaults()
      this.$emit('save', this.newWebcam)
    },
    cancel () {
      this.newWebcam = this.setNewWebcamDefaults()
      this.$emit('cancel')
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

.webcam-form {

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
