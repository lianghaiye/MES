import request from '../config/request'

/**
 * 库存管理 API
 */
export const warehouseApi = {
  getInventoryPage: (params) => request.get('/warehouse/inventory/page', { params }),
  getInventoryDetail: (id) => request.get(`/warehouse/inventory/${id}`),
  inbound: (data) => request.post('/warehouse/inbound', data),
  outbound: (data) => request.post('/warehouse/outbound', data),
  transfer: (data) => request.post('/warehouse/transfer', data),
}
