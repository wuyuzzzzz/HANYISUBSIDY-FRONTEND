<template>
  <div class="page-container">
    <PageBanner title="寒衣补助申请" desc="填写申请理由，选择物资款式与尺码" icon="EditPen"
      :bg="ASSETS.applyBanner" />
    <GlassCard title="申请表单">
      <el-alert v-if="!batch" title="当前没有开放的申请批次" type="warning" show-icon :closable="false" />
      <el-alert v-else-if="currentApp && !canEdit" :title="'当前状态：' + statusLabel + '，无法修改'"
        type="info" show-icon :closable="false" style="margin-bottom:16px" />
      <el-form v-if="batch && canEdit" :model="form" label-width="100px" style="max-width:640px">
        <el-form-item label="当前批次">
          <el-tag type="primary" effect="dark" round>{{ batch.batchName }}</el-tag>
        </el-form-item>
        <el-form-item label="申请理由" required>
          <el-input v-model="form.reason" type="textarea" :rows="5"
            placeholder="请陈述家庭实际经济状况与越冬物资需求" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="物资类型" required>
          <el-radio-group v-model="form.itemType">
            <el-radio-button value="寒衣">寒衣</el-radio-button>
            <el-radio-button value="棉被">棉被</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <template v-if="form.itemType === '寒衣'">
          <el-form-item label="款式" required>
            <el-radio-group v-model="form.clothStyle">
              <el-radio-button value="男款">男款</el-radio-button>
              <el-radio-button value="女款">女款</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="尺码" required>
            <el-select v-model="form.clothSize" placeholder="选择尺码" style="width:100%">
              <el-option v-for="s in sizes" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>
          <el-form-item label="颜色偏好" required>
            <el-select v-model="form.clothColor" placeholder="选择颜色" style="width:100%">
              <el-option v-for="c in colors" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
        </template>
        <el-form-item>
          <el-button round @click="handleSave(true)" :loading="loading">暂存草稿</el-button>
          <el-button type="primary" round @click="handleSave(false)" :loading="loading">提交申请</el-button>
          <el-button round @click="$router.push('/progress')">查看进度</el-button>
        </el-form-item>
      </el-form>
    </GlassCard>
  </div>
</template>

<script setup>
/**
 * 学生寒衣申请页（Apply.vue）
 *
 * 页面用途：学生填写并提交寒衣/棉被补助申请的核心页面。
 * 用户流程：进入申请页 → 确认当前开放批次 → 填写申请理由、选择物资类型和尺码
 *          → 可「暂存草稿」稍后继续，或「提交申请」进入辅导员初审
 *          → 已提交且非驳回状态时表单只读，可跳转进度页查看状态。
 */
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOpenBatch, saveApplication, getMyApplication } from '../../api'
import PageBanner from '../../components/PageBanner.vue'
import GlassCard from '../../components/GlassCard.vue'
import { ASSETS } from '../../config/assets'

/** 当前开放的申请批次，无批次时显示警告提示 */
const batch = ref(null)

/** 学生在本批次已有的申请记录，含审核状态等字段 */
const currentApp = ref(null)

/** 保存/提交按钮的 loading 状态，防止重复点击 */
const loading = ref(false)

/** 寒衣可选尺码列表，供下拉框使用 */
const sizes = ['S', 'M', 'L', 'XL', 'XXL', '165', '170', '175', '180', '185']

/** 寒衣可选颜色列表，供下拉框使用 */
const colors = ['黑色', '深蓝', '灰色', '藏青', '军绿']

/** 申请表单数据，draft=true 表示暂存，false 表示正式提交 */
const form = ref({ batchId: null, reason: '', itemType: '寒衣', clothStyle: '男款', clothSize: '', clothColor: '', draft: false })

/** 审核状态码到中文标签的映射表 */
const statusMap = {
  DRAFT: '草稿', COUNSELOR_REVIEW: '辅导员初审中', COLLEGE_REVIEW: '学院复审中',
  PUBLICITY: '公示中', FINAL_APPROVED: '终审通过', DISTRIBUTING: '物资发放中',
  RECEIVED: '已签收', REJECTED_MODIFY: '驳回修改', REJECTED: '拒绝申请'
}

/** 当前申请状态的中文显示文字 */
const statusLabel = computed(() => statusMap[currentApp.value?.auditStatus] || '')

/** 是否允许编辑表单：无申请记录，或状态为草稿/驳回修改时可编辑 */
const canEdit = computed(() => {
  if (!currentApp.value) return true
  return ['DRAFT', 'REJECTED_MODIFY'].includes(currentApp.value.auditStatus)
})

/**
 * 保存或提交申请
 * @param {boolean} isDraft - true 暂存草稿，false 正式提交
 * 调用时机：点击「暂存草稿」或「提交申请」按钮时
 */
async function handleSave(isDraft) {
  form.value.draft = isDraft
  form.value.batchId = batch.value.batchId
  if (!isDraft) await ElMessageBox.confirm('确认提交申请？提交后将进入辅导员初审流程。', '确认提交')
  loading.value = true
  try {
    currentApp.value = await saveApplication(form.value)
    ElMessage.success(isDraft ? '草稿已保存' : '申请已提交')
  } finally {
    loading.value = false
  }
}

/**
 * 页面挂载后：获取开放批次，若已有申请则回填表单字段
 */
onMounted(async () => {
  batch.value = await getOpenBatch()
  if (batch.value) {
    const data = await getMyApplication(batch.value.batchId)
    if (data?.application) {
      currentApp.value = data.application
      const app = data.application
      form.value.reason = app.reason || ''
      form.value.itemType = app.itemType || '寒衣'
      form.value.clothStyle = app.clothStyle || '男款'
      form.value.clothSize = app.clothSize || ''
      form.value.clothColor = app.clothColor || ''
    }
  }
})
</script>
