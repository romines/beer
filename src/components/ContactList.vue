<template>
  <draggable
    class="contact-list"
    v-model="myList"
    :options="{handle:'.contact-header'}"
    @start="drag=true; editingContactAtIndex = -1;"
    @end="drag=false">

    <div
      class="contact"
      v-for="(contact, index) in myList" :key="contact.name"
      :class="isOpen ? 'box' : ''">

      <div class="contact-header"
           :class="isOpen ? '' : 'box'"
           @click.stop="(editingContactAtIndex === index) ? editingContactAtIndex = -1 : editingContactAtIndex = index">
        <span class="name">{{ contact.name }}</span>
        <span class="icon is-small" v-show="true">
          <i class="fas fa-chevron-down"/>
        </span>
        <span class="icon is-small" v-show="false">
          <i class="fas fa-chevron-up"/>
        </span>
      <!-- end .contact-header -->
      </div>

      <edit-contact
        v-show="editingContactAtIndex === index"
        :group-index="groupIndex"
        :contact-index="index"
        :contact="contact"
        @cancelEdits="editingContactAtIndex = -1"/>

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
      if (!open) this.editingContactAtIndex = -1
    }
  },
  created () {
  },
  methods: {
  }
}
</script>

<style scoped>
  .contact-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
</style>
