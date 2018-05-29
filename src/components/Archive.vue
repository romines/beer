<template>
  <div class="archive">
    <h1 class="title">Manage Versions</h1>
    <div class="box">
      <h3 class="title is-4" @click="savingNew = !savingNew">Save New</h3>
      <div class="save-form">
        <save-publish v-show="savingNew" @cancelSaveNew="savingNew = false"/>
      </div>
    </div>
    <ul class="archive-list">
      <li class="archive box" v-for="archive in archives" :key="archive.date">{{ archive.name }} - {{ archive.description }} - {{ getDateString(archive.date) }}</li>
    </ul>
  </div>
</template>

<script>
import SavePublish from './SavePublish.vue'
import moment from 'moment'

export default {
  components: {
    SavePublish
  },
  data () {
    return {
      newArchive: {
        name: '',
        description: ''
      },
      savingNew: false
    }
  },
  computed: {
    archives () {
      if (!this.$store.state.archives) return []
      return Object.keys(this.$store.state.archives).map(archiveKey => {
        return this.$store.state.archives[archiveKey]
      })
    }
  },
  created () {
  },
  methods: {
    getDateString (time) {
      return moment(time).format('ll')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
