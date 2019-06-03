<template>
  <div id="app">
    <!-- TODO: nav to separate component -->
    <div class="top-nav-container">
      <span class="top-nav">
        <router-link v-if="$store.state.resortId" to="/history">Revision History</router-link>
        <router-link v-if="$store.state.resortId" to="/maps">Maps</router-link>
        <span
          v-if="$store.state.user && $store.state.user.uid"
          class="text-and-icon"
          @click="logOut"
        >
          <span class="log-out">Logout</span>
          <span class="icon is-small"><i class="fas fa-power-off"/></span> &nbsp;
        </span>
      </span>
    </div>

    <Modal />

    <!-- main content area.. -->
    <LoadingSpinner v-show="$store.state.loading" />
    <router-view v-show="!$store.state.loading" class="main" />
    <!--  -->
  </div>
</template>

<script>
import { LoadingSpinner, Modal } from './components'
export default {
  name: 'App',
  components: {
    Modal,
    LoadingSpinner,
  },
  methods: {
    logOut() {
      this.$store.dispatch('logOut')
      this.$router.replace('/login')
    },
  },
}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/initial-variables';
@import '~bulma/sass/utilities/functions';
@import '~bulma/bulma';
@import 'sharedStyles';

// .contact-margin-setter:last-child .box {
//   margin-bottom: 0;
// }

// temp
.top-nav-container {
  position: fixed;
  z-index: 10;
  top: 0;
  width: 100%;
  height: 28px;
  background-color: $boneGrey;
  text-align: right;
  border-bottom: 1px solid black;
}

.top-nav {
  margin-right: 2.2em;
  color: blue !important;
  a {
    color: blue !important;
  }
  & > * {
    margin-right: 0.3em;
    &:not(.text-and-icon) {
      text-decoration: underline;
    }
  }

  .text-and-icon {
    cursor: pointer;
    position: relative;
    .log-out {
      text-decoration: underline;
    }

    .icon {
      position: relative;
      top: 0.2em;
      left: 0.2em;
    }
  }
}
// end temp

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #272c30;
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
  margin-top: -0.7em;
  margin-right: 0.3em;
  font-size: 12px;
  font-family: sans-serif;
  letter-spacing: 2px;
  color: #cccccc;
  text-shadow: 1px 0 1px black;
  padding-right: 1.6em;
  margin-right: 0.6em;
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
  margin-top: 0.88rem;
}

h1,
h2 {
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
