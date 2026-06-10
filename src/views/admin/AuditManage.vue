<template>
  <div class="page-container">
    <PageBanner title="终审管理" desc="复审、公示、终审与发放全流程管理" icon="Document"
      :bg="ASSETS.adminAudit" />
    <GlassCard title="审批列表">
      <el-form :inline="true" style="margin-bottom:12px">
        <el-form-item label="状态">
          <el-select v-model="status" clearable placeholder="全部" style="width:160px">
            <el-option label="学院复审中" value="COLLEGE_REVIEW" />
            <el-option label="公示中" value="PUBLICITY" />
            <el-option label="终审通过" value="FINAL_APPROVED" />
            <el-option label="发放中" value="DISTRIBUTING" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" round @click="load">查询</el-button></el-form-item>
      </el-form>
      <el-table :data="list" stripe>
        <el-table-column prop="realName" label="姓名" width="80" />
        <el-table-column prop="student.studentNo" label="学号" width="120" />
        <el-table-column prop="student.college" label="学院" />
        <el-table-column prop="student.povertyLevel" label="贫困等级" width="100" />
        <el-table-column prop="auditStatusLabel" label="状态" width="120" />
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="{ row }">
            <template v-if="row.application?.auditStatus === 'COLLEGE_REVIEW'">
              <el-button size="small" type="success" round @click="audit(row, '复审通过')">复审通过</el-button>
              <el-button size="small" type="warning" round @click="openReject(row)">驳回</el-button>
            </template>
            <el-button v-if="row.application?.auditStatus === 'PUBLICITY'" size="small" type="success" round @click="audit(row, '终审通过')">终审通过</el-button>
            <el-button v-if="row.application?.auditStatus === 'FINAL_APPROVED'" size="small" type="primary" round @click="audit(row, '发放')">标记发放</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!list.length" description="暂无待处理申请" />
    </GlassCard>

    <el-dialog v-model="rejectVisible" title="驳回申请" width="400px">
      <el-input v-model="rejectOpinion" type="textarea" :rows="4" placeholder="请填写驳回意见" />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 管理员终审管理页（AuditManage.vue）
 *
 * 页面用途：管理员执行学院复审、公示期终审通过、标记物资发放等后续审批操作。
 * 用户流程：进入终审管理 → 按状态筛选申请（默认「学院复审中」）
 *          → 对复审中申请执行「复审通过」或「驳回」
 *          → 公示中申请执行「终审通过」→ 终审通过后「标记发放」。
 */
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminApplications, adminAudit, getOpenBatch } from '../../api'
import PageBanner from '../../components/PageBanner.vue'
import GlassCard from '../../components/GlassCard.vue'
import { ASSETS } from '../../config/assets'

/** 筛选后的申请列表，表格数据源 */
const list = ref([])

/** 当前筛选的审核状态，默认查学院复审中的申请 */
const status = ref('COLLEGE_REVIEW')

/** 驳回意见弹窗是否可见 */
const rejectVisible = ref(false)

/** 驳回时填写的审批意见 */
const rejectOpinion = ref('')

/** 当前操作的表格行数据 */
const currentRow = ref(null)

/** 当前开放批次的 ID，加载列表时作为筛选参数 */
let batchId = null

/**
 * 按状态和批次加载申请列表
 * 调用时机：点击「查询」、审批操作成功后、页面首次加载时
 */
async function load() {
  list.value = await getAdminApplications({ status: status.value, batchId })
}

/**
 * 执行审批操作（复审通过、终审通过、标记发放等，无需填写意见）
 * @param {Object} row - 表格行数据
 * @param {string} action - 审批动作名称
 * 调用时机：点击对应审批按钮时
 */
async function audit(row, action) {
  await adminAudit({ appId: row.application.appId, action, opinion: '' })
  ElMessage.success('操作成功')
  await load()
}

/**
 * 打开驳回意见弹窗
 * 调用时机：点击「驳回」按钮时
 */
function openReject(row) {
  currentRow.value = row
  rejectOpinion.value = ''
  rejectVisible.value = true
}

/**
 * 确认驳回并提交审批意见
 * 调用时机：驳回弹窗点击「确认」时
 */
async function confirmReject() {
  await adminAudit({ appId: currentRow.value.application.appId, action: '驳回', opinion: rejectOpinion.value })
  rejectVisible.value = false
  ElMessage.success('已驳回')
  await load()
}

/**
 * 页面挂载后：获取当前批次 ID，并加载默认状态的申请列表
 */
onMounted(async () => {
  const batch = await getOpenBatch()
  batchId = batch?.batchId
  await load()
})
</script>
