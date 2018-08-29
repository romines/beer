<template>
  <draggable
    class="contact-list"
    v-model="myList"
    :options="{handle:'.grippy'}"
    @start="drag=true; editingContactId = '';"
    @end="drag=false">

    <div
      class="contact contact-margin-setter"
      v-for="contact in myList"
      :key="contact.id"
      :ref="'contact_' + contact.id.substring(0, 8)"
      :class="{'box': contactOpen(contact.id), 'highlighted': contactHighlighted(contact.id)}">
      <!--
        To increase clickable surface area,
        contact header is .box if contact is closed
         . . . otherwise whole contact is .box
                                                -->

      <div class="contact-header"
           :class="{'box': !contactOpen(contact.id), 'highlighted': contactHighlighted(contact.id)}"
           @click.stop="onContactHeaderClick(contact.id)">
        <span class="name">
          <span class="grippy" v-if="sortable" />
          {{ contact.name }}
        </span>

        <span class="tags-and-chevron">
          <span class="tag-group">
            <span class="tag winter" :class="{'is-active': contact.tags.winter}">
              <span class="icon is-small">
                <i class="fas fa-snowflake" />
              </span>
              Winter
            </span>
            <span class="tag summer" :class="{'is-active': contact.tags.summer}">
              <span class="icon is-small">
                <i class="fas fa-umbrella-beach" />
              </span>
              Summer
            </span>
            <span class="tag dining" :class="{'is-active': contact.tags.dining}">
              <img src="../assets/knife-and-fork.svg" class="">
              Dining
            </span>
          </span>
          <span class="icon is-small" v-show="!contactOpen(contact.id)">
            <i class="fas fa-chevron-down" />
          </span>
          <span class="icon is-small" v-show="contactOpen(contact.id)">
            <i class="fas fa-chevron-up" />
          </span>
        </span>
      <!-- end .contact-header -->
      </div>

      <edit-contact
        v-if="contactOpen(contact.id)"
        :group-index="groupIndex"
        :contact-id="contact.id"
        :contact="contact"
        @closeContact="closeContact" />

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
    myList: {
      get() {
        if (this.$store.state.contactGroups[this.groupIndex].list === undefined) return []
        if (this.$store.state.contactGroups[this.groupIndex].noSort) {
          return this.$store.state.contactGroups[this.groupIndex].list
        } else {
          return this.sortByName(this.$store.state.contactGroups[this.groupIndex].list)
        }
      },
      set(updatedList) {
        this.$store.dispatch('saveContactList', { updatedList, groupIndex: this.groupIndex })
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
    contactOpen (id) {
      return id === this.editingContactId
    },
    contactHighlighted (id) {
      return id === this.highlightedContactId
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

      const openContact = id => {
        this.editingContactId = id
        this.contactOffsetAtOpen = window.pageYOffset || document.documentElement.scrollTop
      }

      if (this.editingContactId === '') { // none are open
        openContact(id)
      } else {
        const closeOptions = {
          contactId: id,
          resetDirtyState: false,
          onConfirmDirtyClose: !this.contactOpen(id) ? () => { this.editingContactId = id } : null
        }
        this.closeContact(closeOptions)
      }
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
  .contact-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: border-width 0.6s linear;
    border: solid 0 rgba(66, 79, 173, 0.43);
    .contact.highlighted &.box {
      border-width: 5px;
      transition: none;
    }
    .tags-and-chevron {
      display: flex;
      align-items: center;
      .tag-group {
        display: flex;
        align-items: center;
        .tag {
          margin-right: .3em;
          &:not(.is-active) { opacity: .3;}
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
