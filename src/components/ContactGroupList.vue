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
          <span class="icon is-small" @click.stop="editGroupTitle(groupIndex)">
            <i class="fas fa-edit"/>
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
        v-show="detailGroup === group.section">

        <contact-list :group-index="groupIndex" :is-open="detailGroup === group.section"/>
        <!-- end .group-detail -->
        <div class="add-new-bar box" @click="addingContactAtIndex = groupIndex" v-show="addingContactAtIndex !== groupIndex">
          <span class="text">Add New Contact</span>
          <span class="icon is-small">
            <i class="fas fa-plus"/>
          </span>
        </div>

        <div class="add-new-contact box" v-show="addingContactAtIndex === groupIndex">
          <edit-contact
            :group-index="groupIndex"
            :contact-index="-1"
            :contact="initializeNewContact()"
            @cancelEdits="addingContactAtIndex = -1"/>
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
    EditContact
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
    editGroupTitle(groupIndex) {
      this.groupNameDraft = this.$store.state.contactGroups[groupIndex].section;
      this.editingNameOfGroupAtIndex = groupIndex;
    },
    saveGroupName() {
      this.$store.dispatch('saveContactGroupName', { groupIndex: this.editingNameOfGroupAtIndex, updatedName: this.groupNameDraft })
      this.editingNameOfGroupAtIndex = -1
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
      display: inline-flex;
      align-items: center;
      .icon {
        opacity: .7;
        font-size: .88em;
        margin-left: .5em;
      }
    }
    .name-editor { margin-bottom: 0; }
  }


</style>
