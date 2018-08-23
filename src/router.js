import store from './store'
import VueRouter from 'vue-router'
import { auth } from './firebaseInit.js'

import Home from './components/Home'
import Archive from './components/Archive'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Resorts from './components/Resorts'
import Resort from './components/Resort'
import ExportJson from './components/ExportJson'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      if (store.state.user.superAdmin) return next('/resorts')

      store.dispatch('listenToContacts').then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })

    }
  },
  {
    path: '/history',
    name: 'History',
    component: Archive,
    meta: {
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      if (!store.state.resortId && store.state.user.superAdmin) return next('/resorts')
      Promise.all([
        store.dispatch('listenToArchiveList'),
        store.dispatch('listenToContacts'),
        store.dispatch('listenToPublishedContacts')
      ]).then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })
    }
  },
  {
    path: '/resorts',
    name: 'Resorts',
    component: Resorts,
    meta: {
      requiresAuth: true,
      requiresSuperAdmin: true
    },
    beforeEnter: (to, from, next) => {
      store.commit('SET_RESORT_ID', '')
      store.dispatch('getResorts').then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })
    }
  },
  {
    path: '/resorts/:resortId',
    name: 'Resort Home',
    component: Resort,
    meta: {
      requiresAuth: true,
      requiresSuperAdmin: true
    },
    beforeEnter: (to, from, next) => {
      store.dispatch('getResorts')
        .then(() => {
          store.commit('SET_RESORT_ID', to.params.resortId)
          return store.dispatch('listenToContacts')
        })
        .then(() => {
          store.commit('SET_LOADING_STATE', false)
          next()
        })
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/sign-up/:encodedResortId',
    name: 'Sign-up',
    component: SignUp,
    props: true
  },
  {
    path: '/json',
    component: ExportJson
  },
]

const router = new VueRouter({ routes })

router.beforeEach((to, from, next) => {

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // route requires auth, check if logged in
    // if not, redirect to login page.
    if (!auth.currentUser) {           // why not check for user in store?
      next({
        path: '/login'
      })
    } else {

      store.dispatch('getUserData', auth.currentUser).then(() => {
        if (to.matched.some(record => record.meta.requiresSuperAdmin)) {
          // route requires superAdmin. check vuex state
          // user, redirect if not superAdmin
          if (store.state.user.superAdmin) {
            next()
          } else {
            next('/')
          }
        } else {
          // must be authenticated, can be regular user
          next()
        }
      })

    }
  } else {
    // routes open to unauthenticated users
    store.commit('SET_LOADING_STATE', false)
    next()
  }


})


export default router