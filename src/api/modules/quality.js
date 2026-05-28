import request from '../config/request'

/**
 * 质量管理 API
 */
export const qualityApi = {
  getInspectionPage: (params) => request.get('/quality/inspection/page', { params }),
  getInspectionDetail: (id) => request.get(`/quality/inspection/${id}`),
  submitInspection: (data) => request.post('/quality/inspection', data),
  updateInspection: (id, data) => request.put(`/quality/inspection/${id}`, data),
}
