<template>
  <draggable
    class="contact-group-list"
    v-model="myList"
    :options="{handle:'.grippy'}"
    @start="drag=true; editingNameOfGroupAtIndex = -1;"
    @end="drag=false">

    <div
      class="contact-group"
      :class="detailGroup === group.section ? 'box' : ''"
      v-for="(group, groupIndex) in myList"
      :key="group.section">

      <div
        class="group-header"
        :class="detailGroup === group.section ? '' : 'box'"
        @click="onGroupHeaderClick(group.section, $event)">

        <span class="name-and-edit" v-show="editingNameOfGroupAtIndex !== groupIndex">
          <span class="grippy" />
          <span class="name">{{ group.section }}</span>
          <span class="icon edit-name is-small" @click.stop="editGroupTitle(groupIndex)">
            <i class="fas fa-edit"/>
          </span>
          <span class="icon delete-group is-small" @click.stop="deleteGroup(groupIndex)">
            <i class="fas fa-trash-alt"/>
          </span>
        </span>

        <div class="name-editor field is-grouped" v-show="editingNameOfGroupAtIndex === groupIndex">
          <p class="control is-expanded">
            <input class="input is-small" v-model="groupNameDraft" placeholder="Group title">
          </p>
          <p class="control">
            <button class="button is-primary is-small" @click.stop="saveGroupName">Save</button>
            <button class="button is-small" @click.stop="editingNameOfGroupAtIndex = -1; groupNameDraft = '';">Cancel</button>
          </p>
        </div>

        <div class="group-sort" v-show="detailGroup === group.section">
          <span>Custom Sort Order</span>
          <div class="toggle-container ">
            <label class="switch" @click.stop>
              <input type="checkbox" v-model="$store.state.contactGroups[groupIndex].noSort" @click.stop.prevent.self="toggleSortable(groupIndex)">
              <span class="slider round" />
            </label>
          </div>
        </div>

        <span class="icon is-small" v-show="detailGroup !== group.section">
          <i class="fas fa-chevron-down"/>
        </span>
        <span class="icon is-small" v-show="detailGroup === group.section">
          <i class="fas fa-chevron-up"/>
        </span>

        <!-- end .group-header -->
      </div>

      <div
        class="group-detail"
        v-if="detailGroup === group.section">

        <contact-list :group-index="groupIndex" :is-open="detailGroup === group.section" />
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
            :contact-index="-1"
            contact="{}"
            @closeContact="addingContactAtIndex = -1"/>
        </div>

      </div>

      <!-- end .contact-group -->
    </div>

  </draggable>
</template>

<script>
import draggable from 'vuedraggable'
import ContactList from './ContactList'
import EditContact from './EditContact'

export default {
  components: {
    draggable,
    ContactList,
    EditContact,
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
    onGroupHeaderClick (section, event) {
      if (event.target.nodeName === 'INPUT') return;
      this.detailGroup = (this.detailGroup === section) ? '' : section
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
          this.$store.commit('SHOW_MODAL', {
            heading: 'Contact group deleted successfully',
            buttonLess: true
          })
          setTimeout(() => {
            this.$store.commit('CLOSE_MODAL')
          }, 1500);
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
        mailto: 'asdflkjsadf',
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
