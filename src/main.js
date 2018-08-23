import Vue from 'vue'
import VueRouter from 'vue-router'

import { auth } from './firebaseInit.js'
import router from './router.js'
import store from './store'
import App from './App.vue'

import wysiwyg from "vue-wysiwyg"
import vClickOutside from 'v-click-outside'

Vue.use(VueRouter)
Vue.use(wysiwyg, { hideModules: { 'code': true, 'image': true, 'table': true  }})
Vue.use(vClickOutside)

Vue.config.productionTip = false

auth.onAuthStateChanged(() => {

  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
  })

})