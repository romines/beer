<template>
  <div class="archive">
    <site-header>
      <span slot="title">Manage Versions</span>
    </site-header>
    <div class="box">
      <h3 class="title is-4" @click="savingNew = !savingNew">Save New</h3>
      <div class="save-form">
        <save-publish v-show="savingNew" @cancelSaveNew="savingNew = false"/>
      </div>
    </div>
    <ul class="archive-list">
      <li class="archive box" v-for="archive in archives" :key="archive.date">
        <div class="left">
          <span class="icon star" @click="$store.dispatch('toggleArchiveStar', archive)" :class="{'starred': archive.starred}">
            <i class="far fa-star off" />
            <i class="fas fa-star on" />
          </span>
          <span class="name">{{ archive.name }} - {{ archive.description }} - {{ getDateString(archive.date) }}</span>
          <span class="icon is-small edit">
            <i class="fas fa-edit" />
          </span>
        </div>
        <div class="right actions">
          <span class="button is-small restore">Restore</span>
          <span class="icon delete-archive is-small" @click="deleteArchive(archive)">
            <i class="fas fa-trash-alt"/>
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import SavePublish from './SavePublish.vue'
import SiteHeader from './SiteHeader.vue'
import moment from 'moment'

export default {
  components: {
    SavePublish,
    SiteHeader
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
      return Object.keys(this.$store.state.archives).map(key => {
        return {
          ...this.$store.state.archives[key],
          key
        }
      })
    }
  },
  created () {
  },
  methods: {
    getDateString (time) {
      return moment(time).format('ll')
    },
    deleteArchive (archive) {

      const onConfirm = () => {
        this.$store.dispatch('deleteArchive', archive.key)
        this.$store.commit('CLOSE_MODAL')
      }

      this.$store.commit('SHOW_MODAL', {
        heading: `Are you sure you want to delete ${archive.name}?`,
        message: 'This cannot be undone.',
        onConfirm
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .archive-list {
    .archive {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .icon {
        margin-top: -.22em;
      }
      .left {
        display: inline-flex;
        align-items: center;
        .star {
          margin-right: .6em;
          font-size: 1.3em;

          &:not(.starred) {
            opacity: .65;
            .on { display: none; }
          }
          &.starred {
            color: #ffd400;
            .off { display: none; }
          }
        }
        .edit {
          opacity: .7;
          margin-left: 1em;
        }
      }
      .actions {
        display: inline-flex;
        align-items: center;
        .restore {
          margin-right: .9em;
        }
      }
    }
  }
</style>
