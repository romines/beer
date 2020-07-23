<template lang="html">
  <div class="master-data">
    <h1>Edit {{currentResort.name}} Data</h1>

    <!-- <div v-if="passwordNotEntered" class="password-container">
      <label>Enter password:</label>
      <input v-model="userPassword" type="password">
      <button v-on:click="checkPassword()" class="button is-primary">Enter</button>
      <span class="password-error" v-if="passwordError">
        Incorrect password, please try again.
      </span>
    </div>
    <div v-else class="data-container">
      <div v-for="(key, value) in resortData">
        {{key}}
      </div>
    </div> -->
    <div v-for="(value, key) in resortData" class="data-container">
      <div v-if="typeof(value) === 'string'" class="string-container">
        <label>{{key}}</label>
        <input v-bind:value="value"></input>
        <button v-on:click="updateStringField(key, $event)" class="button is-primary">Update</button>
      </div>
    </div>
  </div>

</template>

<script>

import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      passwordNotEntered:       true,
      password:                 'funnydolphin',
      userPassword:             '',
      passwordError:            false,
      resortData:               {}
    }
  },
  computed: {
    ...mapGetters(['currentResort'])
  },
  created () {
    this.getResortData()
  },
  methods: {
    checkPassword () {
      this.passwordError = false
      if (this.userPassword === this.password) {
        this.passwordNotEntered = false
        this.getResortData()
      } else {
        this.passwordError = true
      }
    },
    getResortData () {
      this.$store.dispatch('getResortData').then((resortData) => {
        this.resortData = resortData
      })
    },
    updateStringField (key, $event) {
      let value = $event.target.previousElementSibling.value    // input
      let payload = {}
      payload[key] = value

      this.$store.dispatch('setResortData', payload).then(() => {
        this.$store.dispatch('showSuccessModal', 'Field updated!')
      }).catch((error) => {
        console.log('ERROR SAVING DATA')
        console.log(error)
      })
    }
  }
}
</script>

<style lang="scss">

.master-data {
  > h1 {
    font-size:                      2em;
  }

  .password-container {
    padding:                        1em;
    display:                        flex;
    align-items:                    center;
    flex-wrap:                      wrap;

    input {
      margin-left:                  1em;
      margin-right:                 1em;
    }

    .password-error {
      width:                        100%;
      color:                        red;
      display:                      block;
      margin:                       1em 0;
    }
  }

  .data-container {

    .string-container {
      display:                      flex;
      align-items:                  center;
      margin:                       0.5em 0;

      > label {
        min-width:                  10em;
      }

      > input {
        margin-right:               1em;
        width:                      15em;
      }
    }
  }
}

</style>
