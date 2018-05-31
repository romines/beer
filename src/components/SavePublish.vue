<template>
  <div class="save-publish" v-show="dirty">
    <div class="notice-and-buttons">
      <span class="notice">You have unpublished changes</span>
      <span class="button is-info" @click="saveAndPublish">Save &amp; Publish</span>
      <span class="button is-success" @click="saveNewArchive">Save</span>
    </div>

    <div class="name-and-notes" v-show="editingNotes">
      <div class="field">
        <div class="control">
          <input
            v-model.trim="newArchive.name"
            class="input"
            placeholder="Name">
        </div>
      </div>
      <textarea class="textarea" placeholder="Describe what's changed . . ." rows="3" v-model="newArchive.description"/>
    </div>

  </div>
</template>

<script>

export default {
  components: {
  },
  data () {
    return {
      editingNotes: false,
      newArchive: {
        name: '',
        description: ''
      }
    }
  },
  computed: {
    dirty () {
      if (!this.$store.state.publishedContacts.length) return false
      return JSON.stringify(this.$store.state.publishedContacts) !== JSON.stringify(this.$store.state.contactGroups)
    }
  },
  mounted () {
    this.$store.dispatch('listenToPublishedContacts')
  },
  methods: {
    saveNewArchive () {
      this.resetForm()
      this.$store.dispatch('archive', this.newArchive)
    },
    saveAndPublish () {
      this.resetForm()
      this.$store.dispatch('archive', {...this.newArchive, publish: true})
    },
    cancelSaveNew () {
      this.resetForm()
      this.$emit('cancelSaveNew')
    },
    resetForm () {
      this.newArchive.name = ''
      this.newArchive.description = ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .buttons {
    padding-top: .6em;
  }
</style>
