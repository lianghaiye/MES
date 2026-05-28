import request from '../config/request'

/**
 * 采购管理 API
 */
export const procurementApi = {
  getPurchaseOrderPage: (params) =>
    request.get('/procurement/purchase-order/page', { params }),
  getPurchaseOrderDetail: (id) =>
    request.get(`/procurement/purchase-order/${id}`),
  createPurchaseOrder: (data) =>
    request.post('/procurement/purchase-order', data),
  updatePurchaseOrder: (id, data) =>
    request.put(`/procurement/purchase-order/${id}`, data),
  deletePurchaseOrder: (id) =>
    request.delete(`/procurement/purchase-order/${id}`),
  approvePurchaseOrder: (id) =>
    request.post(`/procurement/purchase-order/${id}/approve`),
}
