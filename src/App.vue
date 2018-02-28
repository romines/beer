<template>
  <div id="app">
    <!-- temp -->
    <div class="top-nav-container">
      <span class="top-nav">
        <router-link to="/">home</router-link>
        <router-link to="json">JSON</router-link>
        <span @click="$store.dispatch('seed')">reset contacts</span>&nbsp;
      </span>
    </div>
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
@import '~bulma/bulma.sass';
@import 'sharedStyles.scss';

// global bulma overrides
.box {
  padding: .85rem;
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
}

// temp
.top-nav-container {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: $boneGrey;
  text-align: right;
}

.top-nav {
  margin-right: 2.2em;
  & > * {
    color: blue;
    text-decoration: underline;
    cursor: pointer;
  }

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
