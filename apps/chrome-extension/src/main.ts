import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

// 引入组件库全局样式资源

const app = createApp(App)
app.use(ElementPlus);
app.mount('#app')