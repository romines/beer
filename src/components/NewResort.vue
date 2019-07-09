<template>
  <div class="new-resort">
    <div class="add-new-bar box" @click="addResort" v-show="!addingResort">
      <span class="text">Add New</span>
      <span class="icon is-small">
        <i class="fas fa-plus" />
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
              ref="resortName"
            />
            <span class="icon is-small is-left">
              <i class="fas fa-address-book" />
            </span>
          </p>
        </div>
      </div>
      <p class="help is-danger" v-show="!newResortNameIsValid">Resort name is already in use</p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Resort Id</label>
        </div>
        <div class="field-body">
          <p class="control has-icons-left">
            <input
              v-model.trim="newResort.resortId"
              class="input is-expanded"
              placeholder="resort_id"
            />
            <span class="icon is-small is-left">
              <i class="fas fa-address-book" />
            </span>
          </p>
        </div>
      </div>
      <p class="help is-danger" v-show="!newResortIdIsValid">Resort Id is already in use</p>
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

      <!-- Map management -->
      <map-manager
        v-if="newResort.resortId"
        :maps="newResort.maps"
        :path-prefix="newResort.resortId"
        @mapUpload="onMapUpload"
      />

      <!-- Map management -->

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">JSON</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <textarea
                class="textarea is-small"
                type="text"
                v-model="pastedJson"
                :placeholder="jsonPlaceholder"
              />
            </div>
          </div>
        </div>
      </div>
      <p class="help">
        Optional. JSON should have root property called 'contactGroups'. All other properties are
        ignored.
      </p>

      <div class="field is-horizontal emergency-group-select">
        <div class="field-label is-normal">
          <label class="label">Emergency Contact Group</label>
        </div>
        <div class="field-body">
          <div class="group-select-buttons">
            <span
              class="button is-small group-name"
              :class="selectedEmergencyGroup === index ? 'is-active' : ''"
              v-for="(name, index) in groupNames"
              :key="name"
              @click="
                selectedEmergencyGroup = index
                addingEmergencyGroup = false
              "
            >{{ name }}</span>
            <span
              class="button is-small add-group"
              :class="selectedEmergencyGroup === -2 ? 'is-active' : ''"
              @click="
                selectedEmergencyGroup = -2
                addingEmergencyGroup = true
              "
            >Add Group</span>
          </div>
        </div>
      </div>

      <emergency-contact-group
        v-show="addingEmergencyGroup"
        :emergency-group="emergencyGroupDefaults"
        :resort-country="newResort.country"
        class="box"
        @groupChange="onEmergencyGroupChange"
        hide-save
      />

      <div class="field is-grouped is-grouped-right">
        <p class="control no-expando">
          <a class="button is-primary" @click="saveNewResort" :disabled="!saveButtonActive">Save</a>
        </p>
        <p class="control no-expando">
          <a
            class="button is-light"
            @click="
              resetNewResortForm()
              addingResort = false
            "
          >Cancel</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import MapManager from './MapManager.vue'
import EmergencyContactGroup from './EmergencyContactGroup.vue'
import mixins from './mixins'

