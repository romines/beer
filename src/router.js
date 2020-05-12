import store from './store'
import VueRouter from 'vue-router'
import { auth } from './firebaseInit.js'
import { promiseTo } from './store/utils.js'

import PushNotifications from './components/PushNotifications'
import WebcamManager from './components/WebcamManager'
import Profile from './components/Profile'
import Settings from './components/Settings'
import UserManager from './components/settings/UserManager'
import ResortManager from './components/settings/ResortManager'
import PushSettings from './components/settings/PushSettings'

import {
  Archive,
  ExportJson,
  ForgotPassword,
  Login,
  Maps,
  Tags,
  Resorts,
  Resort,
  SignUp
} from './components'

const routes = [
  {
    path: '/contacts',
    name: 'Resort',
    component: Resort,
    meta: {
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      if (!store.state.resortId && store.getters.currentUser.superAdmin) return next('/resorts')
      if (!store.getters.currentUser.canAccessContacts()) return next('/')
      if (!store.getters.resortPermissions.canManageContacts) return next('/')

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
      if (!store.state.resortId && store.getters.currentUser.superAdmin) return next('/resorts')

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
      if (!store.state.resortId && store.getters.currentUser.superAdmin) return next('/resorts')
      if (!store.getters.currentUser.canAccessWebcams()) return next('/')
      if (!store.getters.resortPermissions.canManageWebcams) return next('/')

      store.dispatch('getResortWebcams').then(() => {
        store.commit('SET_LOADING_STATE', false)
        next()
      })
    }
  },
  {
    path: '/',
    name: 'PushNotifications',
    component: PushNotifications,
    meta: {
      requiresAuth: true
    },
    beforeEnter: (to, from, next) => {
      if (!store.state.resortId && store.getters.currentUser.superAdmin) return next('/resorts')

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
      if (!store.state.resortId && store.getters.currentUser.superAdmin) return next('/resorts')
      if (!store.getters.currentUser.canAccessSettings()) return next('/')

      store.commit('SET_LOADING_STATE', false)
      store.dispatch('initializePushWooshData').then(() => {
        next()
      })
    },
    children: [
      {
        path: 'push',
        name: 'PushSettings',
        component: PushSettings
      },
      {
        path: 'users',
        name: 'UserManager',
        component: UserManager,
        meta: {
          requiresAuth: true
        },
        beforeEnter: (to, from, next) => {
          if (!store.state.resortId && store.getters.currentUser.superAdmin) return next('/resorts')
          if (!store.getters.currentUser.superAdmin && !store.getters.currentUser.isResortAdmin) return next('/')

          store.commit('SET_LOADING_STATE', false)
          next()
        }
      },
      {
        path: 'resorts',
        name: 'ResortManager',
        component: ResortManager,
        meta: {
          requiresAuth: true
        },
        beforeEnter: (to, from, next) => {
          if (!store.state.resortId && store.getters.currentUser.superAdmin) return next('/resorts')
          if (!store.getters.currentUser.superAdmin) return next('/')

          store.commit('SET_LOADING_STATE', false)
          next()
        }
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      requiresAuth: true
    },
    beforeEnter: (to, from, next) => {
      store.commit('SET_LOADING_STATE', false)
      next()
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


  if (!store.getters.currentUser) {
    // if no user in state, await user data fetch based on Firebase auth user
    console.log('no user in state . . .')

    const [err] = await promiseTo(store.dispatch('setCurrentUser', auth.currentUser))
    if (err) {
      store.commit('SET_LOADING_STATE', false)
      console.log(err.message)
      return store.dispatch('showErrorModal', err)
    }
  }

  // Get resort permissions every time
  store.dispatch('getResortPermissions')

  /**
   *
   * check user, route for superAdmin privileges
   *
   */
  if (store.getters.currentUser.superAdmin || !to.matched.some(record => record.meta.requiresSuperAdmin)) {
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
