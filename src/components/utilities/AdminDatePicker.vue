<template>
  <div class="select-date row">

    <div class="date-pick col-md-6">
      <span class="text">Start Date:</span>
      <Datepicker v-model="localStartDate"></Datepicker>
    </div>
    <div class="date-pick col-md-6">
      <span class="text">End Date:</span>
      <Datepicker v-model="localEndDate"></Datepicker>
    </div>

    <div class="buttons col-md-12">
      <button class="button" v-on:click="removeDates()">Clear Dates</button>
      <button class="button action-button" v-on:click="runDateSearch()" v-bind:class="{ inactive: !true }">Search</button>
    </div>

  </div>
</template>

<script>

import Datepicker from 'vuejs-datepicker'

export default {
  name: 'AdminDatepicker',
  props: ['startDate', 'endDate', 'datesAreActive', 'datesAreValid'],
  components: {
    Datepicker
  },
  data () {
    return {
      localStartDate:  this.startDate,
      localEndDate:    this.endDate
    }
  },
  methods: {
    removeDates () {
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

  max-width:                70%;
  margin:                   0 auto;
  padding:                  2em;
  border:                   1px solid lightgray;
  border-radius:            0.25em;

  .date-pick {
    text-align:             center;

    .vdp-datepicker {
      display:              inline-block;
    }
  }

  .buttons {
    text-align:             center;
    margin-top:             1em;

    > button {
      margin:               0.5em;

      &.inactive {
        opacity: 0.6;
        cursor: default;
      }
    }
  }
}

</style>
