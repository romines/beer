<template>
  <div class="export-json">
    <pre>{{ json }}</pre>
  </div>
</template>

<script>

export default {

  computed: {
    json() {
      return JSON.stringify(this.$store.state.contactGroups, null, 2)
    }
  }

}
</script>

<style scoped>

</style>
