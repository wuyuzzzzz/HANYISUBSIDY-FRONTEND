/**
 * Axios 请求封装模块
 *
 * 本文件是整个前端与后端通信的「统一出口」：
 * - 所有 API 调用都通过这里创建的 axios 实例发出
 * - 自动在请求头携带登录 token，无需每个接口单独处理
 * - 统一解析后端返回的 { code, message, data } 格式
 * - 遇到 401/403 时自动退出登录并跳转登录页
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import router from '../router'

/** 创建 axios 实例，配置基础地址和超时时间 */
const request = axios.create({
  baseURL: '/api',   // 开发环境由 Vite 代理转发到后端 Spring Boot 服务
  timeout: 15000     // 15 秒超时，避免请求长时间无响应
})

/**
 * 请求拦截器
 * 在每次请求发出前执行：若用户已登录，将 token 写入 Authorization 请求头
 */
request.interceptors.request.use(config => {
  const store = useUserStore()
  if (store.token) {
    // Bearer 是 JWT 常用的认证方式，后端据此识别当前用户
    config.headers.Authorization = `Bearer ${store.token}`
  }
  return config
})

/**
 * 响应拦截器
 * 成功时：校验业务 code，非 200 则弹错并 reject
 * 失败时：处理网络错误和鉴权失效（401/403）
 */
request.interceptors.response.use(
  res => {
    const data = res.data
    // 后端约定：code === 200 表示业务成功
    if (data.code !== 200) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    // 直接返回 data 字段，调用方拿到的就是业务数据，不用再写 res.data.data
    return data.data
  },
  err => {
    const msg = err.response?.data?.message || err.message || '网络错误'
    // token 过期、无效或无权限访问时，清除登录态并跳转登录页
    if (err.response?.status === 401 || err.response?.status === 403) {
      const store = useUserStore()
      // 避免已在登录页时重复跳转
      if (store.token && router.currentRoute.value.path !== '/login') {
        store.logout()
        router.push('/login')
      }
    }
    ElMessage.error(msg)
    return Promise.reject(err)
  }
)

export default request
