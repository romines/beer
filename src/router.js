import store from './store'
import VueRouter from 'vue-router'
import { auth } from './firebaseInit.js'
import { promiseTo } from './store/utils.js'

import Home from './components/Home'
import {
  Archive,
  ExportJson,
  ForgotPassword,
  Login,
  MapManager,
  Resorts,
  Resort,
  SignUp,
} from './components'

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

      Promise.all([
        store.dispatch('listenToResortRoot'),
        store.dispatch('listenToPublishedContacts'),
      ]).then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })
    },
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
        store.dispatch('listenToResortRoot'),
        store.dispatch('listenToPublishedContacts'),
      ]).then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })
    },
  },
  {
    path: '/maps',
    name: 'Maps',
    component: MapManager,
    meta: {
      requiresAuth: true,
      requiresSuperAdmin: true,
    },
    beforeEnter: async (to, from, next) => {
      if (!store.state.resortId) return next('/')
      await store.dispatch('listenToResortRoot')
      next()
    },
  },
  {
    path: '/resorts',
    name: 'Resorts',
    component: Resorts,
    meta: {
      requiresAuth: true,
      requiresSuperAdmin: true,
    },
    beforeEnter: (to, from, next) => {
      store.commit('SET_RESORT_ID', '')
      store.dispatch('getResorts').then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })
    },
  },
  {
    path: '/resorts/:resortId',
    name: 'Resort Home',
    component: Resort,
    meta: {
      requiresAuth: true,
      requiresSuperAdmin: true,
    },
    beforeEnter: (to, from, next) => {
      store
        .dispatch('getResorts')
        .then(() => {
          store.commit('SET_RESORT_ID', to.params.resortId)
          return Promise.all([
            store.dispatch('listenToResortRoot'),
            store.dispatch('listenToPublishedContacts'),
          ])
        })
        .then(() => {
          store.commit('SET_LOADING_STATE', false)
          next()
        })
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/reset',
    name: 'Reset Password',
    component: ForgotPassword,
  },
  {
    path: '/sign-up/:encodedResortId',
    name: 'Sign Up',
    component: SignUp,
    props: true,
  },
  {
    path: '/json',
    component: ExportJson,
    beforeEnter: (to, from, next) => {
      if (!store.state.resortId) return next('/')
      next()
    },
  },
]

const router = new VueRouter({ routes })

router.beforeEach(async (to, from, next) => {
  if (!to.matched.some(record => record.meta.requiresAuth)) {
    // route is open to unauthenticated users
    store.commit('SET_LOADING_STATE', false)
    return next()
  }

  /**
   *
   * routes below require auth
   *
   */

  if (!auth.currentUser) {
    // no Firebase auth user.
    // redirect to login page.
    return next({
      path: '/login',
    })
  }

  if (!store.state.user.authorizedIds) {
    // if no user in state, await user data fetch based on Firebase auth user
    console.log('no user in state . . .')

    const [err] = await promiseTo(store.dispatch('getUserData', auth.currentUser))
    if (err) {
      store.commit('SET_LOADING_STATE', false)
      console.log(err.message)
      return store.dispatch('showErrorModal', err)
    }
  }

  /**
   *
   * check user, route for superAdmin privileges
   *
   */

  if (store.state.user.superAdmin || !to.matched.some(record => record.meta.requiresSuperAdmin)) {
    // this is a superAdmin or route does NOT require superAdmin.
    // send user on their way
    next()
  } else {
    // non superAdmin trying to access route requiring superAdmin
    // redirect home
    next('/')
  }
})

export default router
