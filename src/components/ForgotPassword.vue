<template>
  <div class="forgot-password">

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
            Reset Password
          </p>
        </div>
        <div class="card-content">
          <div class="field">
            <p class="control has-icons-left has-icons-right">
              <input class="input" v-model="email" type="email" placeholder="Email">
              <span class="icon is-small is-left">
                <i class="fas fa-envelope" />
              </span>
              <span class="icon is-small is-right" :class="email && emailIsValid(email) ? 'has-text-success': 'has-text-grey-lighter'">
                <i class="fas fa-check" />
              </span>
            </p>
          </div>
          <div class="field">
            <p class="control">
              <button class="button is-success" @click="triggerReset" :disabled="!email || !emailIsValid(email)">
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
import mixins from './mixins'
export default {
  components: {
  },
  mixins: [mixins],
  data () {
    return {
      email: '',
      password: '',
    }
  },
  computed: {

  },
  created () {
  },
  methods: {
    async triggerReset () {
      this.$store.commit('SET_LOADING_STATE', true)
      const { successfulEmailTrigger } = await this.$store.dispatch('triggerPasswordResetEmail', {
        email: this.email
      })
      if (successfulEmailTrigger) {
        this.$store.commit('SET_LOADING_STATE', false)
        this.$router.replace('/login')
        this.$store.dispatch('showModal', {
          heading: 'Password reset requested successfully',
          message: 'Check your email for instructions on completing reset',
          confirmButtonLabel: 'OK',
          hideCancel: true
        })
      }
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
