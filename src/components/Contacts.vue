<template>
  <div class="hello">
    <h1>Contact Management</h1>
    <!-- <div>
      <button @click="init">Initialize app base state</button>
    </div> -->
    <ul class="contact-group-list">
      <li
        class="contact-group"
        v-for="group in contactGroups"
        :key="group.section">
        <div
          class="group-header"
          @click="detailGroup = group.section">
          {{ group.section }}
        </div>
        <div
          class="group-detail"
          v-show="detailGroup === group.section">

          <ul class="contact-list">
            <li
              class="contact"
              v-for="contact in group.list">{{ contact.name }}</li>
          </ul>

        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  components: {
  },
  data () {
    return {
      detailGroup: ''
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
    init () {
      this.$store.dispatch('seed')
    },

  }
}
</script>

<style scoped>
  .contact-group {
    border: 1px solid blue;
  }
</style>
