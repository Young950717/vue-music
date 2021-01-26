import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'babel-polyfill'
import fastclick from 'fastclick'
import VueLazyload from 'vue-lazyload'

Vue.config.productionTip = false

Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})
fastclick.attach(document.body)

import 'common/stylus/index.styl'
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
