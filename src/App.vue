<template>
  <div id="app">
    <!-- temp -->
    <div class="top-nav-container">
      <span class="top-nav">
        <router-link to="/">home</router-link>
        <router-link to="json">JSON</router-link>
        <span @click="$store.dispatch('seed')">reset contacts</span>&nbsp;
        <span
          @click="logOut"
          class="icon is-small"
          v-if="Object.keys($store.state.user).length"><i class="fas fa-power-off" /></span>&nbsp;
      </span>
    </div>

    <modal />
    <!-- end temp -->
    <router-view/>
  </div>
</template>

<script>
import Modal from './components/Modal.vue'
export default {
  name: 'App',
  components: { Modal },
  methods: {
    logOut () {
      this.$store.dispatch('logOut')
      this.$router.replace('/login')
    }
  }
}
</script>

<style lang="scss">
@import '~bulma/bulma.sass';
@import '~animate.css/animate.css';
@import 'sharedStyles.scss';

// global bulma overrides
.box {
  padding: .85rem;
  &:not(:last-child) {
    margin-bottom: .88rem;
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

// drag and drop handles
// source https://codepen.io/zachariab/pen/wkrbc
.grippy {
  content: '....';
  width: 10px;
  height: 20px;
  display: inline-block;
  overflow: hidden;
  line-height: 5px;
  padding: 3px 4px;
  cursor: move;
  vertical-align: middle;
  margin-top: -.7em;
  margin-right: .3em;
  font-size: 12px;
  font-family: sans-serif;
  letter-spacing: 2px;
  color: #cccccc;
  text-shadow: 1px 0 1px black;
  padding-right: 1.6em;
  margin-right: .6em;
}
.grippy::after {
  content: '.. .. .. ..';
}

.add-new-bar {
  background: $mildNavy;
  color: $notQuiteWhite;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-top: .88rem;
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
