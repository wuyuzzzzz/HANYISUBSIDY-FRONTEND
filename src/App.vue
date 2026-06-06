<template>
  <router-view />
</template>

<script setup>
/**
 * 应用根组件（App.vue）
 *
 * 页面用途：Vue 应用的顶层入口，本身不包含具体业务 UI。
 * 用户流程：用户访问任意 URL → 路由匹配对应页面组件 → 通过下方 router-view 动态渲染。
 * 登录页直接渲染 Login.vue；其余页面先渲染 MainLayout 布局，再在布局内渲染子页面。
 */
</script>
