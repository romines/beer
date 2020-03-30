<template>
  <div id="app">
    <!-- TODO: nav to separate component -->
    <div v-if="$store.state.user && $store.state.user.uid" class="top-nav-container">

      <a v-on:click="goToLandingPage()"><img src="./assets/logo.png" class="logo"/></a>

      <div class="link-nav">
        <router-link v-bind:to="{ name: 'Home' }">Contacts</router-link>
        <router-link v-bind:to="{ name: 'PushNotifications' }">Push Notifications</router-link>
        <router-link v-bind:to="{ name: 'Settings' }">Settings</router-link>
      </div>

      <div class="right-nav">
        <span class="text-and-icon" @click="logOut">
          <span class="log-out">Logout</span>
          <span class="icon is-small"><i class="fas fa-power-off"/></span> &nbsp;
        </span>
      </div>
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
  beforeRouteEnter () {
    if (this.$store.state.user.superAdmin) return next('/resorts')
  },
  methods: {
    logOut() {
      this.$store.dispatch('logOut').then(() => {
        this.$router.replace('/login')
      })
    },
    goToLandingPage () {
      if (this.$store.state.user.superAdmin) {
        this.$router.replace('/resorts')
      } else {
        this.$router.replace('/').catch(() => {})
      }
    }
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
  padding:                    0.5em 1em;
  position:                   fixed;
  z-index:                    10;
  top:                        0;
  width:                      100%;
  background-color:           $boneGrey;
  border-bottom:              1px solid black;
  display:                    flex;
  align-items: center;

  .link-nav {

    > a {
      margin-right:           1em;
      color:                  #272c30;

      &.router-link-exact-active {
        color:                #42b983;
      }

      &:hover {
        text-decoration:      underline;
      }
    }

  }

  .logo {
    height:                   2em;
    margin-right:             2em;
  }

  .right-nav {
    margin-left:              auto;
    color:                    blue !important;

    a {
      color:                  blue !important;
    }

    & > * {
      margin-right:           0.3em;
      &:not(.text-and-icon) {
        text-decoration:      underline;
      }
    }

    .text-and-icon {
      cursor:                 pointer;
      position:               relative;
      .log-out {
        text-decoration:      underline;
      }

      .icon {
        position:             relative;
        top:                  0.2em;
        left:                 0.2em;
      }
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



// TRANSITIONS

.fade-enter { opacity: 0; }

.fade-leave-to { opacity: 0; }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.75s; }
</style>
