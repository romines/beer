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
      <div v-if="typeof(value) === 'boolean'" class="string-container">
        <label>{{key}}</label>
        <input v-bind:checked="value" type="checkbox"></input>
        <button v-on:click="updateBooleanField(key, $event)" class="button is-primary">Update</button>
      </div>
    </div>

    <div v-for="(value, key) in resortData" class="data-container">
      <div v-if="typeof(value) === 'object'" class="object-container">
        <section v-on:click="setCurrentObjectKey(key)" class="header">
          {{key}}
        </section>
        <section v-if="showObject(key)" class="body">
          <div v-if="Array.isArray(value)">
            <textarea v-bind:value="value">
            </textarea>
          </div>
          <div v-else>
            <div v-for="(val, key) in value" class="data-container">
              <div v-if="typeof(val) === 'string'" class="string-container">
                <label>{{key}}</label>
                <input v-bind:value="val"></input>
                <button v-on:click="updateStringField(key, $event)" class="button is-primary">Update</button>
              </div>
              <div v-if="typeof(value) === 'boolean'" class="string-container">
                <label>{{key}}</label>
                <input v-bind:checked="value" type="checkbox"></input>
                <button v-on:click="updateBooleanField(key, $event)" class="button is-primary">Update</button>
              </div>
              {{typeof(value)}}
              {{value}}
            </div>
          </div>
          <button v-on:click="updateStringField(key, $event)" class="button is-primary">Update</button>
        </section>

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
      resortData:               {},
      currentObjectKey:         ''
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
      let value = $event.target.previousElementSibling.value    // input val
      this.updateField(key, value)
    },
    updateBooleanField (key, $event) {
      let value = $event.target.previousElementSibling.checked  // input val
      this.updateField(key, value)
    },
    updateField (key, value) {
      let payload = {}
      payload[key] = value

      this.$store.dispatch('setResortData', payload).then(() => {
        this.$store.dispatch('showSuccessModal', 'Field updated!')
      }).catch((error) => {
        console.log('ERROR SAVING DATA')
        console.log(error)
      })
    },
    showObject (key) {
      return this.currentObjectKey == key
    },
    setCurrentObjectKey (key) {
      if (this.showObject(key)) {
        this.currentObjectKey = ''
      } else {
        this.currentObjectKey = key
      }
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

    .object-container {

      border:                       1px solid #dfe0e2;
      border-radius:                0.25em;
      margin-bottom:                0.88em;

      .header {
        display:                    flex;
        align-items:                center;
        cursor:                     pointer;
        background:                 #dfe0e2;
        padding:                    0.88em;
      }

      .body {
        padding:                    1.5em 2em;
      }
    }
  }
}

</style>
