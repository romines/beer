<template>
  <div class="archive">
    <site-header>
      <span slot="title">Manage Versions</span>
    </site-header>
    <save-publish />
    <ul class="archive-list">

      <li class="archive published-archive box">

        <div class="col col-one icon star" @click="$store.dispatch('toggleArchiveStar', publishedArchive)" :class="{'starred': publishedArchive.starred}">
          <i class="far fa-star off" />
          <i class="fas fa-star on" />
        </div>

        <div class="col col-two">
          <!--  -->
          <div class="row-one" v-show="editingNameOfArchiveAtIndex !== -2">
              <span class="name">{{ publishedArchive.name }}</span>
              <span class="icon edit is-small" @click.stop="editingNameOfArchiveAtIndex = -2">
                <i class="fas fa-edit"/>
              </span>
          </div>
          <!-- Or -->
          <div class="row-one name-editor field is-grouped" v-show="editingNameOfArchiveAtIndex === -2">
            <input class="input is-small" v-model="archiveNameDraft" placeholder="Archive Name">
            <span class="actions" @click.stop>
              <button class="button is-primary is-small" @click.stop.prevent="saveGroupName">Save</button>
              <button class="button is-small" @click.stop="editingNameOfArchiveAtIndex = -1; archiveNameDraft = '';">Cancel</button>
            </span>
          </div>
          <!--  -->

          <div class="row-two date" v-show="editingNameOfArchiveAtIndex !== -2">
            {{ getDateString(publishedArchive.date) }}
          </div>

        </div>

        <div class="col col-three actions">
          <span class="tag is-light">Published</span>
        </div>
      </li>



          <!-- <span class="icon is-small edit">
            <i class="fas fa-edit" />
          </span> -->
      <li class="archive box" v-for="(archive, index) in remainder" :key="archive.date">
        <div class="col-one">
          <span class="icon star" @click="$store.dispatch('toggleArchiveStar', archive)" :class="{'starred': archive.starred}">
            <i class="far fa-star off" />
            <i class="fas fa-star on" />
          </span>
        </div>
        <div class="col-two">
          <!--  -->
          <div class="row-one" v-show="editingNameOfArchiveAtIndex !== index">
            <span class="name">{{ archive.name }}</span>
            <span class="icon is-small edit" @click="editingNameOfArchiveAtIndex = index">
              <i class="fas fa-edit" />
            </span>
          </div>
          <!-- Or -->
          <div class="row-one name-editor field is-grouped" v-show="editingNameOfArchiveAtIndex === index">
            <input class="input is-small archive-name" v-model="archiveNameDraft" placeholder="Archive Name">
            <span class="actions" @click.stop>
              <button class="button is-primary is-small" @click.stop.prevent="saveGroupName">Save</button>
              <button class="button is-small" @click.stop="editingNameOfArchiveAtIndex = -1; archiveNameDraft = '';">Cancel</button>
            </span>
          </div>
          <!--  -->
          <div class="row-two date" v-show="editingNameOfArchiveAtIndex !== index">{{ getDateString(archive.date) }}</div>

        </div>
        <div class="col col-three actions">
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
      savingNew: false,
      archiveNameDraft: '',
      editingNameOfArchiveAtIndex: -1
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
      return this.archives.filter(({key}) =>  key === this.$store.state.archives.publishedContactsKey )[0]
    },
    remainder () {
      return this.archives.filter(({key}) =>  key !== this.$store.state.archives.publishedContactsKey )
    },
  },
  created () {
  },
  methods: {
    getDateString (time) {
      return moment(time).format('lll')
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
      padding-right: 0;

      .col-one {
        flex-grow: 0;
      }

      .col-two {
        flex-grow: 1;
      }

      .col-three {
        flex: 0 0 9em;
        border-left: 1px solid grey;
        justify-content: space-evenly;
        display: inline-flex;
      }



      // .icon {
      //   margin-top: -.22em;
      // }
      // .col-two
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
          font-size: .7em;
        }

      .col-two .row-one {
        margin-top: -.6em;
        margin-bottom: -.3em;
        display: flex;
        align-items: center;
      }

      .name {
        font-size: 1.25em;
      }
      .name-editor {
        display: flex;
        padding-top: .3em;
        // input {
        //   width: 74%;
        // }
        .actions {
          flex: 0 0 0;
          display: flex;
          flex-wrap: nowrap;
          padding: 0 .6em;
          .button {
            margin: .3em;
          }
        }
      }

      .date {
        font-size: .7em;
        margin-top: .3em;
        margin-bottom: -.9em
      }

      &.published-archive {
        border: 2px solid $dark;
        background-color: $boneGrey;
      }

    }
  }
</style>
