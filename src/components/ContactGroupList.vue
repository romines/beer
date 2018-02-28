<template>
  <draggable
    class="contact-group-list"
    v-model="myList"
    :options="{handle:'.group-header'}"
    @start="drag=true"
    @end="drag=false">

    <div
      class="contact-group"
      :class="detailGroup === group.section ? 'box' : ''"
      v-for="(group, groupIndex) in myList"
      :key="group.section">

      <div
        class="group-header"
        :class="detailGroup === group.section ? '' : 'box'"
        @click="detailGroup = (detailGroup === group.section) ? '' : group.section; editingContactAtIndex = -1">
        <span class="name">{{ group.section }}</span>
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
      </div>

      <!-- end .contact-group -->
    </div>

  </draggable>
</template>

<script>
import draggable from 'vuedraggable'
import ContactList from './ContactList'

export default {
  components: {
    draggable,
    ContactList
  },
  data () {
    return {
      detailGroup: ''
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
  created () {
  },
  methods: {
  }
}
</script>

<style scoped>
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
