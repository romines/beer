<template>
  <div class="image-upload">

    <div class="file">
      <label class="file-label">
        <input class="file-input" type="file" name="resume">
        <span class="file-cta">
          <span class="file-icon">
            <i class="fas fa-upload"></i>
          </span>
          <span class="file-label">
            Choose a file…
          </span>
        </span>
      </label>
    </div>
  </div>
</template>

<script>
import Firebase from 'firebase/app'

export default {
  components: {
  },
  data () {
    return {
      email: 'adam.romines@gmail.com',
      password: 'password',
    }
  },
  computed: {


  },
  created () {
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
