<template>
  <div class="page-container">
    <PageBanner title="审批工作台" desc="核查学生困难情况，完成初审审批" icon="Checked"
      :bg="ASSETS.counselorBanner" />
    <el-alert v-if="dashboard.openBatch" type="info" show-icon :closable="false" style="margin-bottom:16px"
      :title="'当前批次：' + dashboard.openBatch.batchName + '（统计与列表均按本批次）'" />
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :xs="12" :sm="6" v-for="item in statItems" :key="item.label">
        <el-card shadow="hover" class="stat-card">
          <div class="value">{{ item.value }}</div>
          <div class="label">{{ item.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" style="margin-bottom:16px">
      <div class="card-title">待催报学生（已建档立卡未申请）</div>
      <el-table :data="dashboard.notAppliedStudents || []" stripe size="small">
        <el-table-column prop="realName" label="姓名" />
        <el-table-column prop="profile.studentNo" label="学号" />
        <el-table-column prop="profile.povertyLevel" label="贫困等级" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="warning" round @click="handleRemind(row)">一键催报</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="hover">
      <div class="card-title">审批工作台</div>
      <el-form :inline="true" style="margin-bottom:12px">
        <el-form-item label="班级">
          <el-input v-model="filters.className" placeholder="班级" clearable />
        </el-form-item>
        <el-form-item label="贫困等级">
          <el-select v-model="filters.povertyLevel" clearable placeholder="全部">
            <el-option label="特殊困难" value="特殊困难" />
            <el-option label="比较困难" value="比较困难" />
            <el-option label="一般困难" value="一般困难" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部">
            <el-option label="待初审" value="COUNSELOR_REVIEW" />
            <el-option label="驳回修改" value="REJECTED_MODIFY" />
            <el-option label="学院复审中" value="COLLEGE_REVIEW" />
            <el-option label="已签收" value="RECEIVED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadApps">查询</el-button>
          <el-button @click="handleExport">导出Excel数据</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="applications" stripe>
        <el-table-column prop="realName" label="姓名" width="80" />
        <el-table-column prop="profile.studentNo" label="学号" width="120" />
        <el-table-column prop="profile.className" label="班级" />
        <el-table-column prop="profile.povertyLevel" label="贫困等级" width="100" />
        <el-table-column prop="auditStatusLabel" label="状态" width="120" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <template v-if="row.application?.auditStatus === 'COUNSELOR_REVIEW'">
              <el-button size="small" type="success" @click="handleAudit(row, '通过')">通过</el-button>
              <el-button size="small" type="warning" @click="openReject(row, '驳回')">驳回</el-button>
              <el-button size="small" type="danger" @click="openReject(row, '拒绝')">拒绝</el-button>
            </template>
            <el-button v-else size="small" @click="showDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="rejectVisible" :title="rejectAction + '申请'" width="400px">
      <el-input v-model="rejectOpinion" type="textarea" :rows="4" :placeholder="'请填写' + rejectAction + '意见'" />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="申请详情" width="500px">
      <el-descriptions :column="1" border v-if="currentRow">
        <el-descriptions-item label="申请理由">{{ currentRow.application?.reason }}</el-descriptions-item>
        <el-descriptions-item label="物资">{{ currentRow.application?.itemType }}</el-descriptions-item>
        <el-descriptions-item label="款式尺码">{{ currentRow.application?.clothStyle }} / {{ currentRow.application?.clothSize }} / {{ currentRow.application?.clothColor }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 辅导员审批工作台（Workbench.vue）
 *
 * 页面用途：辅导员进行初审审批、查看班级申请统计、催报未申请学生。
 * 用户流程：进入工作台 → 查看顶部统计卡片（学生数、申请率、待初审数）
 *          → 对建档立卡但未申请的学生一键催报 → 按条件筛选申请列表
 *          → 对待初审申请执行「通过/驳回/拒绝」→ 可导出班级数据为 CSV。
 */
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCounselorDashboard, getCounselorApplications, counselorAudit, exportCounselorData } from '../../api'
import PageBanner from '../../components/PageBanner.vue'
import { ASSETS } from '../../config/assets'

/** 工作台统计数据：所辖学生数、已申请数、申请率、待初审数、未申请学生列表等 */
const dashboard = ref({})

/** 筛选后的申请列表，表格数据源 */
const applications = ref([])

/** 列表筛选条件：班级名、贫困等级、审核状态，默认查全部 */
const filters = ref({ className: '', povertyLevel: '', status: '' })

/** 驳回/拒绝意见弹窗是否可见 */
const rejectVisible = ref(false)

/** 驳回/拒绝时填写的审批意见 */
const rejectOpinion = ref('')

/** 当前驳回操作类型：「驳回」或「拒绝」 */
const rejectAction = ref('')

/** 当前操作的表格行数据，用于驳回弹窗和详情弹窗 */
const currentRow = ref(null)

/** 申请详情弹窗是否可见 */
const detailVisible = ref(false)

/** 顶部四个统计卡片的数据，从 dashboard 计算得出 */
const statItems = computed(() => [
  { label: '所辖学生', value: dashboard.value.totalStudents || 0 },
  { label: '已申请', value: dashboard.value.appliedCount || 0 },
  { label: '申请率', value: (dashboard.value.applyRate || 0).toFixed(1) + '%' },
  { label: '待初审', value: dashboard.value.pendingCount || 0 }
])

/**
 * 按当前筛选条件加载申请列表
 * 调用时机：点击「查询」按钮，或 refresh 刷新时
 */
async function loadApps() {
  applications.value = await getCounselorApplications(filters.value)
}

/**
 * 直接通过审批（无需填写意见）
 * @param {Object} row - 表格行数据
 * @param {string} action - 审批动作，如「通过」
 * 调用时机：点击「通过」按钮时
 */
async function handleAudit(row, action) {
  await counselorAudit({ appId: row.application.appId, action, opinion: '' })
  ElMessage.success('操作成功')
  await refresh()
}

/**
 * 打开驳回/拒绝意见弹窗
 * @param {Object} row - 当前行数据
 * @param {string} action - 「驳回」或「拒绝」
 * 调用时机：点击「驳回」或「拒绝」按钮时
 */
function openReject(row, action) {
  currentRow.value = row
  rejectAction.value = action
  rejectOpinion.value = ''
  rejectVisible.value = true
}

/**
 * 确认驳回/拒绝并提交审批意见
 * 调用时机：驳回弹窗点击「确认」时
 */
async function confirmReject() {
  await counselorAudit({
    appId: currentRow.value.application.appId,
    action: rejectAction.value,
    opinion: rejectOpinion.value
  })
  rejectVisible.value = false
  ElMessage.success('操作成功')
  await refresh()
}

/**
 * 打开申请详情弹窗，查看理由和物资信息
 * 调用时机：非待初审状态点击「查看」按钮时
 */
function showDetail(row) {
  currentRow.value = row
  detailVisible.value = true
}

/**
 * 向未申请学生发送催报提醒（前端模拟，弹成功提示）
 * 调用时机：待催报表格点击「一键催报」时
 */
function handleRemind(row) {
  ElMessage.success(`已向 ${row.realName}（${row.profile?.studentNo}）发送催报提醒`)
}

/**
 * 导出本班申请数据为 CSV 文件并触发浏览器下载
 * 调用时机：点击「导出 Excel 数据」按钮时
 */
async function handleExport() {
  const data = await exportCounselorData()
  if (!data || !data.length) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  const header = Object.keys(data[0])
  const csv = [header.join(','), ...data.map(r => header.map(k => r[k] || '').join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = '班级寒衣申请数据.csv'
  a.click()
  ElMessage.success('导出成功')
}

/**
 * 刷新工作台：重新拉取统计数据和申请列表
 * 调用时机：审批操作成功后、页面首次加载时
 */
async function refresh() {
  dashboard.value = await getCounselorDashboard()
  await loadApps()
}

/**
 * 页面挂载后：加载统计数据和默认筛选的申请列表
 */
onMounted(refresh)
</script>
