<template>
  <div class="save-publish">
    <div class="field">
      <div class="control">
        <input
          v-model.trim="newArchive.name"
          class="input"
          placeholder="Name">
      </div>
    </div>
    <textarea class="textarea" placeholder="Describe what's changed . . ." rows="3" v-model="newArchive.description"/>
    <div class="buttons">
      <span class="button is-info">Save &amp; Publish</span>
      <span class="button is-success" @click="saveNewArchive">Save</span>
      <span class="button is-danger" @click="cancelSaveNew">Cancel</span>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  data () {
    return {
      newArchive: {
        name: '',
        description: ''
      }
    }
  },
  computed: {

  },
  created () {
  },
  methods: {
    saveNewArchive () {
      this.$store.dispatch('archive', this.newArchive)
    },
    cancelSaveNew () {
      this.newArchive.name = ''
      this.newArchive.description = ''
      this.$emit('cancelSaveNew')
    }
  }
}
</script>

<style lang="scss" scoped>
  .buttons {
    padding-top: .6em;
  }
</style>
