import Vue from 'vue'
import VueRouter from 'vue-router';

import Firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

import config from './firebaseConfig.js'
import routes from './router'
import store from './store'
import App from './App.vue'
import wysiwyg from "vue-wysiwyg"

Firebase.initializeApp(config)

Vue.use(VueRouter)
Vue.use(wysiwyg, { hideModules: { 'code': true, 'image': true, 'table': true  }})
Vue.config.productionTip = false

const router = new VueRouter({ routes })

router.beforeEach((to, from, next) => {

  store.commit('SET_FB_REFS', Firebase)

  if (to.name === 'login' || to.name === 'sign-up') {
    store.commit('SET_LOADING_STATE', false)
    return next()
  }

  if (!Firebase.auth().currentUser) {
    return next('/login')
  } else {
    store.dispatch('listen', Firebase.auth().currentUser).then(() => next())
  }

})

Firebase.auth().onAuthStateChanged(() => {

  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
  })

})