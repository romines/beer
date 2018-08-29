<template>
  <div class="save-publish-container box" :class="{'dirty': $store.getters.dirty}">

    <transition name="slide">

      <div class="save-publish" v-if="$store.getters.dirty">

        <div class="notice-and-buttons">

          <span class="notice">You have unpublished changes</span>
          <span class="control name-edit has-icons-right" @click="startNameEdit">
            <input
              v-model.trim="newArchive.name"
              v-click-outside="onClickOutsideInput"
              :disabled="!editingName"
              class="input is-small"
              ref="archiveNameInput"
              placeholder="Name">
            <span class="icon is-small is-right">
              <i class="fas fa-edit" />
            </span>
          </span>

          <span class="actions">
            <span class="button is-info" @click="saveAndPublish" title="Publish changes">Publish</span>
            <span class="button is-success" @click="saveNewArchive" title="Save a copy without publishing">
              <span class="icon is-small">
                <i class="fas fa-save" />
              </span>
            </span>
            <span class="button is-danger discard" @click="discardChanges" title="Discard changes">
              <span class="icon is-small">
                <i class="fas fa-trash-alt" />
              </span>
            </span>
          </span>

        </div>

      </div>

      <div class="last-published" v-else>
        <span><strong>All changes published.</strong> Last published: {{ lastPublished }}</span>
        <span class="icon is-small has-text-success">
          <i class="fas fa-check" />
        </span>
      </div>

    </transition>

  </div>

</template>

<script>
import moment from 'moment'

export default {

  components: {
  },
  data () {
    return {
      editingName: false,
      newArchive: {
        name: `Contact Updates - ${moment().format('ll')}`,
        description: ''
      }
    }
  },
  computed: {
    lastPublished () {
      const lastPublishedMoment = moment(this.$store.state.archives.lastPublished)
      if (lastPublishedMoment.diff(moment(), 'days') > 0) {
        return lastPublishedMoment.format('lll')
      } else {
        return lastPublishedMoment.fromNow()
      }
    }
  },
  methods: {
    startNameEdit () {
      if (this.editingName) return
      this.editingName = true
      this.$nextTick(() => this.$refs.archiveNameInput.select())
    },
    onClickOutsideInput () {
      this.editingName = false
    },
    saveNewArchive () {
      this.$store.dispatch('archive', this.newArchive)
      this.resetForm()
    },
    saveAndPublish () {
      this.$store.dispatch('archive', {...this.newArchive, publish: true}).then(() => {
        this.resetForm()
        this.$store.dispatch('showSuccessModal', 'Contacts published successfully')
      })
    },
    cancelSaveNew () {
      this.resetForm()
      this.$emit('cancelSaveNew')
    },
    discardChanges () {

      const doDiscard = async () => {

        this.$store.commit('SET_LOADING_STATE', true)
        await this.$store.dispatch('discardChanges')
        this.$store.commit('SET_LOADING_STATE', false)

        this.$store.dispatch('showModal', {
          heading: 'Changes discarded',
          message: '',
          confirmButtonLabel: 'OK',
          hideCancel: true,
        })
        setTimeout(() => {
          this.$store.commit('CLOSE_MODAL')
        }, 7000)

      }

      this.$store.commit('SHOW_MODAL', {
        heading: 'Discard unpublished changes?',
        message: 'Are you sure you want to discard changes? This cannot be undone.',
        onConfirm: doDiscard
      })

    },
    resetForm () {
      this.newArchive.name = `Contact Updates - ${moment().format('ll')}`
      this.newArchive.description = ''
    }
  },
}
</script>

<style lang="scss" scoped>
  @import '../sharedStyles.scss';
  .save-publish-container {
    overflow: hidden;
    background-color: $boneGrey;
    border: 1px #92979b solid;
    transition : border 1.4s ease-out;
    &.dirty {
      border: 3px $dark solid;
    }
  }
  .slide-enter-active, .slide-leave-active {
    transition: transform 1.4s ease;
    transform: translateY(0);
  }
  .slide-enter, .slide-leave-to {
    transform: translateY(-100%);
  }
  .save-publish {
    .notice-and-buttons {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .input {
        font-size: 1em;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        width: 16em;
      }
      .input[disabled] {
        cursor: default;
      }
      .notice {
        font-size: 1.1em;
        font-weight: bold;
      }
      .actions {
        & > span {
          margin-left: .1em;
        }
      }
    }
    .discard.is-danger {
      background-color: rgba(246, 55, 24, 0.71);
      &:hover {
        background-color: rgb(246, 55, 24);
      }
    }
  }
  .last-published {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .icon {
      // color:
    }
  }
</style>
