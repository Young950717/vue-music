import Vue from 'vue'
import VueRouter from 'vue-router'
import Recommend from 'components/recommend/recommend.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    name: 'Recommend',
    component: Recommend
  },
  {
    path: '/rank',
    name: 'Rank',
    component: () => import('components/rank/rank.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('components/search/search.vue')
  },
  {
    path: '/singer',
    name: 'Singer',
    component: () => import('components/singer/singer.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
