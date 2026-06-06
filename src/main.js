/**
 * 前端应用入口文件
 *
 * 负责创建 Vue 应用实例并完成全局插件注册，启动顺序：
 * 1. 创建 App 根实例
 * 2. 全局注册 Element Plus 图标组件
 * 3. 挂载 Pinia 状态管理
 * 4. 挂载 Vue Router 路由
 * 5. 挂载 Element Plus UI 库（中文语言包）
 * 6. 将应用挂载到 index.html 的 #app 节点
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './style.css'

/** 创建 Vue 应用根实例，App.vue 为顶层组件 */
const app = createApp(App)

/** 全局注册所有 Element Plus 图标，模板中可直接写 <el-icon><User /></el-icon> */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

/** 注册 Pinia，使各组件可通过 useUserStore() 访问全局状态 */
app.use(createPinia())

/** 注册路由，使 <router-view> 和 useRouter() 生效 */
app.use(router)

/** 注册 Element Plus 组件库，locale 设为中文 */
app.use(ElementPlus, { locale: zhCn })

/** 将应用渲染到页面 DOM 节点，至此前端启动完成 */
app.mount('#app')
