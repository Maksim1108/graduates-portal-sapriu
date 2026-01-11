import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Auth from '@/views/Auth.vue'
import Account from '@/views/Account.vue'
import Admin from '@/views/Admin.vue'
import Gallery from '@/views/Gallery.vue'
import News from '@/views/News.vue'
import Partners from '@/views/Partners.vue'
import Search from '@/views/Search.vue'
import Surveys from '@/views/Surveys.vue'
import SurveyTake from '@/views/SurveyTake.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/account',
    name: 'Account',
    component: Account,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: Gallery
  },
  {
    path: '/news',
    name: 'News',
    component: News
  },
  {
    path: '/partners',
    name: 'Partners',
    component: Partners
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/surveys',
    name: 'Surveys',
    component: Surveys
  },
  {
    path: '/surveys/:id',
    name: 'SurveyTake',
    component: SurveyTake
  },
  {
    path: '/politic',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory('/graduate/'),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('user_id')
  const isAdmin = localStorage.getItem('role') === 'admin'
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth')
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router 