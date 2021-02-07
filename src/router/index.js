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
    component: Recommend,
    children: [
      {
        path: ':id',
        component: () => import('components/disc/disc.vue')
      }
    ]
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
    component: () => import('components/singer/singer.vue'),
    children: [
      {
        path: ':id',
        component: () => import('components/singer-detail/singer-detail.vue'),
      }
    ]
  },
]

const router = new VueRouter({
  routes
})
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
export default router
