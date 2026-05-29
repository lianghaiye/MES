import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * 路由配置
 * meta 字段说明：
 *   title     - 菜单/标签页显示名称
 *   icon      - Element Plus 图标名
 *   module    - 所属顶部导航模块 key
 *   hidden    - 是否在侧边栏隐藏
 *   affix     - 是否固定在标签栏（不可关闭）
 */

// 模块路由配置
const moduleRoutes = [
  // ────────── 首页 ──────────
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页', icon: 'HomeFilled', module: 'home', affix: true },
  },

  // ────────── 产品工艺 ──────────
  {
    path: '/process',
    name: 'Process',
    redirect: '/process/bom',
    meta: { title: '产品工艺', icon: 'Operation', module: 'process' },
    children: [
      {
        path: 'bom',
        name: 'ProcessBom',
        component: () => import('@/views/process/index.vue'),
        meta: { title: 'BOM管理', module: 'process' },
      },
    ],
  },

  // ────────── 销售管理 ──────────
  {
    path: '/sales',
    name: 'Sales',
    redirect: '/sales/order',
    meta: { title: '销售管理', icon: 'ShoppingCart', module: 'sales' },
    children: [
      {
        path: 'order',
        name: 'SalesOrder',
        component: () => import('@/views/sales/index.vue'),
        meta: { title: '销售订单', module: 'sales' },
      },
    ],
  },

  // ────────── 计划排产 ──────────
  {
    path: '/planning',
    name: 'Planning',
    redirect: '/planning/production-plan',
    meta: { title: '计划排产', icon: 'Calendar', module: 'planning' },
    children: [
      {
        path: 'production-plan',
        name: 'ProductionPlan',
        component: () => import('@/views/planning/production-plan/index.vue'),
        meta: { title: '生产计划', module: 'planning' },
      },
      {
        path: 'design-task',
        name: 'DesignTask',
        component: () => import('@/views/planning/design-task/index.vue'),
        meta: { title: '设计任务', module: 'planning' },
      },
    ],
  },

  // ────────── 生产管理 ──────────
  {
    path: '/production',
    name: 'Production',
    redirect: '/production/work-order',
    meta: { title: '生产管理', icon: 'SetUp', module: 'production' },
    children: [
      {
        path: 'work-order',
        name: 'WorkOrder',
        component: () => import('@/views/production/work-order/index.vue'),
        meta: { title: '工单管理', module: 'production' },
      },
    ],
  },

  // ────────── 库存管理 ──────────
  {
    path: '/warehouse',
    name: 'Warehouse',
    redirect: '/warehouse/inventory',
    meta: { title: '库存管理', icon: 'Box', module: 'warehouse' },
    children: [
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/warehouse/index.vue'),
        meta: { title: '库存查询', module: 'warehouse' },
      },
    ],
  },

  // ────────── 质量管理 ──────────
  {
    path: '/quality',
    name: 'Quality',
    redirect: '/quality/inspection',
    meta: { title: '质量管理', icon: 'CircleCheck', module: 'quality' },
    children: [
      {
        path: 'inspection',
        name: 'Inspection',
        component: () => import('@/views/quality/index.vue'),
        meta: { title: '质检管理', module: 'quality' },
      },
    ],
  },

  // ────────── 采购管理 ──────────
  {
    path: '/procurement',
    name: 'Procurement',
    redirect: '/procurement/purchase-order',
    meta: { title: '采购管理', icon: 'ShoppingBag', module: 'procurement' },
    children: [
      {
        path: 'purchase-order',
        name: 'PurchaseOrder',
        component: () => import('@/views/procurement/index.vue'),
        meta: { title: '采购订单', module: 'procurement' },
      },
    ],
  },

  // ────────── 售后管理 ──────────
  {
    path: '/aftersale',
    name: 'Aftersale',
    redirect: '/aftersale/service',
    meta: { title: '售后管理', icon: 'Service', module: 'aftersale' },
    children: [
      {
        path: 'service',
        name: 'AftersaleService',
        component: () => import('@/views/aftersale/index.vue'),
        meta: { title: '售后工单', module: 'aftersale' },
      },
    ],
  },
]

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/layout',
    name: 'Layout',
    component: () => import('@/layout/AppLayout.vue'),
    redirect: '/home',
    children: moduleRoutes,
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/home/NotFound.vue'),
    meta: { hidden: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// 路由守卫 - 预留鉴权逻辑
router.beforeEach((to, from, next) => {
  // TODO: 接入登录鉴权逻辑
  // const token = localStorage.getItem('token')
  // if (!token && to.name !== 'Login') {
  //   return next({ name: 'Login' })
  // }
  document.title = to.meta?.title ? `${to.meta.title} - I-DOMS` : 'I-DOMS'
  next()
})

export default router

// 导出模块路由供 Sidebar 使用
export { moduleRoutes }
