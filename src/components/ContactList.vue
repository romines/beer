<template>
  <draggable
    class="contact-list"
    v-model="myList"
    :options="{handle:'.grippy'}"
    @start="drag=true; editingContactAtIndex = -1;"
    @end="drag=false">

    <div
      class="contact contact-margin-setter"
      v-for="(contact, index) in myList" :key="contact.name"
      :class="contactOpen(index) ? 'box' : ''">
      <!--
        To increase clickable surface area,
        contact header is .box if contact is closed
         . . . otherwise whole contact is .box
                                                -->

      <div class="contact-header"
           :class="contactOpen(index) ? '' : 'box'"
           @click.stop="onContactHeaderClick(index)">
        <span class="name">
          <span class="grippy" />
          {{ contact.name }}
        </span>
        <span class="icon is-small" v-show="!contactOpen(index)">
          <i class="fas fa-chevron-down"/>
        </span>
        <span class="icon is-small" v-show="contactOpen(index)">
          <i class="fas fa-chevron-up"/>
        </span>
      <!-- end .contact-header -->
      </div>

      <edit-contact
        v-if="contactOpen(index)"
        :group-index="groupIndex"
        :contact-index="index"
        :contact="contact"
        @closeContact="closeOpenContact"/>

    <!-- end .contact -->
    </div>

  </draggable>
</template>

<script>
import draggable from 'vuedraggable'
import EditContact from './EditContact'

export default {
  components: {
    draggable,
    EditContact
  },
  props: {
    groupIndex: {
      type: Number
    },
    isOpen: {
      type: Boolean
    }
  },
  data () {
    return {
      editingContactAtIndex: -1
    }
  },
  computed: {
    myList: {
      get() {
        return this.$store.state.contactGroups[this.groupIndex].list
      },
      set(updatedList) {
        this.$store.dispatch('saveContactList', { updatedList, groupIndex: this.groupIndex })
      }
    }

  },
  watch: {
    isOpen(open) {
      // close open contact so it is closed next time
      if (!open) this.editingContactAtIndex = -1
    }
  },
  created () {
  },
  methods: {
    contactOpen (index) {
      return index === this.editingContactAtIndex;
    },
    closeOpenContact ({ resetDirtyState, onConfirmDirtyClose }) {
      const onConfirm = () => {
        if (this.$store.state.uploadBufferUrl) this.$store.dispatch('destroyImageFile', this.$store.state.uploadBufferUrl)
        this.$store.commit('SET_CONTACT_DIRTY_STATE', false)
        this.editingContactAtIndex = -1
        onConfirmDirtyClose && onConfirmDirtyClose()
        this.$store.commit('CLOSE_MODAL')
      }

      if (this.$store.state.openContactIsDirty && !resetDirtyState) {
        this.$store.commit('SHOW_MODAL', {
          heading: 'You have unsaved changes?',
          confirmButtonLabel: 'Discard Changes',
          onConfirm
        })
      } else {
        return onConfirm()
      }

    },
    onContactHeaderClick (index) {
      if (this.editingContactAtIndex === -1) {
        this.editingContactAtIndex = index
      } else {
        const closeOptions = {
          resetDirtyState: false,
          onConfirmDirtyClose: (this.editingContactAtIndex !== index) ? () => { this.editingContactAtIndex = index } : null
        }
        this.closeOpenContact(closeOptions)
      }
    },
  }
}
</script>

<style scoped>
  .contact-list {
    margin-top: .6em;
  }
  .contact-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
</style>
