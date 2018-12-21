<template>
  <div class="home">
    <site-header title="Contact Management" />
    <save-publish />
    <contacts />
  </div>
</template>

<script>
import { Contacts, SiteHeader, SavePublish } from './'

export default {
  components: {
    Contacts,
    SiteHeader,
    SavePublish,
  },
  data() {
    return {}
  },
  computed: {},
  created() {},
  methods: {},
}
</script>

<style scoped></style>
