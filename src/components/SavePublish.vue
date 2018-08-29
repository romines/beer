<template>
  <div class="save-publish-container box">

    <transition name="slide">

      <div class="save-publish" v-show="$store.getters.dirty">

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

        <!-- <div class="name-and-notes" v-show="editingNotes">
          <div class="field">
            <div class="control">

            </div>
          </div>
          <textarea class="textarea" placeholder="Describe what's changed . . ." rows="3" v-model="newArchive.description"/>
        </div> -->

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
  },
  mounted () {
    this.$store.dispatch('listenToPublishedContacts')
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
    border: 3px $dark solid;
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
  }
  .discard.is-danger {
    background-color: rgba(246, 55, 24, 0.71);
    &:hover {
      background-color: rgb(246, 55, 24);
    }
  }
</style>