export default {
  components: {
    MapManager,
    EmergencyContactGroup,
  },
  mixins: [mixins],
  data() {
    return {
      addingResort: false,
      pastedJson: '',
      newResort: {
        name: '',
        resortId: '',
        country: 'US',
        maps: [],
      },
      selectedEmergencyGroup: -1,
      addingEmergencyGroup: false,
      emergencyGroupDefaults: {
        list: [
          {
            name: '',
            number: '',
            email: '',
            sms: '',
            tags: {
              winter: true,
              summer: true,
            },
          },
        ],
        section: 'Emergency',
      },
      newEmergencyGroupData: {},
    }
  },
  computed: {
    newResortNameIsValid() {
      if (!this.newResort.name) return true
      return !this.$store.state.resorts.some(resort => resort.name === this.newResort.name)
    },
    newResortIdIsValid() {
      if (!this.newResort.resortId) return true
      return !this.$store.state.resorts.some(resort => resort.resortId === this.newResort.resortId)
    },
    pastedData() {
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
    jsonError() {
      return this.pastedJson && !this.pastedData
    },
    numberOfActiveMaps() {
      this.newResort.maps.filter(map => map.active).length
    },
    groupNames() {
      if (!this.pastedData || !this.pastedData.contactGroups) return []
      return this.pastedData.contactGroups.map(group => group.section)
    },
    emergencyGroupIsValid() {
      if (this.selectedEmergencyGroup !== -2) return true
      return this.emergencyGroupValid(this.newEmergencyGroupData, this.newResort.country)
    },
    saveButtonActive() {
      return (
        this.newResort.name.length &&
        this.newResort.resortId.length &&
        this.emergencyGroupIsValid &&
        this.newResortNameIsValid &&
        this.newResortIdIsValid &&
        !this.jsonError
      )
    },
  },
  created() {
    // keep this ugly multi-line string out of reactive state
    this.jsonPlaceholder = `{
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
    addResort() {
      this.addingResort = true
      this.$nextTick(() => {
        this.$refs.resortName.focus()
      })
    },
    onMapUpload({ url, id, name }) {
      const map = {
        id,
        url,
        name,
        active: this.numberOfActiveMaps < 2,
      }
      this.newResort.maps.push(map)
    },
    onMapRename({ id, name }) {
      const index = this.resortData.maps.findIndex(map => map.id === id)
      const map = {
        ...this.maps[index],
        name,
      }
      this.$set(this.newResort.maps, index, map)
    },
    removeImage(index) {
      this.newResort.mapFiles.splice(index, 1)
    },
    getEmergencyGroup() {
      const getEmergencyGroupFromManualEntry = () => {
        return {
          ...this.newEmergencyGroupData,
          list: this.newEmergencyGroupData.list.map(contact =>
            this.formatContactNumbersForSave(contact, this.newResort.country)
          ),
        }
      }
      const getEmergencyGroupFromSelected = () => {
        return this.pastedData.contactGroups[this.selectedEmergencyGroup]
      }
      const getEmergencyGroupFromDefault = () => {
        return this.clone(this.emergencyGroupDefaults)
      }

      if (this.pastedData && this.pastedData.emergencyGroup) {
        return this.pastedData.emergencyGroup
      } else if (this.selectedEmergencyGroup === -2) {
        return getEmergencyGroupFromManualEntry()
      } else if (this.selectedEmergencyGroup > -1) {
        return getEmergencyGroupFromSelected()
      } else {
        return getEmergencyGroupFromDefault()
      }
    },
    saveNewResort() {
      let resortData = this.clone(this.newResort)

      resortData.contactGroups =
        this.pastedData && this.pastedData.contactGroups ? this.pastedData.contactGroups : []

      resortData.emergencyGroup = this.getEmergencyGroup()

      if (this.selectedEmergencyGroup > -1)
        resortData.contactGroups = resortData.contactGroups.filter(
          (group, index) => index !== this.selectedEmergencyGroup
        )

      this.addingResort = false

      this.$store.dispatch('saveNewResort', resortData).then(() => {
        this.$store.dispatch('getResorts')
        this.$store.dispatch('showSuccessModal', 'Resort created successfully')
        this.resetNewResortForm()
      })
    },
    resetNewResortForm() {
      this.newResort = {
        name: '',
        resortId: '',
        country: 'US',
      }
      this.pastedJson = ''
    },
    onEmergencyGroupChange(group) {
      this.newEmergencyGroupData = group
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../sharedStyles.scss';

.new-resort {
  padding: 0 10px;
  p.help {
    margin: -10px 0 4px 140px;
  }
  .emergency-group-select {
    .field-body {
      padding-top: 0.6em;
    }
    .group-select-buttons {
      .button {
        margin: 0.2em;
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
