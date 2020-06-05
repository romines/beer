<template>
  <div class="webcam-form">
    <h2 class="subtitle">{{title}}</h2>

    <h2>Name:</h2>
    <input v-model="newWebcam.name" class="input name" type="text" name="name">

    <h2>Short Name:</h2>
    <input v-model="newWebcam.shortName" class="input short-name" type="text" name="short-name">

    <h2>Still Image Url:</h2>
    <div class="url-container">
      <input v-model="newWebcam.staticImageUrl" v-bind:class="{ 'is-danger': !urlIsValid(newWebcam.staticImageUrl) }" class="input static-image-url" type="text" name="static-image-url">
      <span class="icon is-small is-right test-link" v-show="newWebcam.staticImageUrl">
        <a :href="newWebcam.staticImageUrl" tabindex="-1" target="_blank">
          <i class="fas fa-external-link-alt" />
        </a>
      </span>
    </div>

    <h2>Video Url:</h2>
    <div class="url-container">
      <input v-model="newWebcam.streamingUrl" v-bind:class="{ 'is-danger': !urlIsValid(newWebcam.streamingUrl) }" class="input streaming-url" type="text" name="streaming-url">
      <span class="icon is-small is-right test-link" v-show="newWebcam.streamingUrl">
        <a :href="newWebcam.streamingUrl" tabindex="-1" target="_blank">
          <i class="fas fa-external-link-alt" />
        </a>
      </span>
    </div>

    <div class="toggle-container">
      <span>Is Active:</span>
      <label for="active" class="switch">
        <input v-model="newWebcam.isActive" id="active" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div>

    <div class="invalid-form-warning help is-danger" v-show="!isFormValid">Form contains invalid data. Please fix errors (outlined in red) and try again</div>

    <div class="cancel-save">
      <span class="button is-primary new-push-button" :disabled="!webcamIsValid" @click="save()">Save</span>
      <span class="button is-light new-push-button" @click="cancel()">Cancel</span>
    </div>

    <div v-if="showDeleteWebcam" @click="showDeleteModal()" class="delete-button button is-danger is-outlined">
      <span class="">Delete</span>
      <span class="icon is-small">
        <i class="fas fa-trash-alt"/>
      </span>
    </div>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import moment from 'moment'
import validationHelper from '../../helpers/validationHelper'
import { v4 as uuidv4 } from 'uuid'
import mixins from '../mixins'

export default {
  components: {

  },
  mixins: [mixins],
  props: {
    title: {
      type:     String,
      default:  "Create Webcam"
    },
    existingWebcam: {
      type:     Object,
      default:  () => {}
    },
    showDeleteWebcam: {
      type:     Boolean,
      default:  false
    }
  },
  data () {
    return {
      newWebcam:        this.initializeWebcamObject()
    }
  },
  computed: {
    ...mapGetters(['webcams']),
    isFormValid () {
      return
    },
    urlsAreValid () {
      return validationHelper.url(this.newWebcam.staticImageUrl) || validationHelper.url(this.newWebcam.streamingUrl)
    },
    webcamIsValid () {
      return this.newWebcam.name.length > 0 && (this.newWebcam.staticImageUrl.length > 0 || this.newWebcam.streamingUrl.length > 0) && this.urlsAreValid
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
        isActive:         true
      }
    },
    save () {
      // Only set defaults on new webcam
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
    },
    showDeleteModal () {

      const onConfirm = () => {
        this.$emit('deleteWebcam', this.existingWebcam)
      }

      this.$store.commit('SHOW_MODAL', {
        heading:      'Are you sure you want to delete this webcam?',
        showLoading:  false,
        onConfirm,
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.webcam-form {

  padding:                      1em;
  border:                       1px solid #dfe0e2;
  border-radius:                1em;

  .url-container {
    position:                   relative;

    .icon {
      position:                 absolute;
      right:                    8.5em;
      top:                      0.6em;
    }
  }

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
    margin-top:                 2em;
    display:                    inline-block;
  }

  .delete-button {

    margin-top:                 2em;
    float:                      right;
    margin-right:               1em;

    .icon {
      height:                   1.5em;
      width:                    1.5em;
    }
  }
}

</style>
