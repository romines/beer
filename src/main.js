import Vue from 'vue'
import VueRouter from 'vue-router';

import Firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import config from './firebaseConfig.js'
import routes from './router'
import store from './store'
import App from './App.vue'

Firebase.initializeApp(config)
const db = Firebase.firestore()

Vue.use(VueRouter)
Vue.config.productionTip = false

const router = new VueRouter({ routes })

router.beforeEach((to, from, next) => {

  store.commit('SET_FB_REFS', db)

  if (to.name === 'login' || to.name === 'sign-up') return next()

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