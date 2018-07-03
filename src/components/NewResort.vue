<template>
  <div class="new-resort">

    <div class="add-new-bar box" @click="addResort" v-show="!addingResort">
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
        <div class="field-body">
          <p class="control has-icons-left">
            <input
              v-model.trim="newResort.name"
              class="input is-expanded"
              placeholder="Name"
              ref="resortName">
            <span class="icon is-small is-left">
              <i class="fas fa-address-book" />
            </span>
          </p>
        </div>
      </div>
      <p class="help is-danger" v-show="!newResortNameIsValid">
        Resort name is already in use
      </p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Resort Id</label>
        </div>
        <div class="field-body">
          <p class="control has-icons-left">
            <input
              v-model.trim="newResort.resortId"
              class="input is-expanded"
              placeholder="resort_id">
            <span class="icon is-small is-left">
              <i class="fas fa-address-book" />
            </span>
          </p>
        </div>
      </div>
      <p class="help is-danger" v-show="!newResortIdIsValid">
        Resort Id is already in use
      </p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Country</label>
        </div>
        <div class="field-body">
          <p class="control has-icons-left">
            <span class="select">
              <select v-model="newResort.country">
                <option value="US">US</option>
                <option value="AU">AU</option>
              </select>
            </span>
            <span class="icon is-left">
              <i class="fas fa-globe" />
            </span>
          </p>
        </div>
      </div>
      <div class="field is-horizontal" v-show="newResort.resortId.length">
        <div class="field-label is-normal">
          <label class="label">Map Files</label>
        </div>


        <div class="field-body manage-maps">

          <div class="control">
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

      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">JSON</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <textarea class="textarea is-small" type="text" v-model="pastedJson" :placeholder="jsonPlaceholder" />
            </div>
          </div>
        </div>
      </div>
      <p class="help">Optional. JSON should have root property called 'contactGroups'. All other properties are ignored.</p>

      <div class="field is-horizontal emergency-group-select">
        <div class="field-label is-normal">
          <label class="label">Emergency Contact Group</label>
        </div>
        <div class="field-body">
          <div class="group-select-buttons">
            <span class="button is-small group-name"
              :class="(selectedEmergencyGroup === index) ? 'is-active' : ''"
              v-for="(name, index) in groupNames"
              @click="selectedEmergencyGroup = index; addingEmergencyGroup = false">
              {{ name }}
            </span>
            <span class="button is-small add-group"
              :class="(selectedEmergencyGroup === -2) ? 'is-active' : ''"
              @click="selectedEmergencyGroup = -2; addingEmergencyGroup = true">

              Add Group
            </span>
          </div>
        </div>
      </div>

      <emergency-contact-group
        v-show="addingEmergencyGroup"
        :emergency-group="emergencyGroupDefaults"
        :resort-country="newResort.country"
        class="box"
        @groupChange="onEmergencyGroupChange"
        hide-save />

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
</template>

<script>
import ImageUpload from './ImageUpload.vue'
import EmergencyContactGroup from './EmergencyContactGroup.vue'
import mixins from './mixins'

export default {
  components: {
    ImageUpload,
    EmergencyContactGroup
  },
  mixins: [ mixins ],
  data () {
    return {
      addingResort: false,
      pastedJson: '',
      newResort: {
        name: '',
        resortId: '',
        country: 'US',
        mapFiles: []
      },
      selectedEmergencyGroup: -1,
      addingEmergencyGroup: false,
      emergencyGroupDefaults: {
        list: [
          {
            name: '',
            number: '',
            tags: {
              winter: true,
              summer: true
            }
          }
        ],
        section: 'Emergency',
        seasonal: false
      },
      newEmergencyGroupData: {}
    }
  },
  computed: {
    newResortNameIsValid () {
      if (!this.newResort.name) return true
      return !this.$store.state.resorts.some(resort => resort.name === this.newResort.name)
    },
    newResortIdIsValid () {
      if (!this.newResort.resortId) return true
      return !this.$store.state.resorts.some(resort => resort.resortId === this.newResort.resortId)
    },
    pastedData () {
      let pasted
      if (this.pastedJson) {
        try {
          pasted = JSON.parse(this.pastedJson)
        } catch (error) {
          console.log(error)
        }
      }
      return pasted
    },
    jsonError () {
      return this.pastedJson && !this.pastedData
    },
    groupNames () {
      if (!this.pastedData || !this.pastedData.contactGroups) return []
      return this.pastedData.contactGroups.map(group => group.section)
    },
    emergencyGroupValidState () {
      if (this.selectedEmergencyGroup === -2) return this.emergencyGroupValid(this.newEmergencyGroupData, this.newResort.country)
      return (this.selectedEmergencyGroup > -1)
    },
    saveButtonActive () {

      return this.newResort.name.length
        && this.newResort.resortId.length
        && this.newResort.mapFiles.length
        && this.emergencyGroupValidState
        && this.newResortNameIsValid
        && this.newResortIdIsValid
        && !this.jsonError
    }
  },
  created () {

    // keep this ugly multi-line string out of reactive state
    this.jsonPlaceholder= `{
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
        . . .
      ]
    },
    . . .
  ]
}`

  },
  methods: {
    addResort () {
      this.addingResort = true
      this.$nextTick(() => {
        this.$refs.resortName.focus()
      })
    },
    onMapFileUpload ({ url }) {
      console.log(url)
      this.newResort.mapFiles.push(url)
    },
    removeImage (index) {
      this.newResort.mapFiles.splice(index, 1)
    },
    saveNewResort () {

      let resortData = this.clone(this.newResort)

      resortData.contactGroups = (this.pastedData && this.pastedData.contactGroups) ? this.pastedData.contactGroups : []

      if (this.selectedEmergencyGroup === -2) {
        resortData.emergencyGroup = {
          ...this.newEmergencyGroupData,
          list: this.newEmergencyGroupData.list.map(contact => this.formatContactNumbersForSave(contact, this.newResort.country))
        }
      } else {
        resortData.emergencyGroup = this.clone(resortData.contactGroups[this.selectedEmergencyGroup])
        resortData.contactGroups = resortData.contactGroups.filter((group, index) => index !== this.selectedEmergencyGroup)
      }

      this.addingResort = false

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
      }
      this.pastedJson = ''
    },
    onEmergencyGroupChange (group) {
      this.newEmergencyGroupData = group
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../sharedStyles.scss';

.new-resort {
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
  .emergency-group-select {
    .field-body {
      padding-top: .6em;
    }
    .group-select-buttons {
      .button {
        margin: .2em;
        &.is-active {
          border-width: 2px;
        }
      }

    }

  }
  // .emergency-contact-group {
  //   border: 1px solid grey;
  // }
}


  // .resort {
  //   cursor: pointer;
  //   &.box:not(:last-child) {
  //     margin-bottom: .88rem;
  //   }
  // }

</style>
