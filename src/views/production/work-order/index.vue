<template>
  <div class="page-container">
    <!-- 搜索过滤区 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="工单编号">
          <el-input
            v-model="filterForm.workOrderNo"
            placeholder="输入编号"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="工单名称">
          <el-input
            v-model="filterForm.workOrderName"
            placeholder="输入名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="销售订单号">
          <el-input
            v-model="filterForm.salesOrderNo"
            placeholder="输入订单号"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="待下发" value="pending" />
            <el-option label="执行中" value="executing" />
            <el-option label="完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="工单类别">
          <el-select
            v-model="filterForm.workOrderType"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="机加工" value="machining" />
            <el-option label="装配" value="assembly" />
            <el-option label="铸造" value="casting" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作中心">
          <el-select
            v-model="filterForm.workCenter"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option label="默认工厂" value="default_factory" />
            <el-option label="机加车间一" value="workshop_1" />
            <el-option label="机加车间二" value="workshop_2" />
            <el-option label="装配车间" value="assembly_shop" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 底部操作栏：左操作按钮，右查询/重置 -->
      <div class="filter-card-footer">
        <div class="toolbar-btns">
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增工单</el-button>
          <el-dropdown split-button type="default" @command="handleBatchCommand">
            <el-icon><Document /></el-icon>
            <span style="margin-left: 4px">批量操作</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="batch-import">
                  <el-icon><Download /></el-icon> 批量导入
                </el-dropdown-item>
                <el-dropdown-item command="batch-export">
                  <el-icon><Upload /></el-icon> 批量导出
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="warning" plain :icon="TopRight" @click="handleBatchDispatch">批量下发</el-button>
        </div>
        <div class="search-btns">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
        </div>
      </div>
    </el-card>

    <div class="content-body">
      <!-- 左侧工单列表 -->
      <div class="order-panel">
        <div class="panel-header">
          <span class="panel-title">工单列表</span>
        </div>
        <div class="order-list" v-loading="loading">
          <div
            v-for="order in workOrderList"
            :key="order.id"
            class="order-card"
            :class="{ active: selectedOrder?.id === order.id }"
            @click="handleOrderSelect(order)"
          >
            <div class="order-card-header">
              <div class="order-card-tags">
                <el-tag :type="getStatusType(order.status)" size="small" effect="light">
                  {{ order.statusText }}
                </el-tag>
                <el-tag
                  v-if="order.urgency !== 'normal'"
                  :type="getUrgencyType(order.urgency)"
                  size="small"
                  effect="plain"
                  class="urgency-tag"
                >
                  {{ getUrgencyLabel(order.urgency) }}
                </el-tag>
              </div>
              <el-dropdown trigger="click" @command="(cmd) => handleCardCommand(cmd, order)" @click.stop>
                <el-icon class="order-more-btn"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="urgency">
                      <el-icon><Warning /></el-icon> 调整紧急度
                    </el-dropdown-item>
                    <el-dropdown-item command="pause" :disabled="order.status !== 'executing' || order.executionStatus === 'terminated'">
                      <el-icon><VideoPause /></el-icon> 暂停
                    </el-dropdown-item>
                    <el-dropdown-item command="terminate" :disabled="order.status === 'completed' || order.executionStatus === 'terminated'">
                      <el-icon><CircleClose /></el-icon> 终止
                    </el-dropdown-item>
                    <el-dropdown-item command="complete" :disabled="order.status !== 'executing' || order.executionStatus === 'terminated'">
                      <el-icon><CircleCheck /></el-icon> 完成
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="order-no">{{ order.workOrderNo }}</div>
            <div class="order-name" :title="order.workOrderName">{{ order.workOrderName }}</div>
            <div class="order-info">
              <span>销售订单：{{ order.salesOrderNo }}</span>
            </div>
            <div class="order-info">
              <span>计划数量：{{ order.scheduledQty }}</span>
              <el-tag
                v-if="order.executionStatus === 'terminated'"
                type="danger"
                size="small"
                effect="plain"
                class="exec-status-tag"
              >
                已终止
              </el-tag>
            </div>
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
        <!-- 工单基础信息 -->
        <el-card shadow="never" class="detail-header-card">
          <div class="detail-header">
            <div class="detail-title">
              {{ selectedOrder.workOrderNo }} / {{ selectedOrder.workOrderName }}
            </div>
            <el-link type="primary" class="expand-btn" @click="toggleInfoCollapse">
              {{ infoCollapsed ? '展开详情 ∨' : '收起详情 ∧' }}
            </el-link>
          </div>

          <el-collapse-transition>
            <div v-show="!infoCollapsed">
              <el-form
                ref="basicInfoForm"
                :model="selectedOrder"
                label-width="72px"
                class="basic-info-form"
              >
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item label="产品名称">
                      <span class="read-only-text">{{ selectedOrder.productName }}</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="工作中心" prop="workCenter">
                      <el-select
                        v-model="selectedOrder.workCenter"
                        placeholder="请选择工作中心"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="opt in workCenterOptions"
                          :key="opt.value"
                          :label="opt.label"
                          :value="opt.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="BOM">
                      <el-select
                        v-model="selectedOrder.bom"
                        filterable
                        placeholder="请选择BOM"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="opt in bomOptions"
                          :key="opt.value"
                          :label="opt.label"
                          :value="opt.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item label="预入仓库">
                      <el-select
                        v-model="selectedOrder.warehouse"
                        placeholder="请选择预入仓库"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="opt in warehouseOptions"
                          :key="opt.value"
                          :label="opt.label"
                          :value="opt.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="紧急度">
                      <el-select
                        v-model="selectedOrder.urgency"
                        placeholder="请选择紧急度"
                        style="width: 100%"
                      >
                        <el-option label="紧急" value="urgent" />
                        <el-option label="普通" value="normal" />
                        <el-option label="不紧急" value="low" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="计划日期">
                      <el-date-picker
                        v-model="selectedOrder.planDateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <el-form-item label="备注">
                      <el-input
                        v-model="selectedOrder.remark"
                        type="textarea"
                        :rows="1"
                        placeholder="请输入备注"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-collapse-transition>
        </el-card>

        <!-- 详情 Tab 区域 -->
        <el-card shadow="never" class="detail-tabs-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane
              v-if="selectedOrder.status === 'pending'"
              label="工单下发"
              name="dispatch"
            >
              <DispatchTab
                :work-order="selectedOrder"
                @dispatch="handleDispatch"
                @dispatch-and-start="handleDispatchAndStart"
                @cancel="handleCancelDispatch"
              />
            </el-tab-pane>
            <el-tab-pane label="工单详情" name="detail">
              <PlaceholderPage />
            </el-tab-pane>
            <el-tab-pane label="EBOM" name="ebom">
              <PlaceholderPage />
            </el-tab-pane>
            <el-tab-pane label="当前BOM" name="current-bom">
              <PlaceholderPage />
            </el-tab-pane>
            <el-tab-pane label="任务列表" name="task-list">
              <PlaceholderPage />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>

      <!-- 未选中时的提示 -->
      <div class="detail-empty" v-else>
        <el-empty description="请从左侧选择一条工单" />
      </div>
    </div>

    <!-- 新增工单弹窗 -->
    <CreateWorkOrderDialog
      v-model="createDialogVisible"
      @success="handleCreateSuccess"
    />

    <!-- 调整紧急度弹窗 -->
    <el-dialog
      v-model="urgencyDialogVisible"
      title="调整紧急度"
      width="360px"
      append-to-body
    >
      <el-form label-width="80px">
        <el-form-item label="紧急度">
          <el-select v-model="newUrgency" placeholder="请选择" style="width: 100%">
            <el-option label="紧急" value="urgent" />
            <el-option label="普通" value="normal" />
            <el-option label="不紧急" value="low" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="urgencyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmChangeUrgency">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, RefreshLeft, Plus, Document, Download, Upload, TopRight,
  MoreFilled, Warning, VideoPause, CircleClose, CircleCheck
} from '@element-plus/icons-vue'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'
import DispatchTab from './components/DispatchTab.vue'
import CreateWorkOrderDialog from './components/CreateWorkOrderDialog.vue'

