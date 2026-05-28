<template>
  <div class="work-tab">
    <!-- 工作项表格 -->
    <el-table
      :data="workItems"
      border
      size="small"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag
            :type="statusMap[row.status]?.type"
            size="small"
          >
            {{ statusMap[row.status]?.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="productName" label="产品名称" min-width="120" />
      <el-table-column prop="productCode" label="产品编码" width="120" />
      <el-table-column prop="productAttr" label="产品属性" width="100" />
      <el-table-column prop="productType" label="产品类型" width="90" />
      <el-table-column prop="model" label="型号" width="110" show-overflow-tooltip />
      <el-table-column prop="specAttr" label="规格属性" width="90" />
      <el-table-column prop="deliveryDate" label="交付日期" width="150" />
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default>
          <el-link type="primary" size="small">收起</el-link>
          <el-divider direction="vertical" />
          <el-link type="danger" size="small">终止</el-link>
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部操作区 -->
    <div class="work-actions">
      <div class="plan-date-form">
        <el-form inline size="small">
          <el-form-item label="* 计划装发日期">
            <el-date-picker
              v-model="planForm.startDate"
              type="date"
              placeholder="选择日期"
              style="width: 140px"
            />
          </el-form-item>
          <el-form-item label="* 计划完成日期">
            <el-date-picker
              v-model="planForm.endDate"
              type="date"
              placeholder="选择日期"
              style="width: 140px"
            />
          </el-form-item>
          <el-form-item label="* 调整紧急度">
            <el-select v-model="planForm.urgency" placeholder="紧急" style="width: 100px">
              <el-option label="紧急" value="urgent" />
              <el-option label="普通" value="normal" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="action-btns">
        <el-button type="primary" @click="handleGeneratePurchase">生成采购申请</el-button>
        <el-button type="success" @click="handleGenerateWorkOrder">生成加工工单</el-button>
        <el-button type="warning" @click="handleGenerateOutsource">生成外协工单</el-button>
      </div>
    </div>

    <!-- BOM 物料表 -->
    <div class="bom-path" v-if="workItems.length > 0">
      <span class="bom-breadcrumb">
        潜水电机 / 潜水电机 / EB-2026-0003
      </span>
    </div>
    <el-table
      v-if="workItems.length > 0"
      :data="bomItems"
      border
      size="small"
      style="width: 100%; margin-top: 8px"
    >
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-link :type="row.statusType" size="small">{{ row.statusText }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="materialName" label="物料名称" min-width="120" />
      <el-table-column prop="materialCode" label="物料编码" width="120" />
      <el-table-column prop="spec" label="规格/型号" width="120" show-overflow-tooltip />
      <el-table-column prop="specAttr" label="规格属性" width="90" />
      <el-table-column prop="material" label="材质" width="80" />
      <el-table-column prop="materialType" label="物料类型" width="90" />
      <el-table-column prop="unitUsage" label="单位用量" width="80" align="right" />
      <el-table-column prop="unit" label="计量单位" width="80" align="center" />
      <el-table-column prop="source" label="来源" width="60" align="center" />
    </el-table>

    <!-- 生成加工工单弹窗 -->
    <GenerateWorkOrderDialog
      v-model="workOrderDialogVisible"
      :order="order"
      @save="handleSaveWorkOrder"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import GenerateWorkOrderDialog from './GenerateWorkOrderDialog.vue'

defineProps({
  order: Object,
})

const loading = ref(false)
const workOrderDialogVisible = ref(false)

const statusMap = {
  partial: { label: '部分下达', type: 'warning' },
  pending: { label: '待下达', type: 'info' },
  done: { label: '已完成', type: 'success' },
  ongoing: { label: '进行中', type: 'primary' },
  waiting: { label: '待下达', type: '' },
}

// 模拟工作项数据
const workItems = ref([
  {
    id: 1,
    status: 'partial',
    productName: '潜水电机',
    productCode: '22.01.03.006',
    productAttr: '标准产品',
    productType: '22.01.03.2...',
    model: 'YQST250-...',
    specAttr: '',
    deliveryDate: '2026-04-13 00:00:00',
  },
])

// 模拟 BOM 物料
const bomItems = ref([
  {
    id: 1, statusText: '进行中', statusType: 'primary',
    materialName: '下导轴承组装', materialCode: '31.1.031.0023',
    spec: 'YQST250-75...', specAttr: '', material: '', materialType: '',
    unitUsage: 1, unit: '件', source: '自',
  },
  {
    id: 2, statusText: '待下达', statusType: 'warning',
    materialName: '下导轴...', materialCode: '31.3.312.0019',
    spec: 'YQST250-75...', specAttr: '', material: '毛胚', materialType: '',
    unitUsage: 1, unit: '件', source: '自',
  },
  {
    id: 3, statusText: '待下达', statusType: 'warning',
    materialName: '导轴承(左)', materialCode: '4.341.033',
    spec: '86×68×50', specAttr: '', material: '', materialType: '',
    unitUsage: 1, unit: '件', source: '外',
  },
  {
    id: 4, statusText: '待下达', statusType: 'warning',
    materialName: '导轴承(右)', materialCode: '4.341.034',
    spec: '86×68×50', specAttr: '', material: '', materialType: '',
    unitUsage: 1, unit: '件', source: '外',
  },
])

const planForm = reactive({
  startDate: new Date('2026-04-13'),
  endDate: new Date('2026-04-13'),
  urgency: 'urgent',
})

const handleGeneratePurchase = () => {
  ElMessage.success('已生成采购申请')
  // TODO: planningApi.generatePurchaseRequest(order.id)
}

const handleGenerateWorkOrder = () => {
  workOrderDialogVisible.value = true
}

const handleSaveWorkOrder = (data) => {
  ElMessage.success(`已保存 ${data.length} 条工单记录`)
}

const handleGenerateOutsource = () => {
  ElMessage.success('已生成外协工单')
  // TODO: planningApi.generateOutsourceOrder(order.id)
}
</script>

<style scoped>
.work-tab {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.work-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 4px 0;
}

:deep(.work-actions .el-form-item) {
  margin-bottom: 0;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.bom-path {
  padding: 4px 0;
}

.bom-breadcrumb {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
