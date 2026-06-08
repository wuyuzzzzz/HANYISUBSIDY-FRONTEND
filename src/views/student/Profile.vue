<template>
  <div class="page-container">
    <PageBanner title="个人中心" desc="查看并完善您的基本信息与困难认定" icon="User"
      :bg="ASSETS.profileBanner" />
    <GlassCard title="基本信息">
      <el-descriptions :column="isMobile ? 1 : 2" border v-if="profile">
        <el-descriptions-item label="姓名">{{ profile.realName || store.userInfo?.realName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ profile.studentNo }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ profile.college }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ profile.major }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ profile.className }}</el-descriptions-item>
        <el-descriptions-item label="贫困等级">
          <el-tag :type="levelType(profile.povertyLevel)" effect="dark" round>{{ profile.povertyLevel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="建档立卡">
          <el-tag :type="profile.isRegistered ? 'success' : 'info'" round>{{ profile.isRegistered ? '是' : '否' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="GPA">{{ profile.gpa }}</el-descriptions-item>
      </el-descriptions>
    </GlassCard>
    <GlassCard title="信息维护">
      <el-form :model="form" label-width="100px" style="max-width:500px">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" prefix-icon="Phone" />
        </el-form-item>
        <el-form-item label="银行卡号">
          <el-input v-model="form.bankCard" prefix-icon="CreditCard" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round @click="handleSave" :loading="saving">保存修改</el-button>
        </el-form-item>
      </el-form>
    </GlassCard>
  </div>
</template>

<script setup>
/**
 * 学生个人中心页（Profile.vue）
 *
 * 页面用途：展示学生学籍与困难认定档案，并允许修改联系方式和银行卡信息。
 * 用户流程：进入个人中心 → 查看姓名、学号、学院、贫困等级等只读信息
 *          → 在下方表单修改手机号和银行卡 → 点击「保存修改」提交更新。
 */
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getProfile, updateProfile } from '../../api'
import { useUserStore } from '../../stores/user'
import PageBanner from '../../components/PageBanner.vue'
import GlassCard from '../../components/GlassCard.vue'
import { ASSETS } from '../../config/assets'

/** 用户状态仓库，用于补充显示姓名等登录信息 */
const store = useUserStore()

/** 学生完整档案数据，从后端 getProfile 接口获取 */
const profile = ref(null)

/** 可编辑表单：手机号和银行卡号 */
const form = ref({ phone: '', bankCard: '' })

/** 保存按钮 loading 状态 */
const saving = ref(false)

/** 是否为移动端视口，控制描述列表列数为 1 或 2 */
const isMobile = computed(() => window.innerWidth < 768)

/**
 * 根据贫困等级返回 el-tag 的颜色类型
 * @param {string} level - 困难等级文字
 * 调用时机：模板渲染贫困等级标签时
 */
function levelType(level) {
  if (level === '特殊困难') return 'danger'
  if (level === '比较困难') return 'warning'
  return 'info'
}

/**
 * 提交个人信息修改
 * 调用时机：点击「保存修改」按钮时
 */
async function handleSave() {
  saving.value = true
  try {
    profile.value = await updateProfile(form.value)
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

/**
 * 页面挂载后：拉取档案信息并回填可编辑表单字段
 */
onMounted(async () => {
  profile.value = await getProfile()
  form.value.phone = profile.value.phone || ''
  form.value.bankCard = profile.value.bankCard || ''
})
</script>
