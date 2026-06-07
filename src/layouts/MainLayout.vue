<template>
  <el-container class="layout">
    <el-header class="header">
      <div class="header-left">
        <img :src="ASSETS.logo" alt="太原理工大学" class="header-logo" />
        <div>
          <span class="title">寒衣补助申请系统</span>
          <span class="subtitle">太原理工大学 · 精准资助</span>
        </div>
      </div>
      <div class="header-right">
        <el-avatar :size="32" class="user-avatar">{{ avatarText }}</el-avatar>
        <span class="user-name">{{ store.userInfo?.realName || store.userInfo?.username }}</span>
        <el-tag size="small" effect="dark" round>{{ store.userInfo?.roleName }}</el-tag>
        <el-button round size="small" @click="handleLogout">退出</el-button>
      </div>
    </el-header>
    <el-container class="body-container">
      <el-aside :width="isMobile ? '0' : '220px'" class="aside" v-show="!isMobile">
        <div class="aside-banner">
          <img :src="ASSETS.asideBanner" alt="太原理工大学校园" />
          <div class="aside-banner-text">温暖过冬<br/>精准资助</div>
        </div>
        <el-menu :default-active="route.path" router class="side-menu">
          <el-menu-item index="/home"><el-icon><HomeFilled /></el-icon><span>首页</span></el-menu-item>
          <template v-if="store.roleCode === 'STUDENT'">
            <el-menu-item index="/profile"><el-icon><User /></el-icon><span>个人中心</span></el-menu-item>
            <el-menu-item index="/apply"><el-icon><EditPen /></el-icon><span>寒衣申请</span></el-menu-item>
            <el-menu-item index="/progress"><el-icon><Clock /></el-icon><span>进度查询</span></el-menu-item>
          </template>
          <template v-if="store.roleCode === 'COUNSELOR'">
            <el-menu-item index="/counselor"><el-icon><Checked /></el-icon><span>审批工作台</span></el-menu-item>
          </template>
          <template v-if="store.roleCode === 'ADMIN'">
            <el-menu-item index="/admin"><el-icon><DataBoard /></el-icon><span>管理首页</span></el-menu-item>
            <el-menu-item index="/admin/batch"><el-icon><Calendar /></el-icon><span>批次管理</span></el-menu-item>
            <el-menu-item index="/admin/audit"><el-icon><Document /></el-icon><span>终审管理</span></el-menu-item>
            <el-menu-item index="/admin/stats"><el-icon><PieChart /></el-icon><span>数据报表</span></el-menu-item>
          </template>
          <el-menu-item index="/publicity"><el-icon><Bell /></el-icon><span>公示名单</span></el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main" :style="{ backgroundImage: `url(${ASSETS.mainBg})` }">
        <div v-if="isMobile" class="mobile-nav">
          <el-button v-for="item in mobileMenus" :key="item.path" size="small" round
            :type="route.path === item.path ? 'primary' : 'default'"
            @click="router.push(item.path)">{{ item.label }}</el-button>
        </div>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
/**
 * 主布局组件（MainLayout.vue）
 *
 * 页面用途：登录后所有业务页面的公共外壳，包含顶栏、侧边导航和主内容区。
 * 用户流程：登录成功进入系统 → 看到顶栏（校名、用户信息、退出按钮）
 *          → 左侧菜单按角色显示不同入口 → 右侧主区域通过 router-view 渲染子页面。
 *          小屏设备隐藏侧边栏，改为顶部横向快捷按钮导航。
 */
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ASSETS } from '../config/assets'

/** 用户状态仓库，读取登录信息和角色，控制菜单显示 */
const store = useUserStore()
/** 当前路由对象，用于高亮侧边栏当前菜单项 */
const route = useRoute()
/** 路由实例，用于编程式跳转（退出登录、移动端导航） */
const router = useRouter()

/** 是否为移动端视口（宽度 < 768px），控制侧边栏显隐和移动端导航条 */
const isMobile = ref(window.innerWidth < 768)

/** 头像内显示的文字：取用户姓名或用户名的第一个字符 */
const avatarText = computed(() => {
  const name = store.userInfo?.realName || store.userInfo?.username || '?'
  return name.charAt(0)
})

/** 移动端顶部快捷导航按钮列表，根据角色动态组装路径和标签 */
const mobileMenus = computed(() => {
  const base = [{ path: '/home', label: '首页' }]
  if (store.roleCode === 'STUDENT') {
    base.push({ path: '/apply', label: '申请' }, { path: '/progress', label: '进度' })
  } else if (store.roleCode === 'COUNSELOR') {
    base.push({ path: '/counselor', label: '审批' })
  } else if (store.roleCode === 'ADMIN') {
    base.push({ path: '/admin', label: '管理' }, { path: '/admin/audit', label: '终审' })
  }
  base.push({ path: '/publicity', label: '公示' })
  return base
})

/** 窗口尺寸变化时更新 isMobile，供响应式布局使用；由 resize 事件触发 */
function onResize() { isMobile.value = window.innerWidth < 768 }

/**
 * 组件挂载后：监听窗口 resize 事件，实现响应式布局切换
 */
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

/** 退出登录：清除 token 并跳转登录页；顶栏「退出」按钮点击时调用 */
function handleLogout() {
  store.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { min-height: 100vh; }
.header {
  background: linear-gradient(90deg, #1e3a8a 0%, #1a56db 50%, #3b82f6 100%);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; height: 60px; box-shadow: 0 2px 12px rgba(26, 86, 219, 0.3);
}
.header-left { display: flex; align-items: center; gap: 12px; }
.header-logo { width: 40px; height: 40px; object-fit: contain; background: #fff; border-radius: 8px; padding: 2px; }
.title { color: #fff; font-size: 17px; font-weight: 700; display: block; line-height: 1.2; }
.subtitle { color: rgba(255,255,255,0.7); font-size: 11px; }
.header-right { display: flex; align-items: center; gap: 10px; }
.user-avatar { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #fff; font-weight: 600; }
.user-name { color: #fff; font-size: 14px; }
.body-container { min-height: calc(100vh - 60px); }
.aside {
  background: rgba(255, 255, 255, 0.95);
  border-right: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
}
.aside-banner { position: relative; height: 100px; overflow: hidden; }
.aside-banner img { width: 100%; height: 100%; object-fit: cover; }
.aside-banner-text {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(26, 86, 219, 0.7), rgba(59, 130, 246, 0.5));
  color: #fff; font-size: 14px; font-weight: 600; text-align: center; line-height: 1.6;
}
.side-menu { border-right: none; padding: 8px 0; }
.main {
  background: transparent; padding: 0; position: relative;
  background-size: cover; background-attachment: fixed; background-position: center;
}
.main::before {
  content: ''; position: fixed; inset: 60px 0 0 220px;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.92) 0%, rgba(240, 249, 255, 0.88) 100%);
  pointer-events: none; z-index: 0;
}
.main > * { position: relative; z-index: 1; }
.mobile-nav {
  display: flex; gap: 6px; padding: 10px 12px;
  background: rgba(255, 255, 255, 0.9); overflow-x: auto; border-bottom: 1px solid #e4e7ed;
}
@media (max-width: 768px) { .main::before { inset: 60px 0 0 0; } }
</style>
