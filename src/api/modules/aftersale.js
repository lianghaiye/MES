import request from '../config/request'

/**
 * 售后管理 API
 */
export const aftersaleApi = {
  getServicePage: (params) => request.get('/aftersale/service/page', { params }),
  getServiceDetail: (id) => request.get(`/aftersale/service/${id}`),
  createService: (data) => request.post('/aftersale/service', data),
  updateService: (id, data) => request.put(`/aftersale/service/${id}`, data),
  closeService: (id) => request.post(`/aftersale/service/${id}/close`),
}
