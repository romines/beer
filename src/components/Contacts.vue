<template>
  <div class="contacts">

    <contact-group-list :new-group-identifier="newGroupIdentifier" />

    <div class="add-new-bar box" @click="addingGroup = true" v-show="!addingGroup">
      <span class="text">Add New Contact Group</span>
      <span class="icon is-small">
        <i class="fas fa-plus" />
      </span>
    </div>
    <div class="add-new-bar box new-group field is-grouped" v-show="addingGroup">
      <p class="control is-expanded">
        <input class="input is-small" v-model="groupNameDraft" @keyup.enter="createNewGroup" placeholder="Group title" autofocus ref="nameInput">
      </p>
      <p class="control">
        <button class="button is-primary is-small save" :disabled="!groupNameDraft.length" @click.stop="createNewGroup">Save</button>
        <button class="button is-small cancel" @click.stop="addingGroup = false; groupNameDraft = ''">Cancel</button>
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
      if (!this.groupNameDraft) return

      this.$store.commit('SET_LOADING_STATE', true)

      this.$store.dispatch('saveNewEmptyGroup', this.groupNameDraft).then((groupId) => {
        this.$store.commit('SET_LOADING_STATE', false)
        this.newGroupIdentifier = groupId
        this.addingGroup = false
        this.groupNameDraft = ''
      })
    }

  }
}
</script>

<style scoped>
</style>
