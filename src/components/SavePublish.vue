<template>
  <transition name="slide">

    <div class="save-publish" v-show="$store.getters.dirty">

      <div class="notice-and-buttons">

        <span class="notice">You have unpublished changes</span>
        <span class="control name-edit has-icons-right" @click="startNameEdit">
          <input
            v-model.trim="newArchive.name"
            v-click-outside="onClickOutsideInput"
            :disabled="!editingName"
            class="input"
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
    // dirty () {
    //   if (!this.$store.state.publishedContacts.length) return false
    //   return JSON.stringify(this.$store.state.publishedContacts) !== JSON.stringify(this.$store.state.contactGroups)
    // }
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
    resetForm () {
      this.newArchive.name = `Contact Updates - ${moment().format('ll')}`
      this.newArchive.description = ''
    }
  },
}
</script>

<style lang="scss" scoped>
  .slide-enter-active, .slide-leave-active {
    transition: height 1.4s;
    height: 55px;
  }
  .slide-enter, .slide-leave-to {
    height: 0;
    opacity: 0;
    overflow: hidden;
  }
  .save-publish {
    overflow: hidden;
    .notice-and-buttons {
      padding: .6em;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .input[disabled] {
        cursor: default;
      }
      .notice {
        font-size: 1.2em;
        font-weight: bold;
      }
    }
  }
  .buttons {
    padding-top: .6em;
  }
</style>
