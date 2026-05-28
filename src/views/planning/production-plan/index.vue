<template>
  <div class="page-container">
    <!-- 搜索过滤区 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="订单编号">
          <el-input
            v-model="filterForm.orderNo"
            placeholder="输入编号"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input
            v-model="filterForm.customerName"
            placeholder="输入客户"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="紧急度">
          <el-select
            v-model="filterForm.urgency"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="紧急" value="urgent" />
            <el-option label="普通" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select
            v-model="filterForm.status"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="待排产" value="pending" />
            <el-option label="部分下达" value="partial" />
            <el-option label="已完成" value="done" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单日期">
          <el-date-picker
            v-model="filterForm.orderDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="交付日期">
          <el-date-picker
            v-model="filterForm.deliverDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="content-body">
      <!-- 左侧订单列表 -->
      <div class="order-panel">
        <div class="panel-header">
          <el-button type="primary" size="small" plain>更多</el-button>
        </div>
        <div class="order-list" v-loading="loading">
          <div
            v-for="order in orderList"
            :key="order.id"
            class="order-card"
            :class="{ active: selectedOrder?.id === order.id }"
            @click="handleOrderSelect(order)"
          >
            <div class="order-card-header">
              <el-tag
                :type="order.status === 'done' ? 'success' : 'warning'"
                size="small"
              >
                {{ order.statusText }}
              </el-tag>
              <el-tag type="danger" size="small" v-if="order.overdue">已逾期</el-tag>
              <el-icon class="order-more"><MoreFilled /></el-icon>
            </div>
            <div class="order-no">订单编号：{{ order.orderNo }}</div>
            <div class="order-info">客户名称：{{ order.customerName }}</div>
            <div class="order-info">产品数量：{{ order.quantity }}</div>
            <div class="order-info">业务员：{{ order.salesman }}</div>
          </div>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          small
          layout="prev, pager, next"
          class="order-pagination"
          @current-change="fetchOrderList"
        />
      </div>

      <!-- 右侧详情区 -->
      <div class="detail-panel" v-if="selectedOrder">
        <!-- 订单头信息 -->
        <el-card shadow="never" class="detail-header-card">
          <div class="detail-header">
            <div class="detail-order-no">
              {{ selectedOrder.orderNo }} / 【{{ selectedOrder.customerName }}】
              <el-tag type="danger" size="small" v-if="selectedOrder.overdue">已超交付过期0天</el-tag>
              <el-tag type="danger" size="small" v-if="selectedOrder.overdue">已逾期</el-tag>
            </div>
            <el-link type="primary" class="expand-btn">收起详情 ∧</el-link>
          </div>
          <el-descriptions :column="4" size="small" class="order-desc">
            <el-descriptions-item label="所属区域">{{ selectedOrder.region }}</el-descriptions-item>
            <el-descriptions-item label="结算类型">{{ selectedOrder.settlementType }}</el-descriptions-item>
            <el-descriptions-item label="送货方式">{{ selectedOrder.deliveryMethod }}</el-descriptions-item>
            <el-descriptions-item label="业务员">{{ selectedOrder.salesman }}</el-descriptions-item>
            <el-descriptions-item label="订单日期">{{ selectedOrder.orderDate }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ selectedOrder.remark }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 详情 Tab 区域 -->
        <el-card shadow="never" class="detail-tabs-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="工作项" name="work">
              <PlanWorkTab :order="selectedOrder" />
            </el-tab-pane>
            <el-tab-pane label="合并统计" name="merge">
              <PlaceholderPage />
            </el-tab-pane>
            <el-tab-pane label="所有工单" name="all-orders">
              <PlaceholderPage />
            </el-tab-pane>
            <el-tab-pane label="操作日志" name="log">
              <PlaceholderPage />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>

      <!-- 未选中时的提示 -->
      <div class="detail-empty" v-else>
        <el-empty description="请从左侧选择一条生产计划" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, RefreshLeft, MoreFilled } from '@element-plus/icons-vue'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'
