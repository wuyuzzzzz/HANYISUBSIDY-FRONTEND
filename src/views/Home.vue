<template>
  <div class="page-container">
    <PageBanner
      title="欢迎使用寒衣补助申请系统"
      :desc="welcomeText"
      icon="Sunny"
      :bg="ASSETS.homeBanner"
    />

    <el-row :gutter="16">
      <el-col :xs="24" :sm="16">
        <GlassCard title="通知公告">
          <div v-for="ann in announcements" :key="ann.annId" class="ann-item">
            <div class="ann-title">
              <el-tag size="small" :type="ann.annType === 'POLICY' ? 'warning' : 'primary'" round>
                {{ ann.annType === 'POLICY' ? '政策' : '通知' }}
              </el-tag>
              {{ ann.title }}
            </div>
            <div class="ann-content">{{ ann.content }}</div>
            <div class="ann-time"><el-icon><Clock /></el-icon> {{ ann.publishTime }}</div>
          </div>
          <el-empty v-if="!announcements.length" description="暂无公告" />
        </GlassCard>
      </el-col>
      <el-col :xs="24" :sm="8" style="margin-top:16px">
        <GlassCard title="当前批次">
          <template v-if="batch">
            <div class="batch-card">
              <img :src="ASSETS.batchThumb" class="batch-img" alt="太原理工大学校园" />
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="批次名称">{{ batch.batchName }}</el-descriptions-item>
                <el-descriptions-item label="申请时间">{{ batch.startTime }} ~ {{ batch.endTime }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="batch.status === 'OPEN' ? 'success' : 'info'" effect="dark" round>
                    {{ batch.status === 'OPEN' ? '开放中' : batch.status }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <el-button v-if="store.roleCode === 'STUDENT' && batch.status === 'OPEN'"
              type="primary" round style="margin-top:16px;width:100%" @click="$router.push('/apply')">
              <el-icon><EditPen /></el-icon> 立即申请
            </el-button>
          </template>
          <el-empty v-else description="暂无开放批次" />
        </GlassCard>

        <div class="quick-links" v-if="store.roleCode">
          <h4>快捷入口</h4>
          <div class="link-grid">
            <div v-for="link in quickLinks" :key="link.path" class="link-item" @click="$router.push(link.path)">
              <el-icon :size="24"><component :is="link.icon" /></el-icon>
              <span>{{ link.label }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
/**
 * 系统首页（Home.vue）
 *
 * 页面用途：登录后的默认落地页，汇总展示系统公告和当前申请批次信息。
 * 用户流程：登录成功进入首页 → 查看欢迎语和通知公告 → 了解当前开放批次
 *          → 学生可点击「立即申请」→ 通过快捷入口跳转到常用功能页面。
 */
import { ref, computed, onMounted } from 'vue'
import { getAnnouncements, getOpenBatch } from '../api'
import { useUserStore } from '../stores/user'
import PageBanner from '../components/PageBanner.vue'
import GlassCard from '../components/GlassCard.vue'
import { ASSETS } from '../config/assets'

/** 用户状态仓库，用于生成欢迎语和角色相关的快捷入口 */
const store = useUserStore()

/** 系统公告列表，从后端拉取后展示在左侧卡片 */
const announcements = ref([])

/** 当前开放的申请批次信息，无开放批次时为 null */
const batch = ref(null)

/** 横幅欢迎语：拼接用户姓名、角色名和系统提示 */
const welcomeText = computed(() => {
  const role = store.userInfo?.roleName || ''
  return `${store.userInfo?.realName || ''}，${role}您好！冬季寒衣补助申请通道已开启。`
})

/** 右侧快捷入口列表，按角色返回不同的跳转路径和图标 */
const quickLinks = computed(() => {
  if (store.roleCode === 'STUDENT') {
    return [
      { path: '/apply', label: '寒衣申请', icon: 'EditPen' },
      { path: '/progress', label: '进度查询', icon: 'Clock' },
      { path: '/profile', label: '个人中心', icon: 'User' }
    ]
  }
  if (store.roleCode === 'COUNSELOR') {
    return [{ path: '/counselor', label: '审批工作台', icon: 'Checked' }]
  }
  if (store.roleCode === 'ADMIN') {
    return [
      { path: '/admin/audit', label: '终审管理', icon: 'Document' },
      { path: '/admin/stats', label: '数据报表', icon: 'PieChart' }
    ]
  }
  return []
})

/**
 * 页面挂载后：并行拉取公告列表和当前开放批次
 */
onMounted(async () => {
  announcements.value = await getAnnouncements()
  batch.value = await getOpenBatch()
})
</script>

<style scoped>
.ann-item { padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
.ann-item:last-child { border-bottom: none; }
.ann-title { font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; color: #1e293b; }
.ann-content { font-size: 13px; color: #64748b; line-height: 1.7; }
.ann-time { font-size: 12px; color: #94a3b8; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
.batch-card { position: relative; }
.batch-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 12px;
}
.quick-links {
  margin-top: 16px;
  padding: 20px;
  background: rgba(255,255,255,0.92);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(26, 86, 219, 0.08);
}
.quick-links h4 { font-size: 14px; color: #64748b; margin-bottom: 12px; }
.link-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff, #f0f9ff);
  cursor: pointer;
  transition: all 0.2s;
  color: #1a56db;
  font-size: 12px;
}
.link-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(26, 86, 219, 0.15); }
</style>
