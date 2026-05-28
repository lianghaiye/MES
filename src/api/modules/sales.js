import request from '../config/request'

/**
 * 销售管理 API
 */
export const salesApi = {
  getOrderPage: (params) => request.get('/sales/order/page', { params }),
  getOrderDetail: (id) => request.get(`/sales/order/${id}`),
  createOrder: (data) => request.post('/sales/order', data),
  updateOrder: (id, data) => request.put(`/sales/order/${id}`, data),
  deleteOrder: (id) => request.delete(`/sales/order/${id}`),
  exportOrders: (params) =>
    request.get('/sales/order/export', { params, responseType: 'blob' }),
}
