<template>
  <div class="main">

    <!-- TODO: move this somewhere common -->
    <h1 class="title">
      <router-link to="/"><img src="../assets/logo.png"></router-link>
      <span class="page-title">
        Contact Management
      </span>
    </h1>
    <contact-group-list />
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
      detailGroup: '',
      editingContactAtIndex: -1
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
  /* .contact-group, .contact {
    padding: .6em;
  } */
  .main {
    max-width: 772px;
    margin: 0 auto;

  }
  .title {
    display: flex;
    justify-content: space-around;
  }
</style>
