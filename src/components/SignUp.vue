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
            <p class="control has-icons-left">
              <input class="input"
                     v-model="email"
                     type="email"
                     placeholder="Email"
                     @blur="emailHasBeenTouched = true"
                     @focus="emailHasBeenTouched = false">
              <span class="icon is-small is-left">
                <i class="fas fa-envelope" />
              </span>
            </p>
            <p class="help is-danger" v-show="email && emailHasBeenTouched && !validEmail">Email format is invalid</p>
            <p class="help is-danger" v-show="emailHasBeenTouched && !email">Email is required</p>
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
              <input class="input" v-model="confirmPassword" type="password" placeholder="Confirm Password">
              <span class="icon is-small is-left">
                <i class="fas fa-lock" />
              </span>
            </p>
            <p class="help is-danger" v-show="confirmPassword && !passwordMismatch">Passwords do not match</p>
          </div>
          <div class="field">
            <p class="control">
              <button class="button is-success" @click="signUp" :disabled="!isValid">
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
      confirmPassword: '',
      emailHasBeenTouched: false
    }
  },
  computed: {
    resortId () {
      return window.atob(this.encodedResortId)
    },
    isValid () {
      return this.validEmail && !!this.password && (this.password === this.confirmPassword)
    },
    validEmail () {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(this.email)
    },
    passwordMismatch () {
      return this.confirmPassword.split('').every((char, index) => {
        return char === this.password[index]}
      )
    }

  },
  created () {
  },
  methods: {
    signUp () {
      this.$store.commit('SET_LOADING_STATE', true)
      this.$store.dispatch('createUser', {
        email: this.email,
        password: this.password,
        resortId: this.resortId,
        onSuccess: () => {
          this.$router.replace('/')
        }
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
