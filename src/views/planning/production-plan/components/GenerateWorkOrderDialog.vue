<template>
  <el-dialog
    v-model="visible"
    title=""
    width="92vw"
    :close-on-click-modal="false"
    class="work-order-dialog"
    destroy-on-close
  >
    <template #header>
      <div class="dialog-header">
        <div class="dialog-title">生成加工工单 ({{ tableData.length }}条)</div>
      </div>
    </template>

    <!-- 表格工具栏 -->
    <div class="table-toolbar">
      <span class="toolbar-hint">
        提示：拖动表头右侧边线可调整列宽，单击单元格可直接编辑
      </span>
      <el-button
        size="small"
        plain
        icon="Setting"
        @click="showColumnDrawer = true"
      >
        列设置
      </el-button>
    </div>

    <!-- 扁平合并表：每行 = 一条物料明细 -->
    <div class="table-wrapper">
      <el-table
        ref="tableRef"
        :data="tableData"
        border
        size="small"
        height="calc(80vh - 160px)"
        row-key="rowKey"
        show-summary
        :summary-method="getSummaries"
        :cell-class-name="cellClassName"
        :header-cell-class-name="headerCellClassName"
        @cell-dblclick="handleCellDblClick"
      >
        <el-table-column
          v-if="columnMap.index.visible"
          type="index"
          label="序号"
          :width="columnMap.index.width"
          align="center"
        />

        <el-table-column
          v-if="columnMap.productName.visible"
          prop="productName"
          label="生产品名"
          :width="columnMap.productName.width"
          :min-width="130"
          show-overflow-tooltip
        />

        <el-table-column
          v-if="columnMap.materialCode.visible"
          prop="materialCode"
          label="编码"
          :width="columnMap.materialCode.width"
          :min-width="115"
          show-overflow-tooltip
        />

        <el-table-column
          v-if="columnMap.modelSpec.visible"
          prop="modelSpec"
          label="规格型号"
          :width="columnMap.modelSpec.width"
          :min-width="120"
          show-overflow-tooltip
        />

        <el-table-column
          v-if="columnMap.specAttr.visible"
          prop="specAttr"
          label="规格属性"
          :width="columnMap.specAttr.width"
          :min-width="80"
        />

        <el-table-column
          v-if="columnMap.material.visible"
          prop="material"
          label="材质"
          :width="columnMap.material.width"
          :min-width="55"
          align="center"
        />

        <el-table-column
          v-if="columnMap.bom.visible"
          prop="bom"
          label="BOM"
          :width="columnMap.bom.width"
          :min-width="80"
          align="center"
        />

        <el-table-column
          v-if="columnMap.processRoute.visible"
          label="工艺路线"
          :width="columnMap.processRoute.width"
          :min-width="130"
          :sortable="columnMap.processRoute.sortable ? 'custom' : false"
        >
          <template #default="{ row }">
            <el-select
              v-if="isEditing(row, 'processRoute')"
              v-model="editingRow.processRoute"
              size="small"
              placeholder="请选择工艺路线"
              filterable
              style="width: 100%"
              @change="handleEditChange(row)"
              @blur="finishEdit()"
            >
              <el-option label="铸造件加工路线" value="casting_route" />
              <el-option label="机加标准路线" value="machining_standard" />
              <el-option label="精加工路线" value="precision_route" />
              <el-option label="装配路线" value="assembly_route" />
            </el-select>
            <span v-else class="editable-cell" :class="{ empty: !row.processRoute }" @click.stop="startEdit(row, 'processRoute')">
              {{ processRouteMap[row.processRoute] || row.processRoute || '请选择' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.workCenter.visible"
          label="工作中心"
          :width="columnMap.workCenter.width"
          :min-width="120"
          :sortable="columnMap.workCenter.sortable ? 'custom' : false"
        >
          <template #default="{ row }">
            <el-select
              v-if="isEditing(row, 'workCenter')"
              v-model="editingRow.workCenter"
              size="small"
              placeholder="请选择"
              filterable
              style="width: 100%"
              @change="handleEditChange(row)"
              @blur="finishEdit()"
            >
              <el-option label="默认工厂" value="default_factory" />
              <el-option label="机加车间一" value="workshop_1" />
              <el-option label="机加车间二" value="workshop_2" />
              <el-option label="装配车间" value="assembly_shop" />
            </el-select>
            <span v-else class="editable-cell" :class="{ empty: !row.workCenter }" @click.stop="startEdit(row, 'workCenter')">
              {{ workCenterMap[row.workCenter] || row.workCenter || '请选择' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.responsible.visible"
          label="负责人"
          :width="columnMap.responsible.width"
          :min-width="90"
          :sortable="columnMap.responsible.sortable ? 'custom' : false"
        >
          <template #default="{ row }">
            <el-select
              v-if="isEditing(row, 'responsible')"
              v-model="editingRow.responsible"
              size="small"
              placeholder="请选择"
              filterable
              style="width: 100%"
              @change="handleEditChange(row)"
              @blur="finishEdit()"
            >
              <el-option label="孙翠丽" value="孙翠丽" />
              <el-option label="张三" value="张三" />
              <el-option label="李四" value="李四" />
              <el-option label="王五" value="王五" />
              <el-option label="赵六" value="赵六" />
            </el-select>
            <span v-else class="editable-cell" :class="{ empty: !row.responsible }" @click.stop="startEdit(row, 'responsible')">
              {{ row.responsible || '请选择' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.stockQty.visible"
          prop="stockQty"
          label="库存数量"
          :width="columnMap.stockQty.width"
          :min-width="75"
          align="right"
        >
          <template #default="{ row }">
            <span>{{ row.stockQty ?? '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.availableQty.visible"
          prop="availableQty"
          label="可用库存"
          :width="columnMap.availableQty.width"
          :min-width="75"
          align="right"
        >
          <template #default="{ row }">
            <span :class="{ 'warn-text': row.availableQty !== undefined && Number(row.availableQty) <= 0 }">
              {{ row.availableQty ?? '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.inTransitQty.visible"
          prop="inTransitQty"
          label="在途数量"
          :width="columnMap.inTransitQty.width"
          :min-width="75"
          align="right"
        >
          <template #default="{ row }">
            <span>{{ row.inTransitQty ?? '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.demandQty.visible"
          prop="demandQty"
          label="需求数"
          :width="columnMap.demandQty.width"
          :min-width="70"
          align="right"
        >
          <template #default="{ row }">
            <span class="bold-text">{{ row.demandQty ?? '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.gapQty.visible"
          prop="gapQty"
          label="缺口数"
          :width="columnMap.gapQty.width"
          :min-width="70"
          align="right"
        >
          <template #default="{ row }">
            <span :class="{ 'danger-text': row.gapQty && Number(row.gapQty) > 0 }">
              {{ row.gapQty ?? '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.planQty.visible"
          label="计划数量"
          :width="columnMap.planQty.width"
          :min-width="85"
          align="right"
        >
          <template #default="{ row }">
            <el-input-number
              v-if="isEditing(row, 'planQty')"
              v-model="editingRow.planQty"
              :min="0"
              :step="1"
              size="small"
              controls-position="right"
              style="width: 90px"
              @change="handleEditChange(row)"
              @blur="finishEdit()"
            />
            <span v-else class="editable-cell bold-text" @click.stop="startEdit(row, 'planQty')">
              {{ row.planQty ?? '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.unit.visible"
          label="计量单位"
          :width="columnMap.unit.width"
          :min-width="75"
          align="center"
        >
          <template #default="{ row }">
            <el-select
              v-if="isEditing(row, 'unit')"
              v-model="editingRow.unit"
              size="small"
              placeholder="请选择"
              style="width: 100%"
              @change="handleEditChange(row)"
              @blur="finishEdit()"
            >
              <el-option label="件" value="件" />
              <el-option label="个" value="个" />
              <el-option label="套" value="套" />
              <el-option label="kg" value="kg" />
              <el-option label="m" value="m" />
            </el-select>
            <span v-else class="editable-cell" @click.stop="startEdit(row, 'unit')">
              {{ row.unit || '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.warehouse.visible"
          label="预入仓库"
          :width="columnMap.warehouse.width"
          :min-width="120"
          :sortable="columnMap.warehouse.sortable ? 'custom' : false"
        >
          <template #default="{ row }">
            <el-select
              v-if="isEditing(row, 'warehouse')"
              v-model="editingRow.warehouse"
              size="small"
              placeholder="请选择"
              filterable
              style="width: 100%"
              @change="handleEditChange(row)"
              @blur="finishEdit()"
            >
              <el-option label="机加现场场仓" value="machine_warehouse" />
              <el-option label="装配车间仓库" value="assembly_warehouse" />
              <el-option label="原材料仓库" value="raw_material" />
              <el-option label="半成品仓库" value="semi_finished" />
              <el-option label="成品仓库" value="finished_goods" />
            </el-select>
            <span v-else class="editable-cell" :class="{ empty: !row.warehouse }" @click.stop="startEdit(row, 'warehouse')">
              {{ warehouseMap[row.warehouse] || row.warehouse || '请选择' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.urgency.visible"
          label="紧急度"
          :width="columnMap.urgency.width"
          :min-width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-select
              v-if="isEditing(row, 'urgency')"
              v-model="editingRow.urgency"
              size="small"
              style="width: 100%"
              @change="handleEditChange(row)"
              @blur="finishEdit()"
            >
              <el-option label="紧急" value="urgent" />
              <el-option label="普通" value="normal" />
              <el-option label="不紧急" value="low" />
            </el-select>
            <span v-else class="editable-cell" @click.stop="startEdit(row, 'urgency')">
              <el-tag size="small" :type="urgencyMap[row.urgency]?.type">{{ urgencyMap[row.urgency]?.label || '-' }}</el-tag>
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.planTime.visible"
          label="计划时间"
          :width="columnMap.planTime.width"
          :min-width="180"
        >
          <template #default="{ row }">
            <el-date-picker
              v-if="isEditing(row, 'planTime')"
              v-model="editingRow.planTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="完成日期"
              size="small"
              style="width: 100%"
              @change="handleEditChange(row)"
              @blur="finishEdit()"
            />
            <span v-else class="editable-cell" @click.stop="startEdit(row, 'planTime')">
              {{ formatPlanTime(row.planTime) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="columnMap.remark.visible"
          label="备注"
          :width="columnMap.remark.width"
          :min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-input
              v-if="isEditing(row, 'remark')"
              v-model="editingRow.remark"
              type="textarea"
              :rows="1"
              autosize
              size="small"
              placeholder="请输入"
              @blur="handleEditChange(row)"
              @keyup.enter="handleEditChange(row)"
            />
            <span v-else class="editable-cell remark-cell" @click.stop="startEdit(row, 'remark')">
              {{ row.remark || '' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 底部操作 -->
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left"></div>
        <div class="footer-right">
          <el-button size="small" @click="visible = false">取消</el-button>
          <el-button type="primary" size="small" @click="handleSaveAndSubmit">保存 ({{ tableData.length }}条)</el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 列显隐设置侧边栏 -->
  <el-drawer
    v-model="showColumnDrawer"
    title="列显隐"
    size="380px"
    :with-header="true"
    :destroy-on-close="false"
    class="column-drawer"
  >
    <div class="column-setting-table">
      <div class="setting-header">
        <span class="sh-cell sh-name">列名</span>
        <span class="sh-cell sh-check">隐藏</span>
        <span class="sh-cell sh-check">冻结</span>
        <span class="sh-cell sh-check">过滤</span>
        <span class="sh-cell sh-check">排序</span>
      </div>
      <div
        v-for="col in columnList"
        :key="col.key"
        class="setting-row"
        :class="{ disabled: col.disabled }"
      >
        <span class="sh-cell sh-name">{{ col.label }}</span>
        <span class="sh-cell sh-check">
          <el-checkbox
            v-model="col.visible"
            :disabled="col.disabled"
            @change="handleColumnChange(col)"
          >
            <span style="display:none">隐藏</span>
          </el-checkbox>
        </span>
        <span class="sh-cell sh-check">
          <el-checkbox v-model="col.frozen" :disabled="true">
            <span style="display:none">冻结</span>
          </el-checkbox>
        </span>
        <span class="sh-cell sh-check">
          <el-checkbox v-model="col.filterable" :disabled="true">
            <span style="display:none">过滤</span>
          </el-checkbox>
        </span>
        <span class="sh-cell sh-check">
          <el-checkbox v-model="col.sortable" :disabled="true">
            <span style="display:none">排序</span>
          </el-checkbox>
        </span>
      </div>
    </div>
    <template #footer>
      <div class="drawer-footer">
        <el-button size="small" @click="handleResetColumns">恢复默认</el-button>
        <el-button size="small" type="primary" @click="showColumnDrawer = false">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** 选中的订单数据 */
  order: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'submit'])

const visible = ref(false)
const tableRef = ref(null)
const showColumnDrawer = ref(false)

// 编辑状态管理
const editingRowIndex = ref(-1)
const editingField = ref('')
const editingRow = ref({})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    loadTableData()
  }
}, { immediate: true })

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// ========== 映射表 ==========
const urgencyMap = {
  urgent: { label: '紧急', type: 'danger' },
  normal: { label: '普通', type: 'warning' },
  low: { label: '不紧急', type: 'info' },
}

const warehouseMap = {
  machine_warehouse: '机加现场场仓',
  assembly_warehouse: '装配车间仓库',
  raw_material: '原材料仓库',
  semi_finished: '半成品仓库',
  finished_goods: '成品仓库',
}

const workCenterMap = {
  default_factory: '默认工厂',
  workshop_1: '机加车间一',
  workshop_2: '机加车间二',
  assembly_shop: '装配车间',
}

const processRouteMap = {
  casting_route: '铸造件加工路线',
  machining_standard: '机加标准路线',
  precision_route: '精加工路线',
  assembly_route: '装配路线',
}

// ========== 列配置 ==========
const defaultColumnConfig = [
  { key: 'index', label: '序号', width: 55, visible: true, disabled: true, frozen: false, filterable: false, sortable: false },
  { key: 'productName', label: '生产品名', width: 130, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'materialCode', label: '编码', width: 115, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'modelSpec', label: '规格型号', width: 120, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'specAttr', label: '规格属性', width: 80, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'material', label: '材质', width: 55, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'bom', label: 'BOM', width: 80, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'processRoute', label: '工艺路线', width: 130, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'workCenter', label: '工作中心', width: 120, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'responsible', label: '负责人', width: 90, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'stockQty', label: '库存数量', width: 75, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'availableQty', label: '可用库存', width: 75, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'inTransitQty', label: '在途数量', width: 75, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'demandQty', label: '需求数', width: 70, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'gapQty', label: '缺口数', width: 70, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'planQty', label: '计划数量', width: 85, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'unit', label: '计量单位', width: 75, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'warehouse', label: '预入仓库', width: 120, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'urgency', label: '紧急度', width: 80, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'planTime', label: '计划时间', width: 180, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
  { key: 'remark', label: '备注', width: 150, visible: true, disabled: false, frozen: false, filterable: false, sortable: false },
]

const columnList = reactive(JSON.parse(JSON.stringify(defaultColumnConfig)))

const columnMap = reactive({})
defaultColumnConfig.forEach(col => {
  columnMap[col.key] = columnList.find(c => c.key === col.key)
})

function handleColumnChange(col) {
  // 确保至少有一列可见（序号列除外）
  const visibleCols = columnList.filter(c => c.visible && c.key !== 'index')
  if (visibleCols.length === 0 && col.key !== 'index') {
    // 不允许全部隐藏，恢复当前列的可见性
    nextTick(() => {
      col.visible = true
      ElMessage.warning('至少需要保留一列可见')
    })
  }
}

function handleResetColumns() {
  const defaults = JSON.parse(JSON.stringify(defaultColumnConfig))
  defaults.forEach(d => {
    const col = columnList.find(c => c.key === d.key)
    if (col) {
      col.visible = d.visible
      col.width = d.width
      col.frozen = d.frozen
      col.filterable = d.filterable
      col.sortable = d.sortable
    }
  })
  ElMessage.success('已恢复默认列设置')
}

// ========== 表格数据 ==========
const tableData = ref([])

function loadTableData() {
  // 所有数据添加 planTime 默认值：开始日期=今天，完成日期=今天+5天
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 5)
  const endStr = endDate.toISOString().split('T')[0]

  tableData.value = [
    {
      rowKey: 'wo1-m1',
      productName: '下导轴承座毛坯',
      materialCode: '31.1.031.0023',
      modelSpec: 'YQST250-750/4-...',
      specAttr: '标准',
      material: '钢',
      bom: '潜水电机',
      processRoute: 'machining_standard',
      workCenter: 'default_factory',
      responsible: '孙翠丽',
      stockQty: 12,
      availableQty: 8,
      inTransitQty: 4,
      demandQty: 20,
      gapQty: 8,
      planQty: 20,
      unit: '件',
      warehouse: 'machine_warehouse',
      urgency: 'normal',
      planTime: [todayStr, endStr],
      remark: '',
    },
    {
      rowKey: 'wo1-m2',
      productName: '下导轴承座毛坯',
      materialCode: '31.3.312.0019',
      modelSpec: 'YQST250-75/4-7',
      specAttr: '标准',
      material: '毛胚',
      bom: '潜水电机',
      processRoute: '',
      workCenter: '',
      responsible: '',
      stockQty: 50,
      availableQty: 30,
      inTransitQty: 10,
      demandQty: 100,
      gapQty: 60,
      planQty: null,
      unit: '件',
      warehouse: '',
      urgency: 'urgent',
      planTime: [todayStr, endStr],
      remark: '加急',
    },
    {
      rowKey: 'wo1-m3',
      productName: '下导轴承座毛坯',
      materialCode: '4.341.03',
      modelSpec: '86×68×...',
      specAttr: '左件',
      material: '钢',
      bom: '潜水电机',
      processRoute: '',
      workCenter: '',
      responsible: '',
      stockQty: 8,
      availableQty: 5,
      inTransitQty: 3,
      demandQty: 15,
      gapQty: 7,
      planQty: null,
      unit: '件',
      warehouse: '',
      urgency: 'normal',
      planTime: [todayStr, endStr],
      remark: '',
    },
  ]
}

// ========== 单元格编辑逻辑 ==========
function isEditing(row, field) {
  return editingRowIndex.value >= 0 &&
         editingField.value === field &&
         tableData.value[editingRowIndex.value]?.rowKey === row.rowKey
}

function startEdit(row, field) {
  editingRowIndex.value = tableData.value.findIndex(r => r.rowKey === row.rowKey)
  editingField.value = field
  editingRow.value = { ...row }
}

function finishEdit() {
  editingRowIndex.value = -1
  editingField.value = ''
  editingRow.value = {}
}

function handleEditChange(row) {
  if (editingRowIndex.value < 0) return
  const idx = editingRowIndex.value
  Object.assign(tableData.value[idx], editingRow.value)
  finishEdit()
}

// 双击进入编辑模式
function handleCellDblClick(row, column) {
  const fieldMap = {
    '工艺路线': 'processRoute',
    '工作中心': 'workCenter',
    '负责人': 'responsible',
    '计划数量': 'planQty',
    '计量单位': 'unit',
    '预入仓库': 'warehouse',
    '紧急度': 'urgency',
    '计划时间': 'planTime',
    '备注': 'remark',
  }
  const field = fieldMap[column.label]
  if (field) {
    startEdit(row, field)
  }
}

// 单元格样式
function cellClassName({ row, columnIndex }) {
  // 根据当前可见列动态计算可编辑列位置
  const visibleCols = columnList.filter(c => c.visible).map(c => c.key)
  const editableKeys = ['processRoute', 'workCenter', 'responsible', 'planQty', 'unit', 'warehouse', 'urgency', 'planTime', 'remark']
  const colKey = visibleCols[columnIndex]
  if (editableKeys.includes(colKey)) return 'cell-editable'
  return ''
}

function headerCellClassName({ columnIndex }) {
  const visibleCols = columnList.filter(c => c.visible).map(c => c.key)
  const colKey = visibleCols[columnIndex]
  return colKey ? `col-header col-header-${colKey}` : ''
}

// ========== 列宽拖拽 ==========
let resizing = false
let resizeCol = null
let resizeStartX = 0
let resizeStartW = 0
let resizeTable = null

function initResizeListeners() {
  nextTick(() => {
    attachResizeHandles()
  })
}

function attachResizeHandles() {
  const tableEl = tableRef.value?.$el
  if (!tableEl) return
  const headers = tableEl.querySelectorAll('.el-table__header-wrapper th')
  headers.forEach((th, idx) => {
    // 移除旧的 resize handle
    const old = th.querySelector('.resize-handle')
    if (old) old.remove()

    const visibleCols = columnList.filter(c => c.visible)
    const colCfg = visibleCols[idx]
    if (!colCfg || colCfg.disabled) return

    const handle = document.createElement('div')
    handle.className = 'resize-handle'
    handle.style.cssText = 'position:absolute;right:0;top:0;width:5px;height:100%;cursor:col-resize;z-index:10;'
    handle.addEventListener('mousedown', (e) => startResize(e, colCfg, th))
    th.style.position = 'relative'
    th.appendChild(handle)
  })
}

function startResize(e, colCfg, th) {
  resizing = true
  resizeCol = colCfg
  resizeStartX = e.clientX
  resizeStartW = th.getBoundingClientRect().width
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeUp)
}

function onResizeMove(e) {
  if (!resizing || !resizeCol) return
  const delta = e.clientX - resizeStartX
  const newW = Math.max(50, resizeStartW + delta)
  resizeCol.width = Math.round(newW)
}

function onResizeUp() {
  resizing = false
  resizeCol = null
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeUp)
  nextTick(() => attachResizeHandles())
}

// 每次列配置变化后重新绑定拖拽
watch(() => columnList.map(c => `${c.key}:${c.visible}:${c.width}`).join('|'), () => {
  nextTick(() => attachResizeHandles())
}, { flush: 'post' })

// dialog 打开后绑定拖拽
watch(visible, (val) => {
  if (val) {
    nextTick(() => {
      setTimeout(() => attachResizeHandles(), 200)
    })
  }
})

onMounted(() => {
  window.addEventListener('resize', attachResizeHandles)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', attachResizeHandles)
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeUp)
})

// ========== 合计行 ==========
function getSummaries({ columns, data }) {
  const sums = []
  columns.forEach((col, idx) => {
    if (idx === 0) {
      sums[idx] = '总计'
      return
    }
    const numericFields = ['stockQty', 'availableQty', 'inTransitQty', 'demandQty', 'gapQty', 'planQty']
    const propMap = {
      '库存数量': 'stockQty',
      '可用库存': 'availableQty',
      '在途数量': 'inTransitQty',
      '需求数': 'demandQty',
      '缺口数': 'gapQty',
      '计划数量': 'planQty',
    }
    const field = propMap[col.label]
    if (field && numericFields.includes(field)) {
      let total = 0
      data.forEach(item => {
        const v = Number(item[field])
        total += isNaN(v) ? 0 : v
      })
      sums[idx] = total > 0 ? total : ''
    } else {
      sums[idx] = ''
    }
  })
  return sums
}

// ========== 辅助方法 ==========
function formatPlanTime(val) {
  if (!val || !Array.isArray(val) || val.length !== 2) return '请选择'
  return `${val[0]} 至 ${val[1]}`
}

// ========== 操作方法 ==========
function handleSaveAndSubmit() {
  const errors = []
  tableData.value.forEach((row, idx) => {
    if (!row.processRoute) errors.push(`第${idx + 1}行：工艺路线不能为空`)
    if (!row.workCenter) errors.push(`第${idx + 1}行：工作中心不能为空`)
    if (!row.responsible) errors.push(`第${idx + 1}行：负责人不能为空`)
    if (row.planQty === null || row.planQty === undefined || row.planQty === '') {
      errors.push(`第${idx + 1}行：计划数量不能为空`)
    }
  })

  if (errors.length > 0) {
    ElMessage.warning(errors[0])
    return
  }

  emit('save', tableData.value)
  ElMessage.success('保存成功！')
  visible.value = false
}

function handleResetAll() {
  loadTableData()
  ElMessage.info('已重置')
}

function handleExport() {
  ElMessage.info('导出功能开发中...')
}
</script>

<style scoped>
.work-order-dialog :deep(.el-dialog__header) {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-color);
  margin: 0;
}

.dialog-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialog-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

/* 表格工具栏 */
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.toolbar-hint {
  font-size: 12px;
  color: #909399;
}

.table-wrapper {
  overflow: hidden;
}

/* 可编辑单元格样式 */
.editable-cell {
  cursor: pointer;
  display: inline-block;
  width: 100%;
  min-height: 22px;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background 0.15s;
}

.editable-cell:hover {
  background: #e8f4ff;
}

.editable-cell.empty {
  color: #c0c4cc;
  font-style: italic;
}

.editable-cell.bold-text {
  font-weight: 600;
}

.editable-cell.remark-cell {
  color: #606266;
}

.warn-text {
  color: #e6a23c;
}

.danger-text {
  color: #f56c6c;
  font-weight: 500;
}

.bold-text {
  font-weight: 600;
}

/* 表格内编辑控件调整 */
:deep(.el-table .cell) {
  padding: 0 4px;
}

:deep(.el-table .el-input),
:deep(.el-table .el-select),
:deep(.el-table .el-date-editor),
:deep(.el-table .el-input-number) {
  width: 100%;
}

/* 合计行样式 */
:deep(.el-table__footer-wrapper tbody tr) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.el-table__footer-wrapper td) {
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 8px;
}

/* 可编辑列提示 */
:deep(td.cell-editable) {
  position: relative;
}

:deep(td.cell-editable::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 1px;
  background: #1677ff;
  transition: width 0.2s;
}

:deep(td.cell-editable:hover::after) {
  width: 30%;
}

/* ========== 列设置抽屉 ========== */
.column-drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  font-size: 15px;
  font-weight: 600;
}

.column-drawer :deep(.el-drawer__body) {
  padding: 0;
}

.column-setting-table {
  padding: 0 20px;
}

.setting-header {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  background: #fafafa;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
}

.setting-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #303133;
}

.setting-row:hover {
  background: #f5f7fa;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
}

.setting-row.disabled {
  color: #c0c4cc;
}

.sh-cell {
  flex-shrink: 0;
}

.sh-name {
  flex: 1;
  min-width: 0;
  padding-right: 12px;
}

.sh-check {
  width: 60px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid #e4e7ed;
}

/* 拖拽调整时表头样式 */
:deep(.col-header) {
  position: relative;
}

:deep(.el-table__header-wrapper th:hover .resize-handle) {
  background: #1677ff;
}
</style>
