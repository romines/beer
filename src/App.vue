<template>
  <div id="app">
    <!-- temp -->
    <div class="re-seed" @click="$store.dispatch('seed')">reset</div>
    <!-- end temp -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style lang="scss">
@import '../node_modules/bulma/bulma.sass';
// temp
.re-seed {
  color: blue;
  text-decoration: underline;
  cursor: pointer;
  position: fixed;
  top: 0;
  left: 22%;
}
// end temp
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

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
