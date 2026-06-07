<template>
  <div class="page-banner" :style="{ backgroundImage: `url(${bg || ASSETS.defaultBanner})` }">
    <div class="banner-overlay"></div>
    <div class="banner-content">
      <div class="banner-icon" v-if="icon">
        <el-icon :size="28"><component :is="icon" /></el-icon>
      </div>
      <div>
        <h2 class="banner-title">{{ title }}</h2>
        <p class="banner-desc" v-if="desc">{{ desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 页面顶部横幅组件（PageBanner.vue）
 *
 * 页面用途：各业务页面顶部的视觉横幅，展示页面标题、副标题和校园背景图。
 * 用户流程：进入任意子页面 → 首先看到蓝色渐变遮罩下的横幅 → 快速了解当前页面功能。
 */
import { ASSETS } from '../config/assets'

defineProps({
  /** 横幅主标题，必填，如「寒衣补助申请」 */
  title: { type: String, required: true },
  /** 横幅副标题/描述文字，可选 */
  desc: { type: String, default: '' },
  /** Element Plus 图标名称，显示在标题左侧，如 'User'、'Clock' */
  icon: { type: String, default: '' },
  /** 自定义背景图 URL，为空时使用 ASSETS.defaultBanner */
  bg: { type: String, default: '' }
})
</script>

<style scoped>
.page-banner {
  position: relative; height: 140px; border-radius: 16px;
  background-size: cover; background-position: center; overflow: hidden; margin-bottom: 20px;
}
.banner-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(26, 86, 219, 0.88) 0%, rgba(59, 130, 246, 0.75) 50%, rgba(96, 165, 250, 0.6) 100%);
}
.banner-content {
  position: relative; z-index: 1; height: 100%;
  display: flex; align-items: center; gap: 16px; padding: 0 28px; color: #fff;
}
.banner-icon {
  width: 52px; height: 52px; border-radius: 14px;
  background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.banner-title { font-size: 22px; font-weight: 700; margin: 0; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); }
.banner-desc { font-size: 13px; opacity: 0.9; margin: 4px 0 0; }
@media (max-width: 768px) {
  .page-banner { height: 110px; }
  .banner-title { font-size: 18px; }
  .banner-content { padding: 0 16px; }
}
</style>
