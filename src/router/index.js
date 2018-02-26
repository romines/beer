import Vue from 'vue'
import Router from 'vue-router'
import Contacts from '../components/Contacts'
import store from '../store'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'contacts',
      component: Contacts
    },
    // TODO: make '/' an alias of '/contacts'
    // { path: '/contacts', component: Contacts },
  ]
})

router.beforeEach((to, from, next) => {

  store.dispatch('listen')

  next();

})

export default router