import store from '../store'
import VueRouter from 'vue-router'
import firebase from '../firebaseInit.js'

import Home from '../components/Home'
import Archive from '../components/Archive'
import Login from '../components/Login'
import SignUp from '../components/SignUp'
import Resorts from '../components/Resorts'
import Resort from '../components/Resort'
import ExportJson from '../components/ExportJson'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      requiresAuth: true,
      requiresResortId: true
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
    name: 'history',
    component: Archive,
    meta: {
      requiresAuth: true,
      requiresResortId: true
    },
    beforeEnter: (to, from, next) => {
      if (!store.state.resortId && store.state.user.superAdmin) return next('/resorts')
      store.dispatch('listenToArchiveList').then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })
    }
  },
  {
    path: '/resorts',
    name: 'resorts',
    component: Resorts,
    meta: {
      requiresAuth: true,
      requiresSuperAdmin: true
    },
    beforeEnter: (to, from, next) => {
      store.dispatch('getResorts').then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })
    }
  },
  {
    path: '/resorts/:resortId',
    name: 'resort',
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
    name: 'login',
    component: Login
  },
  {
    path: '/sign-up/:encodedResortId',
    name: 'sign-up',
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
    if (!firebase.auth().currentUser) {           // why not check for user in store?
      next({
        path: '/login'
      })
    } else {

      store.dispatch('getUserData', firebase.auth().currentUser).then(() => {
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