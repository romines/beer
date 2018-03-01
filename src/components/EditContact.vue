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
      <p class="control no-expando" v-show="contactIndex !== -1">
        <a class="button is-danger is-outlined" @click="deleteContact">
          <span>Delete</span>
          <span class="icon is-small">
            <i class="fas fa-trash-alt" />
          </span>
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
    // re-initialize localState when 'contact' prop changes
    contact () {
      this.initializeContact()
    }
  },
  created () {
    this.initializeContact()
  },
  methods: {
    initializeContact () {
      this.localState.contact = Object.assign({}, this.contact)
    },
    saveContact () {
      this.$store.dispatch('saveContact', {
        groupIndex: this.groupIndex,
        contactIndex: this.contactIndex,
        updatedContact: this.localState.contact
      })
      this.$emit('cancelEdits')
    },
    deleteContact () {
      const payload = {
        groupIndex: this.groupIndex,
        contactIndex: this.contactIndex
      }
      this.$store.dispatch('deleteContact', payload)
      this.$emit('cancelEdits')
    }
  }
}
</script>

<style scoped>
  .edit-contact {
    padding-top: .6em;
  }
  .field .control:not(.no-expando) {
    flex-grow: 1;
  }
</style>
