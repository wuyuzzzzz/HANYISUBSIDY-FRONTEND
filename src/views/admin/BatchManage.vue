<template>
  <div class="page-container">
    <PageBanner title="批次管理" desc="创建与管理寒衣补助申请批次" icon="Calendar"
      :bg="ASSETS.adminBatch" />
    <GlassCard title="批次列表">
      <template #extra>
        <el-button type="primary" round @click="openForm()">新建批次</el-button>
      </template>
      <el-table :data="batches" stripe>
        <el-table-column prop="batchName" label="批次名称" />
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="endTime" label="截止时间" width="170" />
        <el-table-column prop="totalBudget" label="总预算" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'OPEN' ? 'success' : 'info'" round>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" round @click="openForm(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </GlassCard>

    <el-dialog v-model="visible" :title="form.batchId ? '编辑批次' : '新建批次'" width="520px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="批次名称"><el-input v-model="form.batchName" /></el-form-item>
        <el-form-item label="开始时间"><el-date-picker v-model="form.startTime" type="datetime" style="width:100%" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
        <el-form-item label="截止时间"><el-date-picker v-model="form.endTime" type="datetime" style="width:100%" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
        <el-form-item label="辅导员截止"><el-date-picker v-model="form.counselorDeadline" type="datetime" style="width:100%" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
        <el-form-item label="总预算"><el-input-number v-model="form.totalBudget" :min="0" /></el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="开放" value="OPEN" />
            <el-option label="关闭" value="CLOSED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 批次管理页（BatchManage.vue）
 *
 * 页面用途：管理员创建、编辑寒衣补助申请批次，控制申请开放时间和预算。
 * 用户流程：进入批次管理 → 查看所有批次列表（名称、时间、状态）
 *          → 点击「新建批次」或「编辑」打开弹窗 → 填写批次信息并保存
 *          → 将状态设为 OPEN 后学生方可申请。
 */
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getBatches, saveBatch } from '../../api'
import PageBanner from '../../components/PageBanner.vue'
import GlassCard from '../../components/GlassCard.vue'
import { ASSETS } from '../../config/assets'

/** 所有申请批次列表，表格数据源 */
const batches = ref([])

/** 新建/编辑弹窗是否可见 */
const visible = ref(false)

/** 弹窗内批次表单数据，编辑时从行数据复制，新建时为默认值 */
const form = ref({})

/**
 * 打开新建或编辑批次弹窗
 * @param {Object|null} row - 传入行数据为编辑模式，不传为新建模式
 * 调用时机：点击「新建批次」或表格「编辑」按钮时
 */
function openForm(row) {
  form.value = row ? { ...row } : { batchName: '', status: 'DRAFT', totalBudget: 0 }
  visible.value = true
}

/**
 * 保存批次（新建或更新）
 * 校验批次名称后提交，成功后关闭弹窗并刷新列表
 * 调用时机：弹窗点击「保存」按钮时
 */
async function handleSave() {
  if (!form.value.batchName) { ElMessage.warning('请填写批次名称'); return }
  await saveBatch(form.value)
  ElMessage.success('保存成功')
  visible.value = false
  batches.value = await getBatches()
}

/**
 * 页面挂载后：加载全部批次列表
 */
onMounted(async () => { batches.value = await getBatches() })
</script>
