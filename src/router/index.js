import store from '../store'
import VueRouter from 'vue-router'
import Firebase from '../firebaseInit.js'

import Home from '../components/Home'
import Login from '../components/Login'
import SignUp from '../components/SignUp'
import Resorts from '../components/Resorts'
import Resort from '../components/Resort'
import ExportJson from '../components/ExportJson'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/resorts',
    name: 'resorts',
    component: Resorts
  },
  {
    path: '/resorts/:resortId',
    name: 'resort',
    component: Resort
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

  if (to.name === 'login' || to.name === 'sign-up' || to.params.adminRedirect) {
    store.commit('SET_LOADING_STATE', false)
    return next()
  }

  if (!Firebase.auth().currentUser) {
    return next('/login')
  } else {

    store.dispatch('getUserData', Firebase.auth().currentUser).then(() => {

      if (store.state.user.superAdmin && to.name === 'resorts') {
        store.dispatch('getResorts').then(() => next({ name: 'resorts', params: { adminRedirect: true }}))
      } else {
        if (to.params.resortId) store.commit('SET_RESORT_ID', to.params.resortId)
        store.dispatch('listenToContacts').then(() => next())
      }

    })
  }

})


export default router