<template>
  <div class="resort-manager">

    <h1 class="setting-title">Resort Permissions</h1>

    <section class="editor">
      <div class="toggle-container">
        <span>Webcam Management:</span>
        <label for="manage-webcams" class="switch">
          <input v-model="resortPermissions.canManageWebcams" id="manage-webcams" type="checkbox">
          <span class="slider round"></span>
        </label>
      </div>

      <div class="toggle-container">
        <span>Contact Management:</span>
        <label for="manage-contacts" class="switch">
          <input v-model="resortPermissions.canManageContacts" id="manage-contacts" type="checkbox">
          <span class="slider round"></span>
        </label>
      </div>

      <div class="toggle-container">
        <span>Leaderboard Management:</span>
        <label for="manage-leaderboard" class="switch">
          <input v-model="resortPermissions.canManageLeaderboard" id="manage-leaderboard" type="checkbox">
          <span class="slider round"></span>
        </label>
      </div>
    </section>

  </div>
</template>

<script>

// import { mapGetters } from 'vuex'
import store from '../../store'
import { mapGetters } from 'vuex'

export default {
  components: {},
  data () {
    return {

    }
  },
  computed: {
    ...mapGetters(['resortPermissions'])
  },
  methods: {

  },
  watch: {
    resortPermissions: {
      handler (val) {
        this.$store.dispatch('updateResortPermissions', val)
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>

.resort-manager {

  .editor {

    margin-top:                   1em;

    .toggle-container {
      display:                    flex;
      align-items:                center;

      > span {
        min-width:                15em;
      }
    }
  }

}

</style>
