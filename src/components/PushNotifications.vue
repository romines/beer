<template>
  <div class="push-notifications">
    <site-header title="Push Notifications" />

    <span class="button is-primary new-push-button" @click="showCreateContact = !showCreateContact">New Push Notification</span>

    <create-push v-if="showCreateContact" />


    <list-push />
    
  </div>
</template>

<script>

import SiteHeader from './SiteHeader.vue'
import CreatePush from './push-notifications/CreatePush.vue'
import ListPush from './push-notifications/ListPush.vue'

export default {
  components: {
    SiteHeader,
    CreatePush,
    ListPush
  },
  data() {
    return {
      showCreateContact:      false
    }
  },
  computed: {},
  created() {},
  methods: {},
}
</script>

<style scoped lang="scss">

.push-notifications {

  position:                   relative;

  .new-push-button {
    position:                 absolute;
    top:                      3.5em;
    right:                    0.5em;
  }
}

</style>
