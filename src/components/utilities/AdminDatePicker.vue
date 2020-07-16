<template>
  <div class="select-date">

    <div class="date-pick">
      <span class="text">Start:</span>
      <Datepicker v-model="localStartDate"></Datepicker>
    </div>
    <div class="date-pick">
      <span class="text">End:</span>
      <Datepicker v-model="localEndDate"></Datepicker>
    </div>

    <div class="buttons">
      <button class="button is-primary" v-on:click="runDateSearch()" v-bind:disabled="!searchIsValid">Search</button>
      <button class="button" v-on:click="removeDates()">Clear</button>
    </div>

    <div class="errors">
      <span v-if="!datesAreValid">Start date must come before end date</span>
    </div>

  </div>
</template>

<script>

import Datepicker from 'vuejs-datepicker'

export default {
  name: 'AdminDatepicker',
  props: ['startDate', 'endDate'],
  components: {
    Datepicker
  },
  data () {
    return {
      localStartDate:  this.startDate,
      localEndDate:    this.endDate
    }
  },
  computed: {
    searchIsValid () {
      return this.bothDatesExist && this.datesAreValid
    },
    bothDatesExist () {
      return this.localStartDate && this.localEndDate
    },
    datesAreValid () {
      if (!this.bothDatesExist) return true
      return this.localEndDate > this.localStartDate
    }
  },
  methods: {
    removeDates () {
      this.localStartDate = null
      this.localEndDate   = null
      this.$emit('removeDates')
    },
    runDateSearch () {
      this.$emit('runDateSearch', this.localStartDate, this.localEndDate)
    }
  },
  watch: {
    startDate (val) {
      this.localStartDate = val
    },
    endDate (val) {
      this.localEndDate = val
    }
  }
}
</script>


<style lang="scss" scoped>

.select-date {

  margin:                   0 auto;
  padding:                  1em 0;
  border-radius:            0.25em;
  display:                  flex;
  align-items:              center;

  .date-pick {
    text-align:             center;
    margin-left:            1em;

    .vdp-datepicker {
      display:              inline-block;
    }
  }

  .buttons {
    text-align:             center;
    margin-left:            auto;
    margin-bottom:          none;
    margin-right:           1em;

    > button {

      &.inactive {
        opacity:            0.6;
        cursor:             default;
      }
    }
  }
}

</style>
