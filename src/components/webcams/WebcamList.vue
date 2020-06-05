<template>
  <div class="webcam-list">
    <h2 class="subtitle">Current Webcams</h2>

    <div v-if="webcams.length > 0" class="webcam-list">

      <draggable
        v-if="currentUser.canEditWebcams()"
        class="draggable-group-container"
        v-model="draggableList"
        :options="{handle:'.grippy'}"
        @start="drag=true"
        @end="drag=false">

        <div v-for="webcam in draggableList" class="webcam-container">

          <section class="header" @click="showWebcamDetails(webcam, $event)">
            <span class="grippy" />
            <span class="webcam-name">{{ webcam.name }}</span>
            <div class="toggle-container">
              <span>{{ webcam.isActive ? 'Active' : 'Inactive' }}</span>
              <label v-bind:for="'webcam' + webcam.identifier" class="switch">
                <input v-on:click="onActiveToggle(webcam)" v-model="webcam.isActive" v-bind:id="'webcam' + webcam.identifier" type="checkbox">
                <span class="slider round"></span>
              </label>
            </div>
            <span class="created-at">{{formatDate(webcam.createdAt, 'll')}}</span>
          </section>

          <section v-if="showWebcam(webcam.identifier)" class="body">

            <div v-if="isEditingWebcam" class="edit-webcam">
              <WebcamForm
                v-on:save="onWebcamSave"
                v-on:cancel="isEditingWebcam = false"
                v-on:deleteWebcam="onWebcamDelete"
                v-bind:showDeleteWebcam="true"
                v-bind:existingWebcam="webcam"
                title="Edit Webcam"
                class="edit-webcam-container">
              </WebcamForm>
            </div>

            <div v-else class="webcam-details">
              <span v-on:click="isEditingWebcam = true">
                <i class="fas fa-edit" />
              </span>
              <div class="detail name">
                <label>Name:</label><span class="created">{{ webcam.name }}</span>
              </div>
              <div class="detail short-name">
                <label>Short Name:</label><span class="created">{{ webcam.shortName }}</span>
              </div>
              <div class="detail static-url">
                <label>Still URL:</label><span class="created">
                  <a v-bind:href="webcam.staticImageUrl" target="blank">{{ webcam.staticImageUrl }}</a>
                </span>
              </div>
              <div class="detail streaming-url">
                <label>Streaming Url:</label><span class="created">
                  <a v-bind:href="webcam.staticImageUrl" target="blank">{{ webcam.staticImageUrl }}</a>
                </span>
              </div>
              <div class="detail is-active">
                <label>Is Active?:</label><span class="created">{{ webcam.isActive ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail created">
                <label>Created At:</label><span class="created">{{formatDate(webcam.createdAt, 'lll')}}</span>
              </div>
              <div class="detail updated">
                <label>Last Updated:</label><span class="created">{{formatDate(webcam.updatedAt, 'lll')}}</span>
              </div>
            </div>
          </section>

        </div>

      </draggable>


      <div v-else>

        <div v-for="webcam in draggableList" class="webcam-container">

          <section class="header" @click="showWebcamDetails(webcam, $event)">
            <span class="id">{{webcam.id}}</span>
            <span class="webcam-name">{{ webcam.name }}</span>
            <div class="toggle-container">
              <span>{{ webcam.isActive ? 'Active' : 'Inactive' }}</span>
            </div>
            <span class="created-at">{{formatDate(webcam.createdAt, 'll')}}</span>
          </section>

          <section v-if="showWebcam(webcam.identifier)" class="body">

            <div class="webcam-details">
              <div class="detail name">
                <label>Name:</label><span class="created">{{ webcam.name }}</span>
              </div>
              <div class="detail short-name">
                <label>Short Name:</label><span class="created">{{ webcam.shortName }}</span>
              </div>
              <div class="detail static-url">
                <label>Still URL:</label><span class="created">{{ webcam.staticImageUrl }}</span>
              </div>
              <div class="detail streaming-url">
                <label>Streaming Url:</label><span class="created">{{ webcam.streamingUrl }}</span>
              </div>
              <div class="detail is-active">
                <label>Is Active?:</label><span class="created">{{ webcam.isActive ? 'Yes' : 'No' }}</span>
              </div>
              <div class="detail created">
                <label>Created At:</label><span class="created">{{formatDate(webcam.createdAt, 'lll')}}</span>
              </div>
              <div class="detail updated">
                <label>Last Updated:</label><span class="created">{{formatDate(webcam.updatedAt, 'lll')}}</span>
              </div>
            </div>
          </section>

        </div>

      </div>

    </div>
    <div v-else class="no-webcams">
      No webcams to display. Add a new webcam using the button above.
    </div>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import moment from 'moment'
import WebcamForm from './WebcamForm.vue'
import arrayHelper from '../../helpers/arrayHelper'
import draggable from 'vuedraggable'

export default {
  components: {
    draggable,
    WebcamForm
  },
  data () {
    return {
      currentWebcamId:      null,
      isEditingWebcam:      false
    }
  },
  computed: {
    ...mapGetters(['webcams', 'currentUser']),
    draggingInfo() {
      return this.dragging ? "under drag" : "";
    },
    draggableList: {
      get() {
        return this.$store.state.webcams
      },
      set(updatedList) {
        this.$store.dispatch('saveResortWebcams', updatedList)
      }
    }
  },
  created () {

  },
  methods: {
    showWebcamDetails (webcam, event) {
      if (event.target.className.includes('slider') || event.target.type === 'checkbox') return
      // Check if opening or closing...
      if (this.currentWebcamId == webcam.identifier) {
        this.currentWebcamId = null
      } else {
        this.currentWebcamId = webcam.identifier
      }
    },
    showWebcam (identifier) {
      return this.currentWebcamId == identifier
    },
    formatDate (date, format) {
      return moment.utc(date).local().format(format)
    },
    onActiveToggle (webcam) {
      // Weird situation where slider does not update model on click. Need to manually update.
      webcam.isActive = !webcam.isActive
      this.onWebcamSave(webcam)
    },
    onWebcamSave (webcam) {
      webcam.updatedAt = moment.utc().format('YYYY-MM-DD HH:mm:ss')
      arrayHelper.replaceObjectByValue(this.webcams, webcam, webcam.identifier, 'identifier')
      this.$store.dispatch('saveResortWebcams', this.webcams).then(() => {
        this.isEditingWebcam = false
      })
    },
    onWebcamDelete (webcam) {
      arrayHelper.removeObjectByValue(this.webcams, webcam.identifier, 'identifier')
      this.$store.dispatch('saveResortWebcams', this.webcams).then(() => {
        this.$store.dispatch('showSuccessModal', 'Webcam removed!')
        this.currentWebcamId = null
        this.isEditingWebcam = false
      })
    }
  },
  // watch: {
  //   'webcam.isActive': {
  //     handler: (val) => {
  //       debugger
  //     }
  //   }
  // }
}
</script>

<style lang="scss" scoped>

.webcam-list {

  .webcam-container {
    border:                       1px solid #dfe0e2;
    border-radius:                0.25em;
    margin-bottom:                0.88em;

    .header {
      display:                    flex;
      align-items:                center;
      cursor:                     pointer;
      background:                 #dfe0e2;
      padding:                    0.88em;

      .webcam-name {
        margin-left:              1em;
        text-overflow:            ellipsis;
        overflow:                 hidden;
        white-space:              nowrap;
        width:                    10em;
      }

      .toggle-container {
        display:                  flex;
        align-items:              center;
        margin-left:              auto;
        width:                    8em;

        > span {
          margin-right:           1em;
        }
      }

      .created-at {
        margin-left:              auto;
        width:                    7em;
      }
    }

    .body {

      padding:                    1.5em 2em;

      .webcam-details {

        position:                 relative;

        .fa-edit {
          position:               absolute;
          right:                  0;
          top:                    0;

          &:hover {
            cursor:               pointer;
            opacity:              0.8;
          }
        }

        .detail {

          display:                flex;
          word-wrap:              break-word;

          > label {
            font-weight:          bold;
            width:                20%;
          }

          > span {
            width:                80%;
          }
        }
      }
    }
  }

  .no-webcams {
    font-style:                     italic;
    padding:                        1em;
  }
}

</style>
