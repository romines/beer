import Vue from 'vue'
import VueRouter from 'vue-router'

import { auth } from './firebaseInit.js'
import router from './router.js'
import store from './store'
import App from './App.vue'
import VueAxios from 'vue-axios'
import cmsAxios from './api/vue-axios/axios.js'
import globals from './globals.js'
import { ClientTable, ServerTable } from 'vue-tables-2'


import vClickOutside from 'v-click-outside'

// Use stuff
Vue.use(VueRouter)
Vue.use(VueAxios, cmsAxios)
Vue.use(vClickOutside)
Vue.use(ClientTable)
Vue.use(ServerTable)

// Mixins
import dateMixin from './mixins/date'
import numberHelper from './mixins/number'

// Add global mixins
// Vue.mixin(numberHelper) Current causing an error w/ Vuetables
Vue.mixin(numberHelper)

Vue.config.productionTip = false

Vue.prototype.$globals = globals

auth.onAuthStateChanged(() => {

  new Vue({
    el: '#app',
    router,
    store,
    cmsAxios,
    render: h => h(App),
  })

})
