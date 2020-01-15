<template>
  <div class="push-notifications">
    <site-header title="Push Notifications" />
    <create-push />
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
    return {}
  },
  computed: {},
  created() {},
  methods: {},
}
</script>

<style scoped lang="scss">

.push-notifications {

}

</style>
