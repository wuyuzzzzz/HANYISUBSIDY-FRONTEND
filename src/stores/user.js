/**
 * 用户状态管理模块（Pinia Store）
 *
 * 管理登录态的核心数据：token 和用户信息。
 * 数据同时持久化到 localStorage，刷新浏览器后仍可保持登录状态。
 * 被 request.js（携带 token）、router（鉴权）、各页面（显示用户名/角色）共同使用。
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  /** JWT 令牌，登录成功后由后端返回，用于后续接口鉴权 */
  const token = ref(localStorage.getItem('token') || '')

  /** 用户完整信息对象，含 username、realName、roleCode、roleName 等 */
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  /** 是否已登录：有 token 即为 true，路由守卫据此判断 */
  const isLoggedIn = computed(() => !!token.value)

  /** 当前用户角色编码：STUDENT / COUNSELOR / ADMIN，用于菜单显示和路由权限 */
  const roleCode = computed(() => userInfo.value?.roleCode || '')

  /**
   * 登录成功后保存 token 和用户信息
   * @param {Object} data - 登录接口返回的完整用户数据（含 token 字段）
   * 调用时机：Login.vue 登录接口成功后
   */
  function setLogin(data) {
    token.value = data.token
    userInfo.value = data
    localStorage.setItem('token', data.token)
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  /**
   * 退出登录，清除内存和本地缓存中的登录数据
   * 调用时机：MainLayout 点击「退出」、request.js 检测到 401/403 时
   */
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, isLoggedIn, roleCode, setLogin, logout }
})
