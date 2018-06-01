<template>
  <div class="archive">
    <site-header>
      <span slot="title">Manage Versions</span>
    </site-header>
    <save-publish />
    <ul class="archive-list">
      <li class="archive published-archive box" v-for="archive in publishedArchive" :key="archive.date">
        <div class="left">
          <span class="icon star" @click="$store.dispatch('toggleArchiveStar', archive)" :class="{'starred': archive.starred}">
            <i class="far fa-star off" />
            <i class="fas fa-star on" />
          </span>
          <span class="name">{{ archive.name }} - {{ getDateString(archive.date) }}</span>
          <span class="icon is-small edit">
            <i class="fas fa-edit" />
          </span>
        </div>
        <div class="right actions">
          <span class="tag is-light">Published</span>
        </div>
      </li>
      <li class="archive box" v-for="archive in remainder" :key="archive.date">
        <div class="left">
          <span class="icon star" @click="$store.dispatch('toggleArchiveStar', archive)" :class="{'starred': archive.starred}">
            <i class="far fa-star off" />
            <i class="fas fa-star on" />
          </span>
          <span class="name">{{ archive.name }} - {{ getDateString(archive.date) }}</span>
          <span class="icon is-small edit">
            <i class="fas fa-edit" />
          </span>
        </div>
        <div class="right actions">
          <span class="button is-small is-info restore">Restore</span>
          <span class="button delete-archive is-small" @click="deleteArchive(archive)">
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
      if (!this.$store.state.archives.archives) return []
      return Object.keys(this.$store.state.archives.archives).map(key => {
        return {
          ...this.$store.state.archives.archives[key],
          key
        }
      })
    },
    publishedArchive () {
      return this.archives.filter(({key}) =>  key === this.$store.state.archives.publishedContactsKey )
    },
    remainder () {
      return this.archives.filter(({key}) =>  key !== this.$store.state.archives.publishedContactsKey )
    },
  },
  created () {
  },
  methods: {
    getDateString (time) {
      return moment(time).format('llll')
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
    },

    restoreArchive (archive) {

    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../sharedStyles.scss';
  .archive-list {
    .archive {
      display: flex;
      align-items: center;
      justify-content: space-between;
      &.published-archive {
        border: 2px solid $dark;
        background-color: $boneGrey;
      }
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