// ========== 搜索表单 ==========
const filterForm = reactive({
  workOrderNo: '',
  workOrderName: '',
  salesOrderNo: '',
  status: '',
  workOrderType: '',
  workCenter: '',
})

// ========== 分页 ==========
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const loading = ref(false)
const activeTab = ref('dispatch')
const selectedOrder = ref(null)
const infoCollapsed = ref(false)
const createDialogVisible = ref(false)
const urgencyDialogVisible = ref(false)
const currentEditOrder = ref(null)
const newUrgency = ref('normal')

// ========== 下拉选项 ==========
const workCenterOptions = [
  { value: 'default_factory', label: '默认工厂' },
  { value: 'workshop_1', label: '机加车间一' },
  { value: 'workshop_2', label: '机加车间二' },
  { value: 'assembly_shop', label: '装配车间' },
]

const warehouseOptions = [
  { value: 'machine_warehouse', label: '机加工现场仓' },
  { value: 'assembly_warehouse', label: '装配车间仓库' },
  { value: 'raw_material', label: '原材料仓库' },
  { value: 'semi_finished', label: '半成品仓库' },
  { value: 'finished_goods', label: '成品仓库' },
]

const bomOptions = [
  { value: 'BOM-2026-001', label: 'BOM-2026-001 电机壳总成' },
  { value: 'BOM-2026-002', label: 'BOM-2026-002 泵体外壳' },
  { value: 'BOM-2026-003', label: 'BOM-2026-003 叶轮组件' },
  { value: 'BOM-2026-004', label: 'BOM-2026-004 轴承座' },
]

