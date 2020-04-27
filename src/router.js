import store from './store'
import VueRouter from 'vue-router'
import { auth } from './firebaseInit.js'
import { promiseTo } from './store/utils.js'

import PushNotifications from './components/PushNotifications'
import WebcamManager from './components/WebcamManager'
import Settings from './components/Settings'
import {
  Archive,
  ExportJson,
  ForgotPassword,
  Login,
  Maps,
  Tags,
  Resorts,
  Resort,
  SignUp,
} from './components'

const routes = [
  {
    path: '/',
    name: 'Resort',
    component: Resort,
    meta: {
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      if (!store.state.resortId && store.state.user.superAdmin) return next('/resorts')

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
    component: Maps,
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
    path: '/tags',
    name: 'Tags',
    component: Tags,
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
      store.commit('SET_LOADING_STATE', true)
      store.dispatch('resetResortState')
      store.dispatch('getResorts').then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })
    },
  },
  {
    path: '/webcam-manager',
    name: 'WebcamManager',
    component: WebcamManager,
    meta: {
      requiresAuth: true
    },
    beforeEnter: (to, from, next) => {
      if (!store.state.resortId && store.state.user.superAdmin) return next('/resorts')

      store.dispatch('getResortWebcams').then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })
    }
  },
  {
    path: '/push-notifications',
    name: 'PushNotifications',
    component: PushNotifications,
    meta: {
      requiresAuth: true
    },
    beforeEnter: (to, from, next) => {
      if (!store.state.resortId && store.state.user.superAdmin) return next('/resorts')

      store.commit('SET_LOADING_STATE', false)
      store.dispatch('initializePushWooshData').then(() => {
        next()
      })
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      requiresAuth: true
    },
    beforeEnter: (to, from, next) => {
      if (!store.state.resortId && store.state.user.superAdmin) return next('/resorts')

      store.commit('SET_LOADING_STATE', false)
      store.dispatch('initializePushWooshData').then(() => {
        next()
      })
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      blockedForUsers: true,
    }
  },
  {
    path: '/reset',
    name: 'Reset Password',
    component: ForgotPassword,
    meta: {
      blockedForUsers: true,
    }
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

const router = new VueRouter({ mode: 'history', routes })

router.beforeEach(async (to, from, next) => {

  if (to.matched.some(record => record.meta.blockedForUsers) && auth.currentUser) {
    // Route is off-limits to logged-in users
    // Return them to previous route or root page
    let path = from.path ? from.path : '/'

    return next({
      path: path,
    })
  }

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

    const [err] = await promiseTo(store.dispatch('setCurrentUser', auth.currentUser))
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
    console.log("Need superAdmin priviledges...")
    next('/')
  }
})

export default router
