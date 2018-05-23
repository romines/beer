import store from '../store'
import VueRouter from 'vue-router'
import Firebase from '../firebaseInit.js'

import Home from '../components/Home'
import Login from '../components/Login'
import SignUp from '../components/SignUp'
import ExportJson from '../components/ExportJson'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
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


export default router