<template>
  <div class="loading">
    <img v-if="isBlack" src="../../assets/loading-black.svg">
    <img v-else src="../../assets/loading.svg">
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: ['isBlack']
}
</script>

<style lang="scss" scoped>

.loading {

  width: 100%;
  height: 100%;

  > img {
    margin: 0 auto;
    display: block;
    height: 100%;
  }
}

</style>
