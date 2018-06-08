<template>
  <draggable
    class="contact-group-list"
    v-model="myList"
    :options="{handle:'.grippy'}"
    @start="drag=true; editingNameOfGroupAtIndex = -1;"
    @end="drag=false">

    <div
      class="contact-group"
      :class="detailGroup === group.id ? 'box' : ''"
      v-for="(group, groupIndex) in myList"
      :key="group.id">

      <div
        class="group-header"
        :class="detailGroup === group.id ? '' : 'box'"
        @click="onGroupHeaderClick(group.id, $event)">

        <span class="name-and-edit" v-show="editingNameOfGroupAtIndex !== groupIndex">
          <span class="grippy" />
          <span class="name">{{ group.section }}</span>
          <span class="icon edit-name is-small" v-show="!group.emergency" @click.stop="editGroupTitle(groupIndex)">
            <i class="fas fa-edit"/>
          </span>
          <span class="icon delete-group is-small" v-show="!group.emergency" @click.stop="deleteGroup(groupIndex)">
            <i class="fas fa-trash-alt"/>
          </span>
        </span>
        <!-- OR -->
        <div class="name-editor field is-grouped" v-show="editingNameOfGroupAtIndex === groupIndex">
          <p class="control is-expanded">
            <input class="input is-small" v-model="groupNameDraft" placeholder="Group title">
          </p>
          <p class="control" @click.stop>
            <button class="button is-primary is-small" @click.stop.prevent="saveGroupName">Save</button>
            <button class="button is-small" @click.stop="editingNameOfGroupAtIndex = -1; groupNameDraft = '';">Cancel</button>
          </p>
        </div>

        <div class="group-sort" v-show="detailGroup === group.id && !group.emergency">
          <span>Custom Sort Order</span>
          <div class="toggle-container ">
            <label class="switch" @click.stop>
              <input type="checkbox" v-model="$store.state.contactGroups[groupIndex].noSort" @click.stop.prevent.self="toggleSortable(groupIndex)">
              <span class="slider round" />
            </label>
          </div>
        </div>

        <span class="icon is-small" v-show="detailGroup !== group.id">
          <i class="fas fa-chevron-down"/>
        </span>
        <span class="icon is-small" v-show="detailGroup === group.id">
          <i class="fas fa-chevron-up"/>
        </span>

        <!-- end .group-header -->
      </div>

      <div
        class="group-detail"
        v-if="!group.emergency && detailGroup === group.id">

        <contact-list :group-index="groupIndex" :group-is-open="detailGroup === group.id" />
        <!-- end .group-detail -->
        <div class="add-new-bar box" @click="addingContactAtIndex = groupIndex" v-show="addingContactAtIndex !== groupIndex">
          <span class="text">Add New Contact</span>
          <span class="icon is-small">
            <i class="fas fa-plus"/>
          </span>
        </div>

        <div class="add-new-contact box" v-if="addingContactAtIndex === groupIndex">
          <edit-contact
            :group-index="groupIndex"
            :contact-id="'NEW'"
            :contact="{}"
            @closeContact="addingContactAtIndex = -1"/>
        </div>

      </div>

      <emergency-contact-group v-if="group.emergency && detailGroup === group.id" :emergency-group="group"/>

      <!-- end .contact-group -->
    </div>

  </draggable>
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
    myList: {
      get() {
        return this.$store.state.contactGroups
      },
      set(updatedList) {
        this.$store.dispatch('saveContactGroupList', { updatedList })
      }
    }

  },
  watch: {
    newGroupIdentifier (value) {
      this.detailGroup = value
    }
  },
  methods: {
    onGroupHeaderClick (id, event, scrollIntoView) {

      // TODO: handle dirty contact state

      if (event.target.nodeName === 'INPUT') return;

      const groupEl = event.target.closest('.contact-group')
      const openGroup = (id, groupEl, scrollIntoView) => {
        this.detailGroup = id

        scrollIntoView && this.$nextTick(() => {
          window.scrollTo({
            'behavior': 'smooth',
            'left': 0,
            'top': groupEl.offsetTop -45
          });
        })
      }

      if (this.detailGroup === '') {
        // no group is open
        openGroup(id, groupEl)
      } else {
        // a group is open, might be dirty
        const applyGroupOpenClosedState = this.detailGroup === id
          ? () => {this.detailGroup = ''}
          : () => openGroup(id, groupEl, true)

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
      this.groupNameDraft = this.$store.state.contactGroups[groupIndex].section;
      this.editingNameOfGroupAtIndex = groupIndex;
    },
    toggleSortable (groupIndex) {
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
    initializeNewContact () {
      return {
        mailto: '',
        name: '',
        number: '',
        rect: '',
        url: '',
        z_reservations: ''
      }
    }
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


</style>
