<template>
  <div class="push-notifications">
    <site-header title="Push Notifications" />

    <span class="button is-primary new-push-button" @click="showCreatePush = !showCreatePush">New Push Notification</span>

    <transition name="fade">
      <create-push v-if="showCreatePush" v-on:closeCreatePush="showCreatePush = false" v-on:pushCreated="onPushCreated()" class="new-push-container" />
    </transition>

    <list-push ref="listPush" class="list-push-container" />

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
      showCreatePush:      false
    }
  },
  computed: {},
  created() {},
  methods: {
    onPushCreated () {
      this.$refs.listPush.getPushNotifications(true)
    }
  },
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

  .new-push-container {
    margin-top:               1em;
  }

  .list-push-container {
    margin-top:               2em;
  }
}

</style>
