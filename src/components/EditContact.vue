<template>
  <div class="edit-contact">

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Name</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model="localState.contact.name"
          class="input"
          placeholder="Name">
        <span class="icon is-small is-left">
          <i class="fas fa-address-book" />
        </span>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Phone Number</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model="localState.contact.number"
          class="input"
          placeholder="Phone (w/ country code)">
        <span class="icon is-small is-left">
          <i class="fas fa-phone" />
        </span>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Website</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model="localState.contact.url"
          class="input"
          placeholder="Website">
        <span class="icon is-small is-left">
          <i class="fas fa-globe" />
        </span>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Email Address</label>
      </div>
      <div class="control has-icons-left">
        <input
          v-model="localState.contact.mailto"
          class="input"
          placeholder="Email Address">
        <span class="icon is-small is-left">
          <i class="fas fa-envelope" />
        </span>
      </div>
    </div>

    <div class="field is-grouped is-grouped-right">
      <p class="control no-expando">
        <a class="button is-primary" @click="saveContact">
          Save
        </a>
      </p>
      <p class="control no-expando">
        <a class="button is-light" @click="initializeContact(); $emit('cancelEdits')">
          Cancel
        </a>
      </p>
    </div>

  </div>
</template>

<script>

export default {
  components: {
  },
  props: {
    contact: {
      type: Object
    },
    groupIndex: {
      type: Number
    },
    contactIndex: {
      type: Number
    },
  },
  data () {
    return {
      localState: {
        contact: {
          // name: '',
          // number: '',
          // url: '',
          // mailto: '',
        }
      }
    }
  },

  watch: {
    // re-initialize when received again as prop
    contact () {
      this.initializeContact()
    }
  },
  created () {
    this.initializeContact()
  },
  methods: {
    saveContact () {
      this.$store.dispatch('saveContact', {
        groupIndex: this.groupIndex,
        contactIndex: this.contactIndex,
        updatedContact: this.localState.contact
      })
    },
    initializeContact () {
      this.localState.contact = Object.assign({}, this.contact)
    }
  }
}
</script>

<style scoped>
  .field .control:not(.no-expando) {
    flex-grow: 1;
  }
</style>
