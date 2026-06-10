<template>
  <div class="page-container">
    <PageBanner title="数据报表" desc="申请进度、尺码矩阵与完成率统计" icon="PieChart"
      :bg="ASSETS.adminStats" />
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :xs="12" :sm="6" v-for="item in statCards" :key="item.label">
        <div class="stat-card">
          <div class="icon-wrap"><el-icon :size="22"><component :is="item.icon" /></el-icon></div>
          <div class="value">{{ item.value }}</div>
          <div class="label">{{ item.label }}</div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="12">
        <GlassCard title="尺码统计矩阵（订货表）">
          <el-table :data="matrix" stripe size="small">
            <el-table-column prop="itemType" label="物资" />
            <el-table-column prop="clothStyle" label="款式" />
            <el-table-column prop="clothSize" label="尺码" />
            <el-table-column prop="clothColor" label="颜色" />
            <el-table-column prop="count" label="数量" />
          </el-table>
          <el-empty v-if="!matrix.length" description="暂无终审通过数据" />
        </GlassCard>
      </el-col>
      <el-col :span="12">
        <GlassCard title="贫困等级分布">
          <el-table :data="levelData" stripe size="small">
            <el-table-column prop="level" label="困难等级" />
            <el-table-column prop="count" label="申请人数" />
          </el-table>
          <el-empty v-if="!levelData.length" description="暂无数据" />
        </GlassCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
/**
 * 管理员数据报表页（Statistics.vue）
 *
 * 页面用途：汇总展示当前批次的申请统计数据、尺码订货矩阵和贫困等级分布。
 * 用户流程：进入数据报表 → 查看顶部四项核心指标（总申请、通过数、签收数、完成率）
 *          → 左侧查看尺码统计矩阵（用于采购订货）→ 右侧查看各困难等级申请人数分布。
 */
import { ref, computed, onMounted } from 'vue'
import { getStatistics, getSizeMatrix, getOpenBatch } from '../../api'
import PageBanner from '../../components/PageBanner.vue'
import GlassCard from '../../components/GlassCard.vue'
import { ASSETS } from '../../config/assets'

/** 统计数据对象，含总申请数、通过数、签收数、完成率、按贫困等级分组等 */
const stats = ref({})

/** 尺码统计矩阵数组，每项含物资类型、款式、尺码、颜色及对应数量 */
const matrix = ref([])

/** 顶部四个统计卡片数据，从 stats 计算并附带图标名 */
const statCards = computed(() => [
  { label: '总申请数', value: stats.value.totalApplications || 0, icon: 'Document' },
  { label: '终审通过', value: stats.value.approvedCount || 0, icon: 'CircleCheck' },
  { label: '已签收', value: stats.value.receivedCount || 0, icon: 'Box' },
  { label: '完成率', value: (stats.value.completionRate || 0).toFixed(1) + '%', icon: 'TrendCharts' }
])

/** 贫困等级分布表格数据，将 stats.byPovertyLevel 对象转为 { level, count } 数组 */
const levelData = computed(() => {
  const byLevel = stats.value.byPovertyLevel || {}
  return Object.entries(byLevel).map(([level, count]) => ({ level, count }))
})

/**
 * 页面挂载后：获取当前批次，并行拉取统计数据和尺码矩阵
 */
onMounted(async () => {
  const batch = await getOpenBatch()
  if (batch) {
    stats.value = await getStatistics(batch.batchId)
    matrix.value = await getSizeMatrix(batch.batchId)
  }
})
</script>
