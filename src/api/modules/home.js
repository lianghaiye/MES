import request from '../config/request'

/**
 * 首页 API
 */
export const homeApi = {
  // 获取首页概览数据
  getOverview: () => request.get('/home/overview'),
  // 获取系统公告
  getNotices: () => request.get('/home/notices'),
}
