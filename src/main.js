import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './plugins/ant-design-vue';
import './styles/index.less';

// 引入全局样式
import 'ant-design-vue/dist/antd.less';

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app'); 