<template>
  <div class="dashboard">

    DASH

    <!-- <button v-on:click="doTheThing">CLICK ME</button> -->

    <p class="g-signin2" data-onsuccess="doTheThing"></p>

  </div>
</template>

<script>
// 
// https://developers.google.com/identity/sign-in/web/sign-in
// https://console.developers.google.com/apis/credentials?project=crystal-mtn
// https://ga-dev-tools.appspot.com/account-explorer/
// https://developers.google.com/analytics/devguides/reporting/core/v4/quickstart/web-js


import VueMeta from 'vue-meta'

export default {
  components: {

  },
  metaInfo: {
    meta: [
      { name: 'google-signin-scope', content: 'https://www.googleapis.com/auth/analytics.readonly' },
      { name: 'google-signin-client_id', content: '181362648971-ln45k71sgfkhnvh0md8rghivpp292iur.apps.googleusercontent.com' }
    ],
    script: [
      { src: 'https://apis.google.com/js/client:platform.js', async: true, defer: true }
    ]
  },
  data () {
    return {

    }
  },
  computed: {

  },
  created () {

  },
  methods: {
    doTheThing() {
      gapi.client.request({
        path: '/v4/reports:batchGet',
        root: 'https://analyticsreporting.googleapis.com/',
        method: 'POST',
        body: {
          reportRequests: [
            {
              viewId: '79148021',
              dateRanges: [
                {
                  startDate: '7daysAgo',
                  endDate: 'today'
                }
              ],
              metrics: [
                {
                  expression: 'ga:sessions'
                }
              ]
            }
          ]
        }
      }).then((results) => console.log(results));
    }
  }
}
</script>

<style scoped>



</style>
