import Vue from 'vue'
import VueRouter from 'vue-router'

import Firebase from './firebaseInit.js'
import router from './router'
import store from './store'
import App from './App.vue'
import wysiwyg from "vue-wysiwyg"

Vue.use(VueRouter)
Vue.use(wysiwyg, { hideModules: { 'code': true, 'image': true, 'table': true  }})
Vue.config.productionTip = false

Firebase.auth().onAuthStateChanged(() => {

  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
  })

})