<template>
  <div class="hello">
    <h1>Contact Management</h1>
    <!-- <div>
      <button @click="init">Initialize app base state</button>
    </div> -->
    <ul class="contact-group-list">
      <li class="contact-group" v-for="group in contactGroups" :key="group.section">
        {{group.section}}
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
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
