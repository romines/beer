<template>
  <div class="image-upload">

    <div class="file">
      <label class="file-label">
        <input class="file-input" @change="onFileAdded" type="file" accept="image/*" name="resume">
        <span class="file-cta">
          <span class="file-icon">
            <i class="fas fa-upload"/>
          </span>
          <span class="file-label">
            {{ buttonLabel }}
          </span>
        </span>
      </label>
    </div>
    <progress class="progress is-info" v-show="uploading" :value="uploadProgress" max="100" />
  </div>
</template>

<script>
import firebase from '../firebaseInit.js'

export default {
  props: {
    fileNamePrefix: {
      type: String,
      default: ''
    },
    pathPrefix: {
      type: String,
    },
    buttonLabel: {
      type: String,
      default: 'Choose a file...'
    },
  },
  data () {
    return {
      uploading: false,
      uploadProgress: 0,
    }
  },
  methods: {
    onFileAdded (e) {
      this.uploading = true
      const file = e.target.files[0]
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          'resortId': this.$store.state.resortId,
        }
      }
      const extension = file.name.split('.')[file.name.split('.').length -1]
      const fileName = this.fileNamePrefix + new Date().getTime()
      const newImageRef = firebase.storage().ref().child(this.pathPrefix + fileName + '.' + extension)
      const uploadTask = newImageRef.put(file, metadata)

      uploadTask.on('state_changed',
        (snapshot) => {
          this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        }, (error) => {
          this.$store.dispatch('showErrorModal', error.message)
      }, () => {
        this.uploading = false
        this.$emit('uploadComplete', {
          url: uploadTask.snapshot.downloadURL,
          fileName: fileName + extension
        })
      })
    }
  }
}
</script>

<style scoped>
  .file-label, .progress {
    margin-top: .6em;
  }
</style>
