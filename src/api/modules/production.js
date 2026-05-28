import request from '../config/request'

/**
 * 生产管理 API
 */
export const productionApi = {
  getWorkOrderPage: (params) => request.get('/production/work-order/page', { params }),
  getWorkOrderDetail: (id) => request.get(`/production/work-order/${id}`),
  createWorkOrder: (data) => request.post('/production/work-order', data),
  updateWorkOrder: (id, data) => request.put(`/production/work-order/${id}`, data),
  deleteWorkOrder: (id) => request.delete(`/production/work-order/${id}`),
  reportProgress: (id, data) => request.post(`/production/work-order/${id}/report`, data),
}
