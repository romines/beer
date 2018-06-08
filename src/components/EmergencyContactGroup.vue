<template>
  <div class="emergency-contact-group">

    <div class="emergency-seasonal field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Seasonal</label>
      </div>

      <div class="field-body toggle-container">
        <label class="switch" @click.stop>
          <input type="checkbox" v-model="localState.emergencyGroup.seasonal" @click.stop.prevent.self="toggleSeasonal">
          <span class="slider round" />
        </label>
      </div>
    </div>

    <div class="contact" v-for="contact in localState.emergencyGroup.list">

      <div class="field is-horizontal" v-show="localState.emergencyGroup.seasonal">
        <div class="field-label is-normal">
          <label class="label">Season</label>
        </div>
        <div class="field-body control has-icons-left">
          <span class="button season" :class="{'active': contact.tags.winter}" @click="toggleContactSeason(contact.tags.winter)">Winter</span>
          <span class="button season" :class="{'active': contact.tags.summer}" @click="toggleContactSeason(contact.tags.summer)">Summer</span>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Contact Name</label>
        </div>
        <div class="field-body control has-icons-left">
          <input
            v-model.trim="contact.name"
            class="input is-expanded"
            placeholder="Name">
          <span class="icon is-small is-left">
            <i class="fas fa-address-book" />
          </span>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Phone</label>
        </div>
        <div class="field-body control has-icons-left">
          <input
            v-model.trim="contact.number"
            class="input is-expanded"
            placeholder="Phone">
          <span class="icon is-small is-left">
            <i class="fas fa-phone" />
          </span>
        </div>
      </div>

    </div>


  </div>
</template>

<script>
export default {

  components: {},
  props: {
    emergencyGroup: {
      type: Object
    }
  },
  data () {
    return {
      localState: {
        emergencyGroup: {}
      }
    }
  },
  computed: {
  },
  watch: {
    // emergencyGroup () {
    //   this.initializeGroup()
    // },
    localState: {
      handler () {
        this.$emit('groupChange', this.localState.emergencyGroup)
      },
      deep: true
    }
  },
  created () {
    this.initializeGroup()
  },
  methods: {
    initializeGroup () {
      this.localState.emergencyGroup = {...this.emergencyGroup}
    },
    toggleSeasonal () {

      const existing = this.localState.emergencyGroup.list[0]
      if (!this.localState.emergencyGroup.seasonal && tagsMissingOrMatching(existing)) {
        existing.tags = {}
        existing.tags.winter = true
        existing.tags.summer = false
      }

      if (this.localState.emergencyGroup.list.length < 2) {
        this.localState.emergencyGroup.list.push({
          name: '',
          number: '',
          tags: {
            winter: !existing.tags.winter,
            summer: !existing.tags.summer
          }
        })
      } else {
        this.localState.emergencyGroup.list.splice(1, 1)
      }

      this.localState.emergencyGroup.seasonal = !this.localState.emergencyGroup.seasonal

      function tagsMissingOrMatching (existing) { return !existing.tags || (existing.tags.winter === existing.tags.winter)}

    },
    toggleContactSeason (currentlyActive) {
      if (!currentlyActive) {
        this.localState.emergencyGroup.list.forEach(contact => {
          contact.tags.winter = !contact.tags.winter
          contact.tags.summer = !contact.tags.summer
        })

      }
    }
  }
}
</script>

<style lang="scss" scoped>
.emergency-contact-group {

  .contact {
    margin-top: 1.6em;
    .button.season {
      margin-right: .6em;
      opacity: .6;
      &.active {
        opacity: 1;
        border: 4px solid #209cee;
      }
    }
  }

}
</style>
