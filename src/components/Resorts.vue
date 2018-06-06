<template>
  <div class="resorts">

    <site-header title="Resorts" />

    <ul>
      <li class="resort box" v-for="resort in resorts" @click="goToResort(resort.resortId)">
        <span class="name">{{ resort.name }}</span>
      </li>
    </ul>
    <div class="add-new-section">

      <div class="add-new-bar box" @click="addingResort = true" v-show="!addingResort">
        <span class="text">Add New</span>
        <span class="icon is-small">
          <i class="fas fa-plus"/>
        </span>
      </div>

      <div class="add-new-form box" v-show="addingResort">
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Name</label>
          </div>
          <div class="field-body control has-icons-left">
            <input
              v-model.trim="newResort.name"
              class="input is-expanded"
              placeholder="Name">
            <span class="icon is-small is-left">
              <i class="fas fa-address-book" />
            </span>
          </div>
        </div>
        <p class="help is-danger" v-show="!newResortNameIsValid">
          Resort name is already in use
        </p>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Resort Id</label>
          </div>
          <div class="field-body control has-icons-left">
            <input
              v-model.trim="newResort.resortId"
              class="input is-expanded"
              placeholder="resort_id">
            <span class="icon is-small is-left">
              <i class="fas fa-address-book" />
            </span>
          </div>
        </div>
        <p class="help is-danger" v-show="!newResortIdIsValid">
          Resort Id is already in use
        </p>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Country</label>
          </div>
          <div class="field-body control has-icons-left">
            <div class="select">
              <select v-model="newResort.country">
                <option value="US">US</option>
                <option value="AU">AU</option>
              </select>
            </div>
            <span class="icon is-left">
              <i class="fas fa-globe" />
            </span>
          </div>
        </div>
        <div class="field is-horizontal" v-show="newResort.resortId.length">
          <div class="field-label is-normal">
            <label class="label">Map Files</label>
          </div>


          <div class="field-body manage-maps control">

            <div class="map-thumbs">
              <div class="image-container" v-for="(url, index) in newResort.mapFiles">
                <span class="icon is-small remove" @click="removeImage(index)">
                  <i class="fas fa-times-circle" />
                </span>
                <img :src="url">
                <div class="remove-image" @click="removeImage(index)">remove map</div>
              </div>
            </div>

            <image-upload file-name-prefix="map_" :path-prefix="`${newResort.resortId}/map_files/`" button-label="Add a map..." @uploadComplete="onMapFileUpload"/>

          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">JSON</label>
          </div>
          <div class="field-body control">
            <textarea class="textarea is-small" type="text" v-model="newResort.json" :placeholder="notReactive" />
          </div>
        </div>
        <p class="help">Optional. JSON should have root property called 'contactGroups'. All other properties are ignored.</p>

        <div class="field is-grouped is-grouped-right">
          <p class="control no-expando">
            <a class="button is-primary" @click="saveNewResort" :disabled="!saveButtonActive">
              Save
            </a>
          </p>
          <p class="control no-expando">
            <a class="button is-light" @click="resetNewResortForm(); addingResort = false;">
              Cancel
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SiteHeader from './SiteHeader.vue'
import ImageUpload from './ImageUpload.vue'
export default {
  components: {
    SiteHeader,
    ImageUpload
  },
  data () {
    return {
      addingResort: false,
      newResort: {
        name: '',
        resortId: '',
        country: 'US',
        json: '',
        mapFiles: []
      }
    }
  },
  computed: {
    resorts () {
      return this.$store.state.resorts.slice().sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      })
    },
    newResortNameIsValid () {
      if (!this.newResort.name) return true
      return !this.resorts.some(resort => resort.name === this.newResort.name)
    },
    newResortIdIsValid () {
      if (!this.newResort.resortId) return true
      return !this.resorts.some(resort => resort.resortId === this.newResort.resortId)
    },
    saveButtonActive () {
      return this.newResort.name.length
        && this.newResort.resortId.length
        && this.newResort.mapFiles.length
        && this.newResortNameIsValid
        && this.newResortIdIsValid
    }
  },
  created () {
    this.notReactive = `{
  "contactGroups": [
    {
      "section": "Resort",
      "list": [
        {
          "mailto": "reservations@thredbo.com.au",
          "number": "1300-020-589",
          "rect": "{{792,491},{80,80}}",
          "z_detail": "Planning on heading to the snow for the first time? . . .",
          "name": "Reservations",
          "url": "https://www.thredbo.com.au/accommodation/"
        },
        ...
      ]
    },
  ]
}
`
  },
  methods: {
    goToResort (resortId) {
      this.$store.commit('SET_LOADING_STATE', true)
      this.$router.push(`resorts/${resortId}`)
    },
    onMapFileUpload ({ url }) {
      this.newResort.mapFiles.push(url)
    },
    removeImage (index) {
      this.newResort.mapFiles.splice(index, 1)
    },
    saveNewResort () {
      let pasted
      if (this.newResort.json) {
        try {
          pasted = JSON.parse(this.newResort.json)
        } catch (error) {
          this.$store.dispatch('showErrorModal', 'JSON parsing error: ' + error)
        }
      }

      let resortData = JSON.parse(JSON.stringify(this.newResort))
      delete resortData.json
      resortData.contactGroups = (pasted && pasted.contactGroups) ? pasted.contactGroups : []

      this.addingResort = false;
      this.$store.dispatch('saveNewResort', resortData).then(() => {
        this.$store.dispatch('getResorts')
        this.$store.dispatch('showSuccessModal', 'Resort created successfully')
        this.resetNewResortForm()
      })
    },
    resetNewResortForm () {
      this.newResort = {
        name: '',
        resortId: '',
        country: 'US',
        json: ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.resorts {
  .resort {
    cursor: pointer;
    &.box:not(:last-child) {
      margin-bottom: .88rem;
    }
  }

  .add-new-section {
    padding: 0 10px;
    p.help {
      margin: -10px 0 4px 140px;
    }
    .manage-maps {
      display: block;
      .map-thumbs {
        display: flex;
        align-items: stretch;
        .image-container {
          position: relative;
          &:not(:first-child) {
            margin-left: 1em;
          }
          .remove {
            position: absolute;
            top: -7px;
            left: -7px;
          }
        }
      }
    }
  }
}
</style>
