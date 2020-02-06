<template>
  <div class="login">

    <!-- TODO: move this somewhere common -->
    <h1 class="title">
      <router-link to="/"><img src="../assets/logo.png"></router-link>
      <span class="page-title">
        &nbsp;
      </span>
    </h1>

    <div class="main">

      <div class="card">
        <div class="card-header">
          <p class="card-header-title">
            Login
          </p>
        </div>
        <div class="card-content">
          <div class="field">
            <p class="control has-icons-left">
              <input class="input" v-model="email" type="email" placeholder="Email">
              <span class="icon is-small is-left">
                <i class="fas fa-envelope" />
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control has-icons-left">
              <input class="input" v-model="password" type="password" placeholder="Password" @keyup.enter="logIn">
              <span class="icon is-small is-left">
                <i class="fas fa-lock" />
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control">
              <button class="button is-success" @click="logIn" :disabled="!emailIsValid(email) || !password.length">
                Login
              </button>
            </p>
          </div>
        </div>
        <footer class="card-footer">
          <p class="card-footer-item">
            <span>
              <router-link to="/reset">Forgot password?</router-link>
            </span>
          </p>
        </footer>
      </div>

    </div>

  </div>
</template>

<script>
import mixins from './mixins'

export default {
  mixins: [mixins],
  data () {
    return {
      email: '',
      password: '',
    }
  },
  methods: {
    logIn () {
      this.$store.commit('SET_LOADING_STATE', true)
      this.$store.dispatch('logIn', {
        email: this.email,
        password: this.password,
        onSuccess: () => { this.$router.replace('/') }
      })
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
