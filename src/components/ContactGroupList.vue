<template>

  <div class="contact-group-list">

    <draggable
      class="draggable-group-container"
      v-model="draggableList"
      :options="{handle:'.grippy'}"
      @start="drag=true; editingNameOfGroupAtIndex = -1;"
      @end="drag=false">

      <div
        class="contact-group"
        :class="detailGroup === group.id ? 'box' : ''"
        :data-group-id="group.id"
        v-for="(group, groupIndex) in draggableList"
        :key="group.id">

        <div
          class="group-header"
          :class="detailGroup === group.id ? '' : 'box'"
          @click="onGroupHeaderClick(group.id, $event)">

          <span class="name-and-edit" v-show="editingNameOfGroupAtIndex !== groupIndex">
            <span class="grippy" />
            <span class="name">{{ group.section }}</span>
            <span class="icon edit-name is-small" v-show="!group.emergency" @click.stop="editGroupTitle(groupIndex)">
              <i class="fas fa-edit" />
            </span>
            <span class="icon delete-group is-small" v-show="!group.emergency" @click.stop="deleteGroup(groupIndex)">
              <i class="fas fa-trash-alt" />
            </span>
          </span>
          <!-- OR -->
          <div class="name-editor field is-grouped" v-show="editingNameOfGroupAtIndex === groupIndex">
            <p class="control is-expanded">
              <input class="input is-small" v-model="groupNameDraft" placeholder="Group title">
            </p>
            <p class="control" @click.stop>
              <button class="button is-primary is-small save" @click.stop.prevent="saveGroupName">Save</button>
              <button class="button is-small cancel" @click.stop="editingNameOfGroupAtIndex = -1; groupNameDraft = '';">Cancel</button>
            </p>
          </div>

          <div class="group-sort" v-show="detailGroup === group.id" @click.stop>
            <span>Custom Sort Order</span>
            <div class="toggle-container">
              <label for="no-sort" class="switch" @click.stop.prevent="toggleSortable(groupIndex)">
                <input id="no-sort" type="checkbox" v-model="$store.state.contactGroups[groupIndex].noSort">
                <span class="slider round" />
              </label>
            </div>
          </div>

          <span class="icon is-small" v-show="detailGroup !== group.id">
            <i class="fas fa-chevron-down" />
          </span>
          <span class="icon is-small" v-show="detailGroup === group.id">
            <i class="fas fa-chevron-up" />
          </span>

          <!-- end .group-header -->
        </div>

        <div
          class="group-detail"
          v-if="!group.emergency && detailGroup === group.id">

          <contact-list :group-index="groupIndex" :group-id="group.id" :group-is-open="detailGroup === group.id" />
          <!-- end .group-detail -->
          <div class="add-new-bar box" @click="addingContactAtIndex = groupIndex" v-show="addingContactAtIndex !== groupIndex">
            <span class="text">Add New Contact</span>
            <span class="icon is-small">
              <i class="fas fa-plus" />
            </span>
          </div>

          <div class="add-new-contact box" v-if="addingContactAtIndex === groupIndex">
            <edit-contact
              :group-id="group.id"
              :group-index="groupIndex"
              :contact-id="'NEW'"
              :contact="{}"
              @closeContact="addingContactAtIndex = -1" />
          </div>

        </div>

        <!-- end .contact-group -->
      </div>

    </draggable>

    <!-- Emergency Group -->
    <div
      class="contact-group emergency-group"
      :class="detailGroup === 'EMERGENCY' ? 'box' : ''">

      <div
        class="group-header"
        :class="detailGroup === 'EMERGENCY' ? '' : 'box'"
        @click="onGroupHeaderClick('EMERGENCY', $event)">

        <div class="name-and-icon">
          <img src="../assets/cross.svg" class="cross">
          <span class="name">Emergency</span>
        </div>
        <!-- OR -->

        <span class="icon is-small" v-show="detailGroup !== 'EMERGENCY'">
          <i class="fas fa-chevron-down" />
        </span>
        <span class="icon is-small" v-show="detailGroup === 'EMERGENCY'">
          <i class="fas fa-chevron-up" />
        </span>

        <!-- end .group-header -->
      </div>


      <emergency-contact-group
        v-if="detailGroup === 'EMERGENCY'"
        :emergency-group="$store.state.emergencyGroup"
        :resort-country="$store.state.resortMeta.country"
        @emergencyGroupSave="detailGroup = ''" />

      <!-- end .contact-group -->
    </div>
  </div>

</template>

<script>
import draggable from 'vuedraggable'
import ContactList from './ContactList'
import EditContact from './EditContact'
import EmergencyContactGroup from './EmergencyContactGroup.vue'

