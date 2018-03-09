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
  store.dispatch('listen', db).then(() => next())

  // if (to.name === 'login') return next()

  // if (!Firebase.auth().currentUser) {
  //   return next('/login')
  // } else {
  //   console.log({currentUser: Firebase.auth().currentUser})
  //   store.dispatch('listen', db).then(() => next())
  // }

})

Firebase.auth().onAuthStateChanged(function (user) {

  new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    created () {
      user && store.commit('SET_USER', user)
    },
    template: '<App/>',
  });

})