import Contacts from '../components/Contacts'
import Login from '../components/Login'
import SignUp from '../components/SignUp'
import ExportJson from '../components/ExportJson'

const routes = [
  {
    path: '/',
    name: 'contacts',
    component: Contacts
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: SignUp
  },
  // TODO: make '/' an alias of '/contacts'
  // { path: '/contacts', component: Contacts },
  {
    path: '/json',
    component: ExportJson
  },
]


export default routes