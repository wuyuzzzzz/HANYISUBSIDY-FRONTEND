<template>
  <div class="glass-card">
    <div class="card-header" v-if="title || $slots.extra">
      <div class="card-title-wrap">
        <span class="title-bar"></span>
        <h3 class="card-title">{{ title }}</h3>
      </div>
      <slot name="extra"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
/**
 * 毛玻璃风格卡片组件（GlassCard.vue）
 *
 * 页面用途：各业务页面的通用内容容器，提供统一的白色半透明卡片样式。
 * 用户流程：进入任意业务页面 → 看到带标题栏的卡片区域 → 卡片内展示表单、表格等具体内容。
 * 支持通过 title 属性显示标题，通过 extra 插槽在标题右侧放置操作按钮。
 */
defineProps({
  /** 卡片顶部标题文字，为空时不显示标题栏 */
  title: { type: String, default: '' }
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 4px 24px rgba(26, 86, 219, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.card-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title-bar {
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #1a56db, #60a5fa);
  border-radius: 2px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
</style>
