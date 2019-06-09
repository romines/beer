<template>
  <div class="archive">
    <site-header title="Manage Versions" />
    <save-publish />

    <div class="archive-filters">
      <span class="filter-label">Filter Archives</span>
      <span
        class="button starred is-small"
        :class="{ active: starredOnly }"
        @click="starredOnly = !starredOnly"
        >Starred</span
      >
      <span class="button reverse is-small" @click="newFirst = !newFirst">
        <span class="text">Sort</span>
        <span class="icon"> <i class="fas fa-long-arrow-alt-down" /> </span>
        <span class="icon up"> <i class="fas fa-long-arrow-alt-up" /> </span>
      </span>
    </div>

    <ul class="archive-list">
      <li class="archive published-archive box" v-if="publishedArchive">
        <div
          class="col col-one icon star"
          @click="$store.dispatch('toggleArchiveStar', publishedArchive)"
          :class="{ starred: publishedArchive.starred }"
        >
          <i class="far fa-star off" /> <i class="fas fa-star on" />
        </div>

        <div class="col col-two">
          <!--  -->
          <div class="row-one" v-show="editingNameOfArchiveAtIndex !== -2">
            <span class="name">{{ publishedArchive.name }}</span>
            <span class="icon edit is-small" @click.stop="editArchiveName(publishedArchive, -2)">
              <i class="fas fa-edit" />
            </span>
          </div>
          <!-- Or -->
          <div
            class="row-one name-editor field is-grouped"
            v-show="editingNameOfArchiveAtIndex === -2"
          >
            <input
              class="input is-small"
              v-model="archiveNameDraft"
              :ref="'publishedArchiveNameInput'"
              placeholder="Archive Name"
            />
            <span class="actions" @click.stop>
              <button
                class="button is-primary is-small"
                @click.stop.prevent="saveArchiveName(publishedArchive)"
              >
                Save
              </button>
              <button class="button is-small" @click.stop="cancelArchiveNameEdit">Cancel</button>
            </span>
          </div>
          <!--  -->

          <div class="row-two date" v-show="editingNameOfArchiveAtIndex !== -2">
            {{ getDateString(publishedArchive.date) }}
          </div>
        </div>

        <div class="col col-three actions"><span class="tag is-light">Published</span></div>
      </li>

      <li class="archive box" v-for="(archive, index) in remainder" :key="archive.date">
        <div class="col-one">
          <span
            class="icon star"
            @click="$store.dispatch('toggleArchiveStar', archive)"
            :class="{ starred: archive.starred }"
          >
            <i class="far fa-star off" /> <i class="fas fa-star on" />
          </span>
        </div>
        <div class="col-two">
          <!--  -->
          <div class="row-one" v-show="editingNameOfArchiveAtIndex !== index">
            <span class="name">{{ archive.name }}</span>
            <span class="icon is-small edit" @click="editArchiveName(archive, index)">
              <i class="fas fa-edit" />
            </span>
          </div>
          <!-- Or -->
          <div
            class="row-one name-editor field is-grouped"
            v-show="editingNameOfArchiveAtIndex === index"
          >
            <input
              class="input is-small archive-name"
              v-model="archiveNameDraft"
              :ref="'archiveNameInputs'"
              placeholder="Archive Name"
            />
            <span class="actions" @click.stop>
              <button
                class="button is-primary is-small"
                @click.stop.prevent="saveArchiveName(archive)"
              >
                Save
              </button>
              <button class="button is-small" @click.stop="cancelArchiveNameEdit">Cancel</button>
            </span>
          </div>
          <!--  -->
          <div class="row-two" v-show="editingNameOfArchiveAtIndex !== index">
            <span class="date">{{ getDateString(archive.date) }}</span>
            <span class="version" v-show="$store.state.user.superAdmin">Version id: {{ archive.key }}</span>
          </div>
        </div>
        <div class="col col-three actions">
          <span class="button is-small is-info restore" @click="restoreAndPublish(archive)"
            >Restore + Publish</span
          >
          <span class="button is-small is-success restore-publish" @click="restoreArchive(archive)"
            >Restore</span
          >
          <span class="button delete-archive is-small" @click="deleteArchive(archive)">
            <i class="fas fa-trash-alt" />
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
    SiteHeader,
  },
  data() {
    return {
      newFirst: true,
      starredOnly: false,
      newArchive: {
        name: '',
        description: '',
      },
      archiveNameDraft: '',
      editingNameOfArchiveAtIndex: -1,
    }
  },
  computed: {
    archives() {
      if (!this.$store.state.archives.archiveList) return []
      const sorted = Object.keys(this.$store.state.archives.archiveList)
        .map(key => {
          return {
            ...this.$store.state.archives.archiveList[key],
            key,
          }
        })
        .sort((a, b) => a.date - b.date)
      return this.newFirst ? sorted.reverse() : sorted
    },
    publishedArchive() {
      return this.archives.filter(
        ({ key }) => key === this.$store.state.archives.publishedContactsKey
      )[0]
    },
    remainder() {
      const remaining = this.archives.filter(
        ({ key }) => key !== this.$store.state.archives.publishedContactsKey
      )
      return this.starredOnly ? remaining.filter(archive => archive.starred) : remaining
    },
  },
  methods: {
    getDateString(time) {
      return moment(time).format('lll')
    },
    deleteArchive(archive) {
      const onConfirm = () => {
        this.$store.dispatch('deleteArchive', archive.key).then(() => {
          this.$store.dispatch('showSuccessModal', 'Archive deleted successfully')
        })
      }

      this.$store.commit('SHOW_MODAL', {
        heading: `Are you sure you want to delete ${archive.name}?`,
        message: 'This cannot be undone.',
        onConfirm,
      })
    },

    editArchiveName(archive, index) {
      this.archiveNameDraft = archive.name
      this.editingNameOfArchiveAtIndex = index
      const inputRef =
        index > -2 ? this.$refs.archiveNameInputs[index] : this.$refs.publishedArchiveNameInput
      this.$nextTick(() => inputRef.focus())
    },

    cancelArchiveNameEdit() {
      this.editingNameOfArchiveAtIndex = -1
      this.archiveNameDraft = ''
    },

    saveArchiveName({ key }) {
      this.$store
        .dispatch('saveArchiveName', { key, name: this.archiveNameDraft })
        .then(() => this.cancelArchiveNameEdit())
    },

    restoreArchive(archive) {
      const doRestore = () => {
        this.$store.commit('SET_LOADING_STATE', true)
        this.$store.dispatch('restoreArchive', archive).then(() => {
          this.$store.commit('SET_LOADING_STATE', false)
          this.$store.dispatch('showModal', {
            heading: 'Contacts restored successfully',
            message: 'You may edit restored contacts or publish them.',
            confirmButtonLabel: 'OK',
            hideCancel: true,
          })
          setTimeout(() => {
            this.$store.commit('CLOSE_MODAL')
          }, 7000)
        })
      }

      if (this.$store.getters.dirty) {
        this.$store.commit('SHOW_MODAL', {
          heading: 'Discard unpublished changes?',
          message: 'Restoring this version will overwrite your changes.',
          onConfirm: doRestore,
        })
      } else {
        doRestore()
      }
    },

    restoreAndPublish(archive) {
      const doRestorePublish = () => {
        this.$store.commit('SET_LOADING_STATE', true)
        this.$store.dispatch('restoreAndPublish', archive).then(() => {
          this.$store.commit('SET_LOADING_STATE', false)
          this.$store.dispatch('showSuccessModal', 'Contacts published successfully')
          setTimeout(() => {
            this.$store.commit('CLOSE_MODAL')
          }, 7000)
        })
      }
      if (this.$store.getters.dirty) {
        this.$store.commit('SHOW_MODAL', {
          heading: 'Discard unpublished changes?',
          message: 'Restoring this version will overwrite your changes.',
          onConfirm: doRestorePublish,
        })
      } else {
        doRestorePublish()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../sharedStyles.scss';
$starYellow: #ffd400;
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
      // border-left: 1px solid grey;
      justify-content: center;
      display: inline-flex;
      .button {
        margin: 0 0.4em;
      }
    }

    // .icon {
    //   margin-top: -.22em;
    // }
    // .col-two
    .star {
      margin-right: 0.6em;
      font-size: 1.3em;

      &:not(.starred) {
        opacity: 0.65;
        .on {
          display: none;
        }
      }
      &.starred {
        color: $starYellow;
        .off {
          display: none;
        }
      }
    }
    .edit {
      opacity: 0.7;
      margin-left: 1em;
      font-size: 0.7em;
    }

    .col-two .row-one {
      margin-top: -0.6em;
      margin-bottom: -0.3em;
      display: flex;
      align-items: center;
    }

    .name {
      font-size: 1.25em;
    }
    .name-editor {
      display: flex;
      padding-top: 0.3em;
      // input {
      //   width: 74%;
      // }
      .actions {
        flex: 0 0 0;
        display: flex;
        flex-wrap: nowrap;
        padding: 0 0.6em;
        .button {
          margin: 0.4em;
        }
      }
    }

    .row-two {
      font-size: 0.7em;
      margin-top: 0.3em;
      margin-bottom: -0.9em;
      & .date { margin-right: 1.6em; }
    }

    &.published-archive {
      border: 2px solid $mildNavy;
      margin-bottom: calc(1.5rem - 2px);
      margin-top: 1em;
      .tag {
        border: 1px solid $boneGrey;
      }
    }
  }
}
.archive-filters {
  border-top: 1px solid $boneGrey;
  border-bottom: 1px solid $boneGrey;
  padding: 0.2em 0;
  margin-bottom: 0.6em;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 10%;
  .filter-label {
    font-size: 0.8em;
    opacity: 0.8;
    margin-right: 0.8em;
  }
  .button {
    margin-right: 0.3em;
    &.starred {
      border: 4px solid $starYellow;
      &:not(.active) {
        opacity: 0.5;
      }
    }
  }
  .reverse {
    .icon {
      opacity: 0.8;
      font-size: 0.8em;
      &.up {
        margin-left: -0.75em;
      }
    }
  }
}
</style>
