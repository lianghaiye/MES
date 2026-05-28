import request from '../config/request'

/**
 * 产品工艺 API
 */
export const processApi = {
  getBomPage: (params) => request.get('/process/bom/page', { params }),
  getBomDetail: (id) => request.get(`/process/bom/${id}`),
  createBom: (data) => request.post('/process/bom', data),
  updateBom: (id, data) => request.put(`/process/bom/${id}`, data),
  deleteBom: (id) => request.delete(`/process/bom/${id}`),
}