export default {
  components: {
    draggable,
    ContactList,
    EditContact,
    EmergencyContactGroup,
  },
  props: {
    newGroupIdentifier: {
      type: String
    }
  },
  data () {
    return {
      detailGroup: '',
      editingNameOfGroupAtIndex: -1,
      editingSettingsOfGroupAtIndex: -1,
      addingContactAtIndex: -1,
      groupNameDraft: '',
    }
  },
  computed: {
    draggableList: {
      get() {
        return this.$store.state.contactGroups
      },
      set(updatedList) {
        this.$store.dispatch('saveContactGroupList', { updatedList })
      }
    }

  },
  watch: {
    newGroupIdentifier (id) {
      if (id === '') return
      this.$nextTick(() => {
        const newGroupEl = document.querySelector(`[data-group-id='${id}']`)
        this.openGroup(id, newGroupEl, true)
      })
    }
  },
  methods: {
    openGroup (id, groupEl, scrollIntoView) {
      this.detailGroup = id

      scrollIntoView && this.$nextTick(() => {
        window.scrollTo({
          'behavior': 'smooth',
          'left': 0,
          'top': groupEl.offsetTop -45
        })
      })
    },
    onGroupHeaderClick (id, event) {

      if (event.target.nodeName === 'INPUT') return

      const applyGroupOpenClosedState = this.detailGroup === id
      ? () => { this.detailGroup = '' }
      : () => this.openGroup(id, groupEl, true)

      // get handle on DOM element for scrolling
      const groupEl = event.target.closest('.contact-group')

      if (this.detailGroup === '') {
        // no group is open
        this.openGroup(id, groupEl)
      } else {
        // a group is open, might be dirty

        if (this.$store.state.openContactIsDirty) {
          this.$store.commit('SHOW_MODAL', {
            heading: 'You have unsaved changes',
            confirmButtonLabel: 'Discard Changes',
            onConfirm: () => {
              this.$store.commit('SET_CONTACT_DIRTY_STATE', false)
              this.$store.commit('CLOSE_MODAL')
              applyGroupOpenClosedState()
            }
          })


        } else {
          return applyGroupOpenClosedState()
        }
      }

    },
    editGroupTitle (groupIndex) {
      this.groupNameDraft = this.$store.state.contactGroups[groupIndex].section
      this.editingNameOfGroupAtIndex = groupIndex
    },
    toggleSortable (groupIndex) {

      if (this.$store.state.openContactIsDirty) {
        return this.$store.dispatch('showModal', {
          heading: 'The open contact has unsaved changes',
          message: 'Please save or cancel contact edits before changing sort options',
          confirmButtonLabel: 'OK',
          hideCancel: true,
        })
      }

      this.$store.dispatch('toggleSortable', groupIndex)
    },
    saveGroupName () {
      this.$store.dispatch('saveContactGroupName', { groupIndex: this.editingNameOfGroupAtIndex, updatedName: this.groupNameDraft })
      this.editingNameOfGroupAtIndex = -1
    },
    deleteGroup (groupIndex) {
      const onConfirm = () => {
        this.$store.commit('SHOW_MODAL', {
          loading: true,
          heading: 'Are you sure you want to delete this contact group?',
          message: 'This will also delete all contacts in group.'
        })
        this.$store.dispatch('deleteContactGroup', groupIndex).then(() => {
          this.detailGroup = '',
          this.$store.dispatch('showSuccessModal', 'Contact group deleted successfully')
        })
      }

      this.$store.commit('SHOW_MODAL', {
        heading: 'Are you sure you want to delete this contact group?',
        message: 'This will also delete all contacts in group.',
        onConfirm
      })
    },
  }


}
</script>

<style lang="scss" scoped>
  @import '../sharedStyles.scss';
  .contact-group {
    background-color: $boneGrey;
  }
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    .name-and-edit {
      flex: 1 0 34%;
      display: inline-flex;
      align-items: center;
      .icon {
        opacity: .5;
        color: black;
        font-size: .88em;
        margin-left: .5em;
        &:hover {
          opacity: 1;
        }
      }
    }
    .name-editor { margin-bottom: 0; }
    .group-sort {
      display: inline-flex;
      align-items: center;
      transform: scale(.8);
      .toggle-container {
        width: auto;
        margin-left: 1.2em;
        display: inline-flex;
      }
    }
  }
  .emergency-group {
    .name-and-icon {
      display: flex;
      align-items: center;
      img.cross {
        width: 1em;
        margin-top: -1px;
        opacity: .4;
      }
      .name {
        margin-left: .9em;
      }
    }
  }


</style>