import PlanWorkTab from './components/PlanWorkTab.vue'

// 搜索表单
const filterForm = reactive({
  orderNo: '',
  customerName: '',
  urgency: '',
  status: '',
  orderDateRange: [],
  deliverDateRange: [],
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const loading = ref(false)
const activeTab = ref('work')
const selectedOrder = ref(null)

// 模拟订单数据（TODO: 替换为真实接口）
const orderList = ref([
  {
    id: 1,
    orderNo: '1-2026-123',
    customerName: '山东博润泵业科技有限公司',
    quantity: 1,
    salesman: '王磊',
    status: 'partial',
    statusText: '部分下达',
    overdue: true,
    region: '',
    settlementType: '',
    deliveryMethod: '送货上门',
    orderDate: '2026-04-13 08:54:52',
    remark: '',
  },
  {
    id: 2,
    orderNo: '1-2026-0002',
    customerName: '兴隆县千华旅游开发有限公司',
    quantity: 5,
    salesman: '王磊',
    status: 'partial',
    statusText: '部分下达',
    overdue: true,
    region: '',
    settlementType: '',
    deliveryMethod: '',
    orderDate: '2026-04-10 09:00:00',
    remark: '',
  },
  {
    id: 3,
    orderNo: '1-2026-0003',
    customerName: '平邑县自来水公司',
    quantity: 5,
    salesman: '王磊',
    status: 'partial',
    statusText: '部分下达',
    overdue: true,
    region: '',
    settlementType: '',
    deliveryMethod: '',
    orderDate: '2026-04-11 10:00:00',
    remark: '',
  },
  {
    id: 4,
    orderNo: '1-2026-0031',
    customerName: '山东博润泵业科技有限公司',
    quantity: 4,
    salesman: '王磊',
    status: 'done',
    statusText: '已完成',
    overdue: false,
    region: '',
    settlementType: '',
    deliveryMethod: '',
    orderDate: '2026-04-08 11:00:00',
    remark: '',
  },
])

const handleOrderSelect = (order) => {
  selectedOrder.value = order
}

const fetchOrderList = () => {
  // TODO: 调用 planningApi.getProductionPlanPage(params)
}

const handleSearch = () => {
  pagination.page = 1
  fetchOrderList()
}

const handleReset = () => {
  Object.assign(filterForm, {
    orderNo: '',
    customerName: '',
    urgency: '',
    status: '',
    orderDateRange: [],
    deliverDateRange: [],
  })
  handleSearch()
}

onMounted(() => {
  // 默认选中第一条
  if (orderList.value.length > 0) {
    selectedOrder.value = orderList.value[0]
  }
})
</script>

<style scoped>
.page-container {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-card {
  flex-shrink: 0;
}

:deep(.filter-card .el-card__body) {
  padding: 12px 16px 4px;
}

:deep(.filter-card .el-form-item) {
  margin-bottom: 8px;
}

/* 主体 */
.content-body {
  flex: 1;
  display: flex;
  gap: 10px;
  overflow: hidden;
}

/* 左侧列表 */
.order-panel {
  width: 240px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: flex-end;
}

.order-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.order-card:hover {
  border-color: #1677ff;
}

.order-card.active {
  border-color: #1677ff;
  background: #e8f4ff;
}

.order-card-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
}

.order-more {
  margin-left: auto;
  color: #999;
}

.order-no {
  font-size: 12px;
  color: var(--text-regular);
  margin-bottom: 3px;
  font-weight: 500;
}

.order-info {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-pagination {
  padding: 6px 0;
  justify-content: center;
}

/* 右侧详情 */
.detail-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.detail-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.detail-header-card {
  flex-shrink: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.detail-order-no {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.order-desc {
  margin-top: 4px;
}

.detail-tabs-card {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.detail-tabs-card .el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
}

:deep(.detail-tabs-card .el-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.detail-tabs-card .el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding: 12px;
}
</style>
