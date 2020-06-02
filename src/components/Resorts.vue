<template>
  <div class="resorts">
    <site-header title="Resorts" />

    <ul v-if="currentUser.superAdmin">
      <li class="resort box" v-for="resort in resorts" @click="goToResort(resort.resortId)">
        <span class="name">{{ resort.name }}</span>
      </li>
    </ul>
    <ul v-else>
      <li class="resort box" v-for="resort in userResorts" @click="goToResort(resort.resortId)">
        <span class="name">{{ resort.name }}</span>
      </li>
    </ul>

    <new-resort v-if="currentUser.superAdmin" />
  </div>
</template>

<script>
import SiteHeader from './SiteHeader.vue'
import NewResort from './NewResort.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    SiteHeader,
    NewResort,
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['currentUser']),
    resorts () {
      return this.$store.state.resorts.slice().sort((a, b) => {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
    },
    userResorts () {
      return this.$store.state.resorts.filter((resort) => {
        return this.currentUser.authorizedResortIds().includes(resort.resortId)
      })
    }
  },
  methods: {
    goToResort(resortId) {
      this.$store.commit('SET_LOADING_STATE', true)
      this.$store.dispatch('setCurrentResort', resortId).then(() => {
        this.$store.dispatch('getCurrentResortPermissions')
        this.$router.push('/')
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.resorts {
  .resort {
    cursor: pointer;
    &.box:not(:last-child) {
      margin-bottom: 0.88rem;
    }
  }
}
</style>