// ========== 状态映射 ==========
const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    executing: '',
    completed: 'success',
  }
  return map[status] || 'info'
}

const getUrgencyType = (urgency) => {
  const map = { urgent: 'danger', normal: '', low: 'info' }
  return map[urgency] || ''
}

const getUrgencyLabel = (urgency) => {
  const map = { urgent: '紧急', normal: '普通', low: '不紧急' }
  return map[urgency] || urgency
}

const getDefaultTab = (status) => {
  return status === 'pending' ? 'dispatch' : 'detail'
}

// ========== 模拟工单数据（TODO: 替换为真实接口） ==========
const workOrderList = ref([
  {
    id: 1,
    workOrderNo: 'WO-2026-0001',
    workOrderName: '电机壳260519生产工单',
    salesOrderNo: 'SO-2026-123',
    status: 'pending',
    statusText: '待下发',
    workOrderType: '机加工',
    workCenter: 'default_factory',
    scheduledQty: 100,
    productName: '电机壳',
    productCode: 'P-260519',
    bom: 'BOM-2026-001',
    warehouse: 'machine_warehouse',
    urgency: 'normal',
    executionStatus: 'normal',
    planDateRange: ['2026-05-19', '2026-05-24'],
    remark: '',
  },
  {
    id: 2,
    workOrderNo: 'WO-2026-0002',
    workOrderName: '泵体外壳加工工单',
    salesOrderNo: 'SO-2026-124',
    status: 'executing',
    statusText: '执行中',
    workOrderType: '机加工',
    workCenter: 'workshop_1',
    scheduledQty: 50,
    productName: '泵体外壳',
    productCode: 'P-260520',
    bom: 'BOM-2026-002',
    warehouse: 'assembly_warehouse',
    urgency: 'urgent',
    executionStatus: 'normal',
    planDateRange: ['2026-05-20', '2026-05-25'],
    remark: '客户加急',
  },
  {
    id: 3,
    workOrderNo: 'WO-2026-0003',
    workOrderName: '叶轮精加工工单',
    salesOrderNo: 'SO-2026-125',
    status: 'completed',
    statusText: '完成',
    workOrderType: '机加工',
    workCenter: 'workshop_2',
    scheduledQty: 200,
    productName: '叶轮',
    productCode: 'P-260521',
    bom: 'BOM-2026-003',
    warehouse: 'finished_goods',
    urgency: 'normal',
    executionStatus: 'terminated',
    planDateRange: ['2026-05-15', '2026-05-18'],
    remark: '',
  },
  {
    id: 4,
    workOrderNo: 'WO-2026-0004',
    workOrderName: '轴承座铸造工单',
    salesOrderNo: 'SO-2026-126',
    status: 'pending',
    statusText: '待下发',
    workOrderType: '铸造',
    workCenter: 'default_factory',
    scheduledQty: 80,
    productName: '轴承座',
    productCode: 'P-260522',
    bom: 'BOM-2026-004',
    warehouse: 'machine_warehouse',
    urgency: 'low',
    executionStatus: 'normal',
    planDateRange: ['2026-05-25', '2026-05-30'],
    remark: '',
  },
])

// ========== 事件处理 ==========
const handleOrderSelect = (order) => {
  selectedOrder.value = order
  // 根据工单状态设置默认Tab
  activeTab.value = getDefaultTab(order.status)
}

const toggleInfoCollapse = () => {
  infoCollapsed.value = !infoCollapsed.value
}

const fetchOrderList = () => {
  // TODO: 调用 productionApi.getWorkOrderPage(params)
  pagination.total = workOrderList.value.length
}

const handleSearch = () => {
  pagination.page = 1
  fetchOrderList()
}

const handleReset = () => {
  Object.assign(filterForm, {
    workOrderNo: '',
    workOrderName: '',
    salesOrderNo: '',
    status: '',
    workOrderType: '',
    workCenter: '',
  })
  handleSearch()
}

// 下发工单
const handleDispatch = () => {
  // TODO: 调用下发接口
  selectedOrder.value.status = 'executing'
  selectedOrder.value.statusText = '执行中'
  activeTab.value = 'detail'
}

