<template>
  <div class="dispatch-tab">
    <!-- 工序表格 -->
    <div class="table-wrapper">
      <el-table :data="processList" border size="small" class="process-table">
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="processName" label="工序名称" width="120" align="center">
          <template #default="{ row }">
            <div class="process-name-cell">
              <el-icon class="process-icon"><Setting /></el-icon>
              <span class="process-name">{{ row.processName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="processCode" label="工序编码" width="110" align="center" />

        <el-table-column label="选择执行人" width="160" align="center">
          <template #default="{ row }">
            <el-button
              v-if="!row.executor"
              type="primary"
              link
              size="small"
              @click="openExecutorDialog(row)"
            >
              请选择执行人
            </el-button>
            <el-tag
              v-else
              type="success"
              size="small"
              closable
              @close="clearExecutor(row)"
              @click="openExecutorDialog(row)"
              style="cursor: pointer"
            >
              {{ row.executor.name }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="投料信息" min-width="360">
          <template #default="{ row }">
            <div v-if="row.hasMaterialInput" class="material-input-area">
              <div
                v-for="(item, index) in row.materialInputs"
                :key="index"
                class="material-input-row"
              >
                <el-select
                  v-model="item.materialId"
                  filterable
                  placeholder="选择物料"
                  size="small"
                  style="width: 180px"
                  class="material-select"
                >
                  <el-option
                    v-for="mat in materialOptions"
                    :key="mat.id"
                    :label="`${mat.code} ${mat.name}`"
                    :value="mat.id"
                  />
                </el-select>
                <el-input-number
                  v-model="item.qty"
                  :min="0"
                  :precision="2"
                  :step="1"
                  size="small"
                  style="width: 100px"
                  placeholder="数量"
                />
                <el-button
                  type="danger"
                  link
                  size="small"
                  :icon="Delete"
                  @click="removeMaterialInput(row, index)"
                >
                  删除
                </el-button>
              </div>
              <el-button
                type="primary"
                link
                size="small"
                :icon="Plus"
                @click="addMaterialInput(row)"
              >
                增加投料
              </el-button>
            </div>
            <span v-else class="no-material">-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 底部操作按钮 -->
    <div class="dispatch-actions">
      <el-button type="primary" @click="handleDispatch">下发</el-button>
      <el-button type="primary" @click="handleDispatchAndStart">下发并开始</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </div>

    <!-- 选择执行人弹窗 -->
    <SelectExecutorDialog
      v-model="executorDialogVisible"
      @confirm="onExecutorSelected"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Setting } from '@element-plus/icons-vue'
import SelectExecutorDialog from './SelectExecutorDialog.vue'

const props = defineProps({
  workOrder: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['dispatch', 'dispatch-and-start', 'cancel'])

// 当前正在编辑执行人的工序
const currentProcess = ref(null)
const executorDialogVisible = ref(false)

// 物料选项（TODO: 替换为真实接口）
const materialOptions = [
  { id: 'M001', code: 'ST-Q235-001', name: '钢板Q235' },
  { id: 'M002', code: 'ST-304-001', name: '不锈钢304' },
  { id: 'M003', code: 'AL-6061-001', name: '铝合金6061' },
  { id: 'M004', code: 'CU-H62-001', name: '黄铜H62' },
  { id: 'M005', code: 'IR-HT200-001', name: '灰铸铁HT200' },
  { id: 'M006', code: 'ST-45-001', name: '优质碳素钢45#' },
  { id: 'M007', code: 'AL-7075-001', name: '铝合金7075' },
]

// 工序列表（TODO: 替换为真实接口，根据工单ID获取）
const processList = ref([
  {
    id: 1,
    seq: 1,
    processCode: 'CUT-001',
    processName: '裁板',
    hasMaterialInput: true,
    executor: null,
    materialInputs: [{ materialId: 'M001', qty: 10 }],
  },
  {
    id: 2,
    seq: 2,
    processCode: 'ROL-001',
    processName: '卷制',
    hasMaterialInput: true,
    executor: null,
    materialInputs: [{ materialId: 'M002', qty: 5 }],
  },
  {
    id: 3,
    seq: 3,
    processCode: 'WLD-001',
    processName: '焊接',
    hasMaterialInput: true,
    executor: null,
    materialInputs: [],
  },
  {
    id: 4,
    seq: 4,
    processCode: 'QC-001',
    processName: '质检',
    hasMaterialInput: false,
    executor: null,
    materialInputs: [],
  },
  {
    id: 5,
    seq: 5,
    processCode: 'STK-001',
    processName: '入库',
    hasMaterialInput: false,
    executor: null,
    materialInputs: [],
  },
])

// 打开选择执行人弹窗
const openExecutorDialog = (process) => {
  currentProcess.value = process
  executorDialogVisible.value = true
}

// 选择执行人后回调
const onExecutorSelected = (employee) => {
  if (currentProcess.value) {
    currentProcess.value.executor = employee
  }
}

// 清除执行人
const clearExecutor = (process) => {
  process.executor = null
}

// 增加投料
const addMaterialInput = (process) => {
  process.materialInputs.push({
    materialId: '',
    qty: 0,
  })
}

// 删除投料
const removeMaterialInput = (process, index) => {
  process.materialInputs.splice(index, 1)
}

// 下发
const handleDispatch = () => {
  // 校验：每道工序都必须选择执行人
  const missingExecutor = processList.value.filter((p) => !p.executor)
  if (missingExecutor.length > 0) {
    const names = missingExecutor.map((p) => p.processName).join('、')
    ElMessage.warning(`请为以下工序选择执行人：${names}`)
    return
  }

  // 校验：配置了投料的工序必须至少有一条投料记录
  const missingMaterial = processList.value.filter(
    (p) => p.hasMaterialInput && p.materialInputs.length === 0
  )
  if (missingMaterial.length > 0) {
    const names = missingMaterial.map((p) => p.processName).join('、')
    ElMessage.warning(`请为以下工序添加投料信息：${names}`)
    return
  }

  emit('dispatch')
  ElMessage.success('工单下发成功')
}

// 下发并开始
const handleDispatchAndStart = () => {
  // 同样校验
  const missingExecutor = processList.value.filter((p) => !p.executor)
  if (missingExecutor.length > 0) {
    const names = missingExecutor.map((p) => p.processName).join('、')
    ElMessage.warning(`请为以下工序选择执行人：${names}`)
    return
  }

  const missingMaterial = processList.value.filter(
    (p) => p.hasMaterialInput && p.materialInputs.length === 0
  )
  if (missingMaterial.length > 0) {
    const names = missingMaterial.map((p) => p.processName).join('、')
    ElMessage.warning(`请为以下工序添加投料信息：${names}`)
    return
  }

  emit('dispatch-and-start')
  ElMessage.success('工单下发并开始成功')
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.dispatch-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}

.process-table {
  width: 100%;
}

.process-name-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.process-icon {
  color: #1677ff;
  font-size: 14px;
}

.process-name {
  font-weight: 500;
  color: var(--text-primary);
}

/* 投料信息区域 */
.material-input-area {
  padding: 4px 0;
}

.material-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.material-input-row:last-child {
  margin-bottom: 4px;
}

.material-select :deep(.el-input__wrapper) {
  padding-left: 8px;
}

.no-material {
  color: var(--text-secondary);
  display: inline-block;
  padding: 4px 0;
}

/* 底部操作 */
.dispatch-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 0 0;
  border-top: 1px solid var(--border-color);
  margin-top: 10px;
}
</style>