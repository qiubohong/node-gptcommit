import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next';
import './style.css'
import App from './App.vue'

// 引入组件库全局样式资源

const app = createApp(App)
app.use(TDesign);
app.mount('#app')