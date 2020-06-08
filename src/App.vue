<template>
  <div id="app">
    <!-- TODO: nav to separate component -->

    <div v-if="currentUser && currentUser.uid && currentResort.id && !$store.state.loading" class="top-nav-container">

      <a v-on:click="goToLandingPage()"><img src="./assets/logo.png" class="logo"/></a>

      <div class="link-nav">
        <router-link v-bind:to="{ name: 'PushNotifications' }">Push Notifications</router-link>
        <router-link v-if="this.currentUser.canAccessContacts()" v-bind:to="{ name: 'Resort' }">Contacts</router-link>
        <router-link v-if="this.currentUser.canAccessWebcams()" v-bind:to="{ name: 'WebcamManager' }">Webcams</router-link>
        <router-link v-if="this.currentUser.canAccessLeaderboard()" v-bind:to="{ name: 'Leaderboard' }">Leaderboard</router-link>
      </div>

      <div class="right-nav">
        <div class="current-resort">{{currentResort.name}}</div>
        <div v-on:click="showUserMenu = !showUserMenu" class="header">
          <span class="current-user">{{currentUser.email}}</span>
          <i v-if="showUserMenu" class='toggler fas fa-angle-up'></i>
          <i v-else class='toggler fas fa-angle-down'></i>
        </div>


        <div v-if="showUserMenu" class="user-menu">
          <span v-if="currentUser.canAccessResorts()" class="menu-item" @click="goToResorts()">
            Resorts
          </span>
          <span v-if="currentUser.canAccessSettings()" class="menu-item" @click="goToSettings()">
            Settings
          </span>
          <span class="menu-item" @click="goToProfile()">
            Profile
          </span>
          <span class="menu-item" @click="logOut()">
            Logout
          </span>
        </div>
      </div>
    </div>

    <Modal />

    <!-- main content area.. -->
    <LoadingSpinner v-if="$store.state.loading" />
    <router-view v-else class="main" />
    <!--  -->
  </div>
</template>

<script>
import { LoadingSpinner, Modal } from './components'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    Modal,
    LoadingSpinner,
  },
  beforeRouteEnter () {
    // if (this.currentUser.superAdmin) return next('/resorts')
  },
  data () {
    return {
      showUserMenu:           false
    }
  },
  created () {
    // Closes the user menu on any click outside of it
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.header') || event.target.className === 'header') {
        this.showUserMenu = false
      }
    })
  },
  computed: {
    ...mapGetters(['currentUser', 'currentResort', 'resortPermissions'])
  },
  methods: {
    logOut() {
      this.$store.commit('SET_LOADING_STATE', true)
      this.$store.dispatch('logOut').then(() => {
        this.$router.replace('/login')
        this.$store.commit('SET_LOADING_STATE', false)
      })
    },
    goToProfile () {
      this.$router.replace('/profile')
    },
    goToSettings () {
      this.$router.replace('/settings/push')
    },
    goToResorts () {
      this.$router.replace('/resorts')
    },
    goToLandingPage () {
      if (this.currentUser.superAdmin) {
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
    position:                 relative;
    cursor:                   pointer;

    .header {
      display:                flex;
      align-items:            center;

      .current-user {
        margin-right:         1em;
      }

      .toggler {
        font-size:            24px;
      }
    }

    .user-menu {
      position:               absolute;
      top:                    0;
      right:                  0;
      width:                  10em;
      background:             white;
      border:                 2px solid lightgray;
      border-top:             none;
      top:                    57px;

      .menu-item {
        display:              block;
        padding:              0.5em 1em;

        &:hover {
          background-color:   darkgray;
          color:              white;
        }
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
