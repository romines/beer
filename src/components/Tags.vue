<template>
  <div class="tags-page">
    <site-header title="Manage Tags" />
    <div class="main">
      <div class="tags">
        <div class="tag is-primary" v-for="tag in $store.state.tags.availableTags" :key="tag">
          <span class="name">{{tag}}</span>
          <span class="icon is-small remove" @click="deleteTag(tag)">
            <i class="fas fa-times-circle" />
          </span>
        </div>
      </div>
      <div class="add-new-bar box" v-show="!addingTag" @click="addingTag = true">
        <span class="text">Add New Tag</span>
        <span class="icon is-small">
          <i class="fas fa-plus" />
        </span>
      </div>
      <div class="add-new-bar box new-group field is-grouped" v-show="addingTag">
        <p class="control is-expanded">
          <input
            class="input is-small"
            v-model="tagNameDraft"
            @keyup.enter="createNewTag"
            placeholder="Enter tag"
            autofocus
            ref="nameInput"
          />
        </p>
        <p class="control">
          <button
            class="button is-primary is-small save"
            :disabled="!tagNameDraft.length"
            @click.stop="createNewTag"
          >Save</button>
          <button
            class="button is-small cancel"
            @click.stop="addingTag = false; tagNameDraft = ''"
          >Cancel</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { storage } from '../firebaseInit.js'
import SiteHeader from './SiteHeader.vue'

export default {
  name: 'Tags',
  components: {
    SiteHeader,
  },
  props: {},
  data() {
    return {
      addingTag: false,
      tagNameDraft: '',
    }
  },
  methods: {
    createNewTag() {
      this.$store.dispatch('saveNewTag', this.tagNameDraft)
      this.tagNameDraft = ''
    },
    deleteTag(tag) {
      this.$store.commit('SHOW_MODAL', {
        heading: 'Are you sure you want to delete this tag?',
        message: '',
        onConfirm: () => {
          this.$store.dispatch('deleteTag', tag)
          this.$store.commit('CLOSE_MODAL')
        },
      })
    },
  },
}
</script>

<style scoped>
</style>
