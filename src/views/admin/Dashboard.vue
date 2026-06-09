<template>
  <div class="page-container">
    <PageBanner title="管理首页" desc="发布系统通知与政策公告" icon="DataBoard"
      :bg="ASSETS.adminDashboard" />
    <GlassCard title="发布通知公告">
      <el-form :model="annForm" label-width="80px" style="max-width:640px">
        <el-form-item label="标题"><el-input v-model="annForm.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="annForm.content" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="annForm.annType">
            <el-option label="通知" value="NOTICE" />
            <el-option label="政策" value="POLICY" />
          </el-select>
        </el-form-item>
        <el-button type="primary" round @click="handlePublish">发布公告</el-button>
      </el-form>
    </GlassCard>
  </div>
</template>

<script setup>
/**
 * 管理员首页：发布系统公告（通知 / 政策）。
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { publishAnnouncement } from '../../api'
import PageBanner from '../../components/PageBanner.vue'
import GlassCard from '../../components/GlassCard.vue'
import { ASSETS } from '../../config/assets'

const annForm = ref({ title: '', content: '', annType: 'NOTICE' })

async function handlePublish() {
  if (!annForm.value.title || !annForm.value.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }
  await publishAnnouncement(annForm.value)
  ElMessage.success('发布成功')
  annForm.value = { title: '', content: '', annType: 'NOTICE' }
}
</script>