// 下发并开始
const handleDispatchAndStart = () => {
  // TODO: 调用下发并开始接口
  selectedOrder.value.status = 'executing'
  selectedOrder.value.statusText = '执行中'
  activeTab.value = 'detail'
}

// 取消下发
const handleCancelDispatch = () => {
  // TODO: 取消操作
}

// ========== 新增工单 ==========
const openCreateDialog = () => {
  createDialogVisible.value = true
}

const handleCreateSuccess = (newOrder) => {
  workOrderList.value.unshift(newOrder)
  selectedOrder.value = newOrder
  activeTab.value = getDefaultTab(newOrder.status)
  pagination.total = workOrderList.value.length
}

// ========== 批量操作 ==========
const handleBatchCommand = (command) => {
  if (command === 'batch-import') {
    // TODO: 批量导入
  } else if (command === 'batch-export') {
    // TODO: 批量导出
  }
}

const handleBatchDispatch = () => {
  // TODO: 批量下发（需先勾选工单）
}

// ========== 卡片操作菜单 ==========
const handleCardCommand = (command, order) => {
  currentEditOrder.value = order
  if (command === 'urgency') {
    newUrgency.value = order.urgency
    urgencyDialogVisible.value = true
  } else if (command === 'pause') {
    ElMessageBox.confirm(`确定暂停工单「${order.workOrderNo}」？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      order.status = 'paused'
      order.statusText = '已暂停'
      ElMessage.success('工单已暂停')
    }).catch(() => {})
  } else if (command === 'terminate') {
    ElMessageBox.confirm(`确定终止工单「${order.workOrderNo}」？终止后不可恢复。`, '警告', {
      confirmButtonText: '确定终止',
      cancelButtonText: '取消',
      type: 'danger',
    }).then(() => {
      order.executionStatus = 'terminated'
      ElMessage.success('工单已终止')
    }).catch(() => {})
  } else if (command === 'complete') {
    ElMessageBox.confirm(`确定将工单「${order.workOrderNo}」标记为完成？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      order.status = 'completed'
      order.statusText = '完成'
      ElMessage.success('工单已完成')
    }).catch(() => {})
  }
}

const confirmChangeUrgency = () => {
  if (currentEditOrder.value) {
    currentEditOrder.value.urgency = newUrgency.value
    ElMessage.success('紧急度已调整')
  }
  urgencyDialogVisible.value = false
}

// ========== 生命周期 ==========
onMounted(() => {
  pagination.total = workOrderList.value.length
  // 默认选中第一条
  if (workOrderList.value.length > 0) {
    selectedOrder.value = workOrderList.value[0]
    activeTab.value = getDefaultTab(selectedOrder.value.status)
  }
})

// 监听选中工单变化，动态调整tab
watch(
  () => selectedOrder.value?.status,
  (newStatus) => {
    if (newStatus && newStatus !== 'pending' && activeTab.value === 'dispatch') {
      activeTab.value = 'detail'
    }
  }
)
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
  width: 260px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
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
  padding: 8px 10px;
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

.filter-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 4px;
  border-top: 1px solid var(--border-color);
  margin-top: 4px;
}

.toolbar-btns {
  display: flex;
  gap: 8px;
}

.search-btns {
  display: flex;
  gap: 8px;
}

.order-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 4px;
}

.order-card-tags {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.order-more-btn {
  color: #999;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  transition: all 0.2s;
}

.order-more-btn:hover {
  color: #1677ff;
  background: #f0f7ff;
}

.order-no {
  font-size: 12px;
  color: var(--text-regular);
  margin-bottom: 2px;
  font-weight: 500;
}

.order-name {
  font-size: 12px;
  color: var(--text-primary);
  margin-bottom: 2px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-info {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.urgency-tag {
  transform: scale(0.9);
  transform-origin: left center;
}

.exec-status-tag {
  transform: scale(0.85);
  transform-origin: right center;
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

:deep(.detail-header-card .el-card__body) {
  padding: 10px 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.detail-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.basic-info-form {
  margin-top: 0;
}

.basic-info-form :deep(.el-form-item) {
  margin-bottom: 6px !important;
}

.basic-info-form :deep(.el-form-item__label) {
  line-height: 28px;
  padding-right: 6px;
}

.basic-info-form :deep(.el-form-item__content) {
  line-height: 28px;
}

.basic-info-form :deep(.el-input__wrapper),
.basic-info-form :deep(.el-select .el-input__wrapper) {
  min-height: 28px;
}

.basic-info-form :deep(.el-textarea__inner) {
  min-height: 28px !important;
}

.read-only-text {
  color: var(--text-regular);
  line-height: 28px;
  font-size: 13px;
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