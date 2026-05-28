import request from '../config/request'

/**
 * 计划排产 - 生产计划 API
 */
export const planningApi = {
  // ── 生产计划 ──────────────────────────────────────
  /** 分页查询生产计划列表 */
  getProductionPlanPage: (params) =>
    request.get('/planning/production-plan/page', { params }),

  /** 获取生产计划详情 */
  getProductionPlanDetail: (id) =>
    request.get(`/planning/production-plan/${id}`),

  /** 新增生产计划 */
  createProductionPlan: (data) =>
    request.post('/planning/production-plan', data),

  /** 更新生产计划 */
  updateProductionPlan: (id, data) =>
    request.put(`/planning/production-plan/${id}`, data),

  /** 删除生产计划 */
  deleteProductionPlan: (id) =>
    request.delete(`/planning/production-plan/${id}`),

  /** 生成采购申请 */
  generatePurchaseRequest: (planId) =>
    request.post(`/planning/production-plan/${planId}/purchase-request`),

  /** 生成加工工单 */
  generateWorkOrder: (planId) =>
    request.post(`/planning/production-plan/${planId}/work-order`),

  /** 生成外协工单 */
  generateOutsourceOrder: (planId) =>
    request.post(`/planning/production-plan/${planId}/outsource-order`),

  // ── 设计任务 ──────────────────────────────────────
  /** 分页查询设计任务列表 */
  getDesignTaskPage: (params) =>
    request.get('/planning/design-task/page', { params }),

  /** 获取设计任务详情 */
  getDesignTaskDetail: (id) =>
    request.get(`/planning/design-task/${id}`),

  /** 新增设计任务 */
  createDesignTask: (data) =>
    request.post('/planning/design-task', data),

  /** 更新设计任务 */
  updateDesignTask: (id, data) =>
    request.put(`/planning/design-task/${id}`, data),

  /** 删除设计任务 */
  deleteDesignTask: (id) =>
    request.delete(`/planning/design-task/${id}`),
}
