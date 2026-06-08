<template>
  <div class="page-container">
    <PageBanner title="公示名单" desc="脱敏公示，保护学生隐私" icon="Bell"
      :bg="ASSETS.publicityBanner" />
    <GlassCard title="公示名单（脱敏）">
      <el-alert title="公示期内名单仅显示学号、学院及物资类型，已隐去个人敏感隐私信息"
        type="info" show-icon :closable="false" style="margin-bottom:16px" />
      <el-table :data="list" stripe>
        <el-table-column prop="studentNo" label="学号" />
        <el-table-column prop="college" label="学院" />
        <el-table-column prop="povertyLevel" label="困难等级" />
        <el-table-column prop="itemType" label="物资类型" />
      </el-table>
      <el-empty v-if="!list.length" description="当前无公示名单" />
    </GlassCard>
  </div>
</template>

<script setup>
/**
 * 公示名单页（Publicity.vue）
 *
 * 页面用途：公开展示通过审核、进入公示期的受助学生名单（已脱敏处理）。
 * 用户流程：任意登录用户点击「公示名单」菜单 → 查看当前批次公示学生
 *          → 仅显示学号、学院、困难等级和物资类型，不暴露个人隐私。
 */
import { ref, onMounted } from 'vue'
import { getPublicity, getOpenBatch } from '../api'
import PageBanner from '../components/PageBanner.vue'
import GlassCard from '../components/GlassCard.vue'
import { ASSETS } from '../config/assets'

/** 公示名单数据数组，每项含学号、学院、困难等级、物资类型等脱敏字段 */
const list = ref([])

/**
 * 页面挂载后：先获取当前开放批次，再按批次 ID 拉取公示名单
 */
onMounted(async () => {
  const batch = await getOpenBatch()
  if (batch) list.value = await getPublicity(batch.batchId)
})
</script>
