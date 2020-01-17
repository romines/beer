import Vue from 'vue'
import VueRouter from 'vue-router'

import { auth } from './firebaseInit.js'
import router from './router.js'
import store from './store'
import App from './App.vue'
import VueAxios from 'vue-axios'
import axios from './api/vue-axios/axios.js'


import vClickOutside from 'v-click-outside'

Vue.use(VueRouter)
Vue.use(VueAxios, axios)
Vue.use(vClickOutside)

Vue.config.productionTip = false

auth.onAuthStateChanged(() => {

  new Vue({
    el: '#app',
    router,
    store,
    axios,
    render: h => h(App),
  })

})
