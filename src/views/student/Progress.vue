<template>
  <div class="page-container">
    <PageBanner title="申请进度" desc="全流程节点追踪，实时掌握审批状态" icon="Clock"
      :bg="ASSETS.progressBanner" />
    <GlassCard v-if="appData?.application" title="进度详情">
      <el-descriptions :column="1" border size="small" style="margin-bottom:20px">
        <el-descriptions-item label="物资类型">{{ appData.application.itemType }}</el-descriptions-item>
        <el-descriptions-item label="款式尺码" v-if="appData.application.itemType === '寒衣'">
          {{ appData.application.clothStyle }} / {{ appData.application.clothSize }} / {{ appData.application.clothColor }}
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="statusTagType" effect="dark" round>{{ statusLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="驳回原因" v-if="appData.application.rejectReason">
          <span style="color:#ef4444">{{ appData.application.rejectReason }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-timeline>
        <el-timeline-item v-for="node in appData.timeline" :key="node.status"
          :type="node.active ? 'primary' : (node.done ? 'success' : 'info')"
          :hollow="!node.done && !node.active" :timestamp="node.label">
          <span v-if="node.rejectReason" class="timeline-reject">驳回原因：{{ node.rejectReason }}</span>
        </el-timeline-item>
      </el-timeline>

      <div v-if="appData.application.auditStatus === 'DISTRIBUTING'" class="receive-section">
        <el-divider />
        <h4 class="section-title">签收确认</h4>
        <el-input v-model="feedback" type="textarea" :rows="3" placeholder="可选：填写匿名反馈或致谢" />
        <el-button type="primary" round style="margin-top:12px" @click="handleReceive">确认已收到</el-button>
      </div>
    </GlassCard>
    <GlassCard v-else title="进度详情">
      <el-empty description="暂无申请记录">
        <el-button type="primary" round @click="$router.push('/apply')">去申请</el-button>
      </el-empty>
    </GlassCard>
  </div>
</template>

<script setup>
/**
 * 学生申请进度页（Progress.vue）
 *
 * 页面用途：以时间轴形式展示寒衣申请的全流程审批节点和当前状态。
 * 用户流程：进入进度页 → 查看物资信息和当前审核状态 → 沿时间轴了解各节点进展
 *          → 若状态为「物资发放中」，可填写反馈并点击「确认已收到」完成签收
 *          → 无申请记录时引导跳转申请页。
 */
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOpenBatch, getMyApplication, confirmReceive } from '../../api'
import PageBanner from '../../components/PageBanner.vue'
import GlassCard from '../../components/GlassCard.vue'
import { ASSETS } from '../../config/assets'

/** 申请详情数据，含 application（申请信息）和 timeline（时间轴节点数组） */
const appData = ref(null)

/** 签收时的可选匿名反馈/致谢文字 */
const feedback = ref('')

/** 审核状态码到中文标签的映射表 */
const statusMap = {
  DRAFT: '草稿', SUBMITTED: '已提交', COUNSELOR_REVIEW: '辅导员初审中',
  COLLEGE_REVIEW: '学院复审中', PUBLICITY: '公示中', FINAL_APPROVED: '终审通过',
  DISTRIBUTING: '物资发放中', RECEIVED: '已签收', REJECTED_MODIFY: '驳回修改', REJECTED: '拒绝申请'
}

/** 当前申请状态的中文显示文字 */
const statusLabel = computed(() => statusMap[appData.value?.application?.auditStatus] || '')

/** 状态标签颜色：签收成功绿色、驳回红色、发放中黄色、其余蓝色 */
const statusTagType = computed(() => {
  const s = appData.value?.application?.auditStatus
  if (s === 'RECEIVED') return 'success'
  if (s === 'REJECTED' || s === 'REJECTED_MODIFY') return 'danger'
  if (s === 'DISTRIBUTING') return 'warning'
  return 'primary'
})

/**
 * 确认签收物资
 * 调用签收接口后刷新申请数据，更新状态为「已签收」
 * 调用时机：状态为 DISTRIBUTING 时点击「确认已收到」按钮
 */
async function handleReceive() {
  await confirmReceive(appData.value.application.appId, feedback.value)
  ElMessage.success('签收成功')
  const batch = await getOpenBatch()
  if (batch) appData.value = await getMyApplication(batch.batchId)
}

/**
 * 页面挂载后：获取当前批次并拉取本人的申请详情与时间轴
 */
onMounted(async () => {
  const batch = await getOpenBatch()
  if (batch) appData.value = await getMyApplication(batch.batchId)
})
</script>

<style scoped>
.section-title { font-size: 15px; color: #1e293b; margin-bottom: 8px; }
.receive-section { margin-top: 8px; }
</style>
