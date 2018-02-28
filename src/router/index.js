import Vue from 'vue'
import Router from 'vue-router'
import Contacts from '../components/Contacts'
import ExportJson from '../components/ExportJson'
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
    {
      path: '/json',
      component: ExportJson
    },
  ]
})

router.beforeEach((to, from, next) => {

  store.dispatch('listen').then(() => next())

})

export default router