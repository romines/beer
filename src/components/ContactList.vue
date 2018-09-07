<template>
  <draggable
    class="contact-list"
    v-model="draggableList"
    :options="{handle:'.grippy'}"
    @start="drag=true; editingContactId = '';"
    @end="drag=false">

    <div
      class="contact contact-margin-setter"
      v-for="contact in draggableList"
      :key="contact.id"
      :ref="'contact_' + contact.id.substring(0, 8)"
      :class="{'box': contactIsOpen(contact.id), 'highlighted': contactHighlighted(contact.id)}"
      :data-contact-id="contact.id">
      <!--
        To increase clickable surface area,
        contact header is .box if contact is closed
         . . . otherwise whole contact is .box
                                                -->

      <div class="contact-header"
           :class="{'box': !contactIsOpen(contact.id), 'highlighted': contactHighlighted(contact.id)}"
           @click.stop="onContactHeaderClick(contact.id)">
        <span class="name">
          <span class="grippy" v-if="sortable" />
          {{ contact.name }}
        </span>

        <span class="tags-and-chevron">
          <span class="tag-group">
            <span class="tag winter"
              :class="{'is-active': contact.tags.winter}"
              @click.stop="toggleTag(contact, 'winter')"
              v-show="$store.state.resortId !== 'russell_lands'"
            >
              <span class="icon is-small">
                <i class="fas fa-snowflake" />
              </span>
              Winter
            </span>
            <span class="tag summer"
              :class="{'is-active': contact.tags.summer}"
              @click.stop="toggleTag(contact, 'summer')"
              v-show="$store.state.resortId !== 'russell_lands'"
            >
              <span class="icon is-small">
                <i class="fas fa-umbrella-beach" />
              </span>
              Summer
            </span>
            <span class="tag dining" :class="{'is-active': contact.tags.dining}" @click.stop="toggleTag(contact, 'dining')">
              <img src="../assets/knife-and-fork.svg" class="">
              Dining
            </span>
          </span>
          <span class="icon is-small" v-show="!contactIsOpen(contact.id)">
            <i class="fas fa-chevron-down" />
          </span>
          <span class="icon is-small" v-show="contactIsOpen(contact.id)">
            <i class="fas fa-chevron-up" />
          </span>
        </span>
      <!-- end .contact-header -->
      </div>

      <edit-contact
        v-if="contactIsOpen(contact.id)"
        :group-index="groupIndex"
        :group-id="groupId"
        :contact-id="contact.id"
        :contact="contact"
        @closeContact="closeContact"
        @openSibling="openContact" />

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
    groupId: {
      type: String
    },
    groupIsOpen: {
      type: Boolean
    },
  },
  data () {
    return {
      editingContactId: '',
      highlightedContactId: '',
      contactOffsetAtOpen: 0
    }
  },
  computed: {
    draggableList: {
      get() {
        if (this.$store.state.contactGroups[this.groupIndex].list === undefined) return []
        if (this.$store.state.contactGroups[this.groupIndex].noSort) {
          return this.$store.state.contactGroups[this.groupIndex].list
        } else {
          return this.sortByName(this.$store.state.contactGroups[this.groupIndex].list)
        }
      },
      set(updatedList) {
        this.$store.dispatch('saveContactList', { updatedList, groupId: this.groupId })
      }
    },
    sortable () {
        return this.$store.state.contactGroups[this.groupIndex].noSort
    }

  },
  watch: {
    groupIsOpen(open) {
      // when group closes, close open contact
      if (!open) this.editingContactId = ''
    }
  },
  created () {
  },
  methods: {
    contactIsOpen (id) {
      return id === this.editingContactId
    },
    contactHighlighted (id) {
      return id === this.highlightedContactId
    },
    openContact ({ id, scrollTo }) {
      // NB: dirty state should already be checked for; openContact does opening only
      this.editingContactId = id
      this.contactOffsetAtOpen = window.pageYOffset || document.documentElement.scrollTop

      if (scrollTo) {
        this.$nextTick(() => {
          const newContactEl = document.querySelector(`[data-contact-id='${id}']`)
          newContactEl && window.scrollTo({
            'behavior': 'smooth',
            'left': 0,
            'top': newContactEl.offsetTop -45
          })
          this.contactOffsetAtOpen = window.pageYOffset || document.documentElement.scrollTop
          this.highlightedContactId = id
          setTimeout(() => {
            this.highlightedContactId = ''
          }, 2600)
        })
      }
    },
    closeContact ({ resetDirtyState, onConfirmDirtyClose, contactId }) {

      const onConfirm = () => {

        const rollUpContact = (contactId) => {
          document.documentElement.scrollTop = document.body.scrollTop = this.contactOffsetAtOpen
          this.highlightedContactId = contactId
          setTimeout(() => {
            this.highlightedContactId = ''
          }, 2600)
        }

        if (this.$store.state.uploadBufferUrl) this.$store.dispatch('destroyImageFile', this.$store.state.uploadBufferUrl)

        this.$store.commit('SET_CONTACT_DIRTY_STATE', false)
        this.editingContactId = ''
        onConfirmDirtyClose && onConfirmDirtyClose()
        this.$store.commit('CLOSE_MODAL')
        this.$nextTick(() => rollUpContact(contactId))

      }

      if (this.$store.state.openContactIsDirty && !resetDirtyState) {

        this.$store.commit('SHOW_MODAL', {
          heading: 'You have unsaved changes',
          confirmButtonLabel: 'Discard Changes',
          onConfirm
        })

      } else {
        return onConfirm()
      }

    },
    onContactHeaderClick (id) {

      if (this.editingContactId === '') { // none are open
        this.openContact({ id })
      } else {
        const closeOptions = {
          contactId: id,
          resetDirtyState: false,
          onConfirmDirtyClose: !this.contactIsOpen(id)
            ? () => { this.editingContactId = id }
            : () => null
        }
        this.closeContact(closeOptions)
      }
    },
    toggleTag (contact, tag) {

      if (this.$store.state.openContactIsDirty) {
        return this.$store.dispatch('showModal', {
          heading: 'Operation cannot be completed: Open contact has unsaved changes',
          message: 'Please save or cancel contact edits',
          confirmButtonLabel: 'OK',
          hideCancel: true,
        })
      }

      const tags = {...contact.tags}
      tags[tag] = !tags[tag]

      this.$store.dispatch('saveContact', {
        groupId: this.groupId,
        updatedContact: {...contact, tags}
      })

    },
    sortByName (list) {
      return list.slice().sort((a, b) => {
        if (a.name.toUpperCase() < b.name.toUpperCase()) {
          return -1
        }
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1
        } else {
          return 0
        }
      })
    },
    getContactElById (id) {
      return this.$refs[`contact_${id.substring(0, 8)}`][0]
    }
  }
}
</script>

<style lang="scss" scoped>
  .contact-list {
    margin-top: .6em;
  }
  .contact {
    // regretable DOM organization leads to weird styles
    &.highlighted {
      .box {
        border: solid 5px rgba(66, 79, 173, 0.43);
      }
    }
    &.highlighted.box {
      border: solid 5px rgba(66, 79, 173, 0.43);
    }
  }
  .contact-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    // transition: border-width 0.6s linear;
    .tags-and-chevron {
      display: flex;
      align-items: center;
      .tag-group {
        display: flex;
        align-items: center;
        .tag {
          margin-right: .3em;
          &:hover { filter: invert(4%); }
          &:not(.is-active) {
            opacity: .3;
            &:hover {
              opacity: .7;
              filter: invert(14%);
            }
          }
          &:not(.dining) .icon { margin-right: .4em; }
          &.dining img {
            width: 12px;
            height: 12px;
            margin-right: .3em;
            opacity: .7;
          }

        }
      }
    }
  }
</style>
