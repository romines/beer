<template>
  <div class="sign-up">

    <!-- TODO: move this somewhere common -->
    <h1 class="title">
      <router-link to="/"><img src="../assets/logo.png"></router-link>
      <span class="page-title">
        &nbsp;
      </span>
    </h1>

    <div class="main">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            Sign Up | ResortId: {{ resortId }}
          </p>
        </header>
        <div class="card-content">
          <div class="field">
            <p class="control has-icons-left has-icons-right">
              <input class="input" v-model="email" type="email" placeholder="Email">
              <span class="icon is-small is-left">
                <i class="fas fa-envelope" />
              </span>
              <span class="icon is-small is-right">
                <i class="fas fa-check" />
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control has-icons-left">
              <input class="input" v-model="password" type="password" placeholder="Password">
              <span class="icon is-small is-left">
                <i class="fas fa-lock" />
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control has-icons-left">
              <input class="input" type="password" placeholder="Confirm Password">
              <span class="icon is-small is-left">
                <i class="fas fa-lock" />
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control">
              <button class="button is-success" @click="signUp">
                Submit
              </button>
            </p>
          </div>
        </div>
        <footer class="card-footer">
          <p class="card-footer-item">
            <span>
              <router-link to="/login">Login</router-link> instead
            </span>
          </p>
        </footer>
      </div>

    </div>

  </div>
</template>

<script>

import Firebase from 'firebase/app'

export default {
  components: {
  },
  props: {
    encodedResortId: {
      type: String
    }
  },
  data () {
    return {
      email: '',
      password: '',
    }
  },
  computed: {
    resortId () {
      console.log(this.encodedResortId);
      return window.atob(this.encodedResortId)
    }

  },
  created () {
  },
  methods: {
    signUp () {
      this.$store.dispatch('createUser', {
        email: this.email,
        password: this.password,
        resortId: this.resortId
      }).then(() => { this.$router.replace('/')})
    }
  }
}
</script>

<style scoped>
  /* .contact-group, .contact {
    padding: .6em;
  } */

  .field {
    max-width: 40em;
  }
</style>
