/**
 * 前端路由配置模块
 *
 * 职责：
 * 1. 定义所有页面路径与组件的映射关系
 * 2. 通过 meta.roles 标记需要特定角色才能访问的页面
 * 3. 全局前置守卫：未登录跳转登录页，角色不匹配跳转首页
 *
 * 角色说明：STUDENT（学生）、COUNSELOR（辅导员）、ADMIN（管理员）
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

/** 路由表：登录页独立，其余页面嵌套在 MainLayout 主布局下 */
const routes = [
  // 登录页，无需鉴权
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),  // 带顶栏和侧边栏的公共布局
    redirect: '/home',  // 访问根路径时默认跳转首页
    children: [
      // ---------- 所有角色均可访问 ----------
      { path: 'home', name: 'Home', component: () => import('../views/Home.vue') },
      { path: 'publicity', name: 'Publicity', component: () => import('../views/Publicity.vue') },

      // ---------- 学生专属页面 ----------
      { path: 'profile', name: 'Profile', component: () => import('../views/student/Profile.vue'), meta: { roles: ['STUDENT'] } },
      { path: 'apply', name: 'Apply', component: () => import('../views/student/Apply.vue'), meta: { roles: ['STUDENT'] } },
      { path: 'progress', name: 'Progress', component: () => import('../views/student/Progress.vue'), meta: { roles: ['STUDENT'] } },

      // ---------- 辅导员专属页面 ----------
      { path: 'counselor', name: 'Counselor', component: () => import('../views/counselor/Workbench.vue'), meta: { roles: ['COUNSELOR'] } },

      // ---------- 管理员专属页面 ----------
      { path: 'admin', name: 'Admin', component: () => import('../views/admin/Dashboard.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'admin/batch', name: 'AdminBatch', component: () => import('../views/admin/BatchManage.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'admin/audit', name: 'AdminAudit', component: () => import('../views/admin/AuditManage.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'admin/stats', name: 'AdminStats', component: () => import('../views/admin/Statistics.vue'), meta: { roles: ['ADMIN'] } }
    ]
  }
]

/** 创建路由实例，使用 HTML5 History 模式（地址栏无 # 号） */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 全局前置路由守卫
 * 每次路由跳转前执行，按以下顺序判断：
 * 1. 目标为登录页 → 直接放行
 * 2. 未登录 → 强制跳转 /login
 * 3. 目标页有 roles 限制且当前用户角色不在其中 → 跳转 /home
 * 4. 其余情况 → 放行
 */
router.beforeEach((to, from, next) => {
  const store = useUserStore()

  // 登录页始终可访问
  if (to.path === '/login') {
    next()
    return
  }

  // 无 token 视为未登录
  if (!store.isLoggedIn) {
    next('/login')
    return
  }

  // 角色权限校验：meta.roles 中不包含当前用户角色则拒绝访问
  if (to.meta.roles && !to.meta.roles.includes(store.roleCode)) {
    next('/home')
    return
  }

  next()
})

export default router
