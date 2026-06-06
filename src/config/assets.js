/**
 * 静态图片资源配置
 *
 * 所有图片已下载至 public/images 目录，通过绝对路径引用。
 * 各页面横幅、登录背景、Logo 等均从此处统一读取，便于维护和替换。
 *
 * 图片来源说明：
 * - 太原理工大学校友会官网 https://xiaoyou.tyut.edu.cn （校园风光、雪景等）
 * - 太原理工大学官网 https://www.tyut.edu.cn （校徽 Logo）
 */

/**
 * 图片路径映射表
 * 键名对应使用场景，值为 public 目录下的相对 URL
 */
export const ASSETS = {
  logo: '/images/tyut-logo.png',              // 顶栏和登录页校徽
  loginBg: '/images/campus-snow.jpg',         // 登录页全屏背景
  loginBrand: '/images/campus-aerial.jpg',    // 登录页左侧品牌展示区大图
  mainBg: '/images/campus-snow.jpg',          // 主布局内容区背景
  asideBanner: '/images/campus-gate.jpg',     // 侧边栏顶部横幅
  homeBanner: '/images/campus-aerial.jpg',    // 首页顶部 PageBanner
  batchThumb: '/images/campus-library.jpg',   // 首页当前批次卡片缩略图
  applyBanner: '/images/campus-snow.jpg',     // 学生申请页横幅
  progressBanner: '/images/campus-building.jpg', // 进度查询页横幅
  profileBanner: '/images/campus-library.jpg',  // 个人中心页横幅
  counselorBanner: '/images/campus-building.jpg', // 辅导员工作台横幅
  adminDashboard: '/images/campus-aerial.jpg',  // 管理员首页横幅
  adminBatch: '/images/campus-library.jpg',     // 批次管理页横幅
  adminAudit: '/images/campus-gate.jpg',        // 终审管理页横幅
  adminStats: '/images/campus-aerial.jpg',      // 数据报表页横幅
  publicityBanner: '/images/campus-gate.jpg',   // 公示名单页横幅
  defaultBanner: '/images/campus-aerial.jpg'    // PageBanner 未指定 bg 时的默认背景
}

/**
 * 素材来源清单，用于页面底部版权/来源标注
 * name：图片内容描述，url：原始来源网页
 */
export const ASSET_SOURCES = [
  { name: '校园雪景', url: 'https://xiaoyou.tyut.edu.cn/xyh/xyly.htm' },
  { name: '清泽园鸟瞰', url: 'https://xiaoyou.tyut.edu.cn/xyh/xyly.htm' },
  { name: '教学主楼', url: 'https://xiaoyou.tyut.edu.cn/xyh/xyly.htm' },
  { name: '校门夜景', url: 'https://xiaoyou.tyut.edu.cn/xyh/xyly.htm' },
  { name: '机械馆', url: 'https://xiaoyou.tyut.edu.cn/xyh/xyly.htm' },
  { name: '校徽', url: 'https://www.tyut.edu.cn' }
]
