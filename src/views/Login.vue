<template>
  <div class="login-page">
    <div class="login-bg">
      <img :src="ASSETS.loginBg" alt="太原理工大学校园雪景" class="bg-img" />
      <div class="bg-overlay"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <div class="login-wrapper">
      <div class="login-brand">
        <img :src="ASSETS.loginBrand" alt="太原理工大学清泽园" class="brand-img" />
        <div class="brand-text">
          <h1>寒衣补助申请系统</h1>
          <p>太原理工大学 · 精准资助服务平台</p>
          <ul class="feature-list">
            <li><el-icon><CircleCheck /></el-icon> 在线申请 · 便捷填报</li>
            <li><el-icon><CircleCheck /></el-icon> 三级审核 · 流程透明</li>
            <li><el-icon><CircleCheck /></el-icon> 全程追踪 · 温暖过冬</li>
          </ul>
        </div>
      </div>

      <div class="login-card">
        <div class="card-header">
          <img :src="ASSETS.logo" alt="太原理工大学校徽" class="login-logo" />
          <h2>欢迎登录</h2>
          <p>请使用学工系统账号登录</p>
        </div>
        <el-form :model="form" @submit.prevent="handleLogin" size="large">
          <el-form-item>
            <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
          </el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" native-type="submit">登 录</el-button>
        </el-form>
        <div class="demo-accounts">
          <p class="demo-title">测试账号（密码均为 123456）</p>
          <div class="demo-tags">
            <el-tag effect="plain" @click="fillAccount('student01')" style="cursor:pointer">学生 student01</el-tag>
            <el-tag type="success" effect="plain" @click="fillAccount('counselor01')" style="cursor:pointer">辅导员 counselor01</el-tag>
            <el-tag type="warning" effect="plain" @click="fillAccount('admin')" style="cursor:pointer">管理员 admin</el-tag>
          </div>
        </div>
        <p class="asset-credit">图片素材来源：太原理工大学官网</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 登录页（Login.vue）
 *
 * 页面用途：系统入口，用户使用学工账号登录后进入对应角色的工作台。
 * 用户流程：打开系统 → 输入用户名和密码（或点击测试账号标签快速填充）
 *          → 点击「登录」→ 验证成功后保存 token → 自动跳转首页。
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api'
import { useUserStore } from '../stores/user'
import { ASSETS } from '../config/assets'

/** 路由实例，登录成功后跳转 /home */
const router = useRouter()
/** 用户状态仓库，登录成功后调用 setLogin 保存 token */
const store = useUserStore()

/** 登录按钮 loading 状态，防止重复提交 */
const loading = ref(false)

/** 登录表单数据：用户名和密码 */
const form = ref({ username: '', password: '123456' })

/**
 * 一键填充测试账号
 * @param {string} username - 测试用户名
 * 调用时机：点击页面底部「学生/辅导员/管理员」测试标签时
 */
function fillAccount(username) {
  form.value.username = username
  form.value.password = '123456'
}

/**
 * 提交登录表单
 * 校验非空 → 调用登录接口 → 保存 token → 跳转首页
 * 调用时机：点击「登录」按钮或表单回车提交时
 */
async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    const data = await login(form.value)
    store.setLogin(data)
    ElMessage.success('登录成功')
    router.push('/home')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; position: relative; overflow: hidden; }
.login-bg { position: fixed; inset: 0; z-index: 0; }
.bg-img { width: 100%; height: 100%; object-fit: cover; }
.bg-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(26, 86, 219, 0.55) 100%);
}
.floating-shapes .shape {
  position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.06);
  animation: float 8s ease-in-out infinite;
}
.shape-1 { width: 300px; height: 300px; top: 10%; left: 5%; }
.shape-2 { width: 200px; height: 200px; bottom: 15%; right: 10%; animation-delay: -3s; }
.shape-3 { width: 150px; height: 150px; top: 50%; left: 40%; animation-delay: -5s; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

.login-wrapper {
  position: relative; z-index: 1; min-height: 100vh;
  display: flex; align-items: center; justify-content: center; gap: 60px; padding: 40px 24px;
}
.login-brand { max-width: 420px; color: #fff; display: none; }
@media (min-width: 992px) { .login-brand { display: block; } }
.brand-img {
  width: 100%; height: 200px; object-fit: cover; border-radius: 16px;
  margin-bottom: 24px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}
.brand-text h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.brand-text p { opacity: 0.85; margin-bottom: 20px; }
.feature-list { list-style: none; padding: 0; }
.feature-list li { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 14px; opacity: 0.9; }

.login-card {
  width: 420px; max-width: 92vw; padding: 36px 32px;
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
  border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.card-header { text-align: center; margin-bottom: 28px; }
.login-logo { width: 72px; height: 72px; margin-bottom: 12px; object-fit: contain; }
.card-header h2 { font-size: 22px; color: #1e293b; margin-bottom: 4px; }
.card-header p { font-size: 13px; color: #94a3b8; }
.login-btn { width: 100%; height: 44px; font-size: 16px; border-radius: 10px; }
.demo-accounts { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
.demo-title { font-size: 12px; color: #94a3b8; margin-bottom: 10px; text-align: center; }
.demo-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.asset-credit { text-align: center; font-size: 11px; color: #cbd5e1; margin-top: 16px; }
</style>
