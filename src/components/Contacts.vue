<template>
  <div class="contacts">

    <contact-group-list :new-group-identifier="newGroupIdentifier"/>

    <div class="add-new-bar box" @click="addingGroup = true" v-show="!addingGroup">
      <span class="text">Add New</span>
      <span class="icon is-small">
        <i class="fas fa-plus"/>
      </span>
    </div>
    <div class="add-new-bar box new-group field is-grouped" v-show="addingGroup">
      <p class="control is-expanded">
        <input class="input is-small" v-model="groupNameDraft" placeholder="Group title" autofocus ref="nameInput">
      </p>
      <p class="control">
        <button class="button is-primary is-small" @click.stop="createNewGroup">Save</button>
        <button class="button is-small" @click.stop="addingGroup = false">Cancel</button>
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ContactGroupList from './ContactGroupList'

export default {
  components: {
    ContactGroupList
  },
  data () {
    return {
      addingGroup: false,
      groupNameDraft: '',
      newGroupIdentifier: ''
    }
  },
  computed: {
    ...mapState([
      'contactGroups'
    ])

  },
  created () {
  },
  methods: {
    createNewGroup () {
      this.$store.dispatch('saveNewEmptyGroup', this.groupNameDraft).then(() => {
        this.newGroupIdentifier = this.groupNameDraft
        this.addingGroup = false
        this.groupNameDraft = ''
      })
    }

  }
}
</script>

<style scoped>
</style>
