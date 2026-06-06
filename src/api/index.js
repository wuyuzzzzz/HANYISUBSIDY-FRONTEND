/**
 * API 接口汇总模块
 *
 * 按业务角色分组封装所有后端接口，页面组件只需 import 对应函数即可调用。
 * 每个函数返回 Promise，resolve 值为 request 拦截器处理后的业务数据。
 */
import request from './request'

// ==================== 认证相关 ====================

/**
 * 用户登录
 * @param {Object} data - { username, password }
 * @returns 登录成功后的 token 及用户信息（角色、姓名等）
 * 调用时机：Login.vue 点击「登录」按钮时
 */
export const login = (data) => request.post('/auth/login', data)

// ==================== 学生端接口 ====================

/** 获取当前登录学生的档案信息（学号、学院、贫困等级等），Profile.vue 进入页面时调用 */
export const getProfile = () => request.get('/student/profile')

/** 更新学生可维护字段（手机号、银行卡号），Profile.vue 点击「保存修改」时调用 */
export const updateProfile = (data) => request.put('/student/profile', data)

/**
 * 保存或提交寒衣申请
 * @param {Object} data - 含 batchId、reason、itemType、draft 等字段
 * draft=true 为暂存草稿，false 为正式提交
 * 调用时机：Apply.vue 点击「暂存草稿」或「提交申请」时
 */
export const saveApplication = (data) => request.post('/student/application', data)

/** 查询本人在指定批次下的申请记录及时间轴，Apply.vue / Progress.vue 进入页面时调用 */
export const getMyApplication = (batchId) => request.get(`/student/application/${batchId}`)

/** 确认已收到物资并可附带反馈，Progress.vue 点击「确认已收到」时调用 */
export const confirmReceive = (appId, feedback) => request.post(`/student/application/${appId}/receive`, { feedback })

// ==================== 公共接口（任意登录用户可访问） ====================

/** 获取系统公告列表，Home.vue 首页展示通知与政策 */
export const getAnnouncements = () => request.get('/common/announcements')

/** 获取当前处于开放状态的申请批次，多个页面用于判断是否有可申请批次 */
export const getOpenBatch = () => request.get('/common/open-batch')

// ==================== 辅导员端接口 ====================

/** 获取辅导员工作台统计数据（所辖学生数、申请率、待初审数等），Workbench.vue 进入时调用 */
export const getCounselorDashboard = () => request.get('/counselor/dashboard')

/** 按班级、贫困等级、状态筛选申请列表，Workbench.vue 点击「查询」时调用 */
export const getCounselorApplications = (params) => request.get('/counselor/applications', { params })

/**
 * 辅导员初审操作（通过 / 驳回 / 拒绝）
 * @param {Object} data - { appId, action, opinion }
 * 调用时机：Workbench.vue 审批按钮或驳回弹窗确认时
 */
export const counselorAudit = (data) => request.post('/counselor/audit', data)

/** 导出本班申请数据为 JSON 数组，Workbench.vue 点击「导出 Excel 数据」时调用，前端再转 CSV 下载 */
export const exportCounselorData = () => request.get('/counselor/export')

// ==================== 管理员端接口 ====================

/** 获取所有申请批次列表，BatchManage.vue 进入页面时调用 */
export const getBatches = () => request.get('/admin/batches')

/** 新建或编辑批次，BatchManage.vue 弹窗点击「保存」时调用 */
export const saveBatch = (data) => request.post('/admin/batches', data)

/** 按状态和批次筛选申请列表，AuditManage.vue 查询与刷新时调用 */
export const getAdminApplications = (params) => request.get('/admin/applications', { params })

/**
 * 管理员终审操作（复审通过 / 驳回 / 终审通过 / 发放）
 * 调用时机：AuditManage.vue 各审批按钮或驳回确认时
 */
export const adminAudit = (data) => request.post('/admin/audit', data)

/** 获取尺码统计矩阵（用于订货），Statistics.vue 进入时调用 */
export const getSizeMatrix = (batchId) => request.get(`/admin/size-matrix/${batchId}`)

/** 获取申请统计数据（总数、通过率、贫困分布等），Statistics.vue 进入时调用 */
export const getStatistics = (batchId) => request.get(`/admin/statistics/${batchId}`)

/** 获取公示名单（已脱敏），Publicity.vue 进入时调用 */
export const getPublicity = (batchId) => request.get(`/admin/publicity/${batchId}`)

/** 发布通知或政策公告，Dashboard.vue 点击「发布公告」时调用 */
export const publishAnnouncement = (data) => request.post('/admin/announcements', data)
