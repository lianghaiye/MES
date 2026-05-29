<template>
  <el-dialog
    v-model="visible"
    title="新增"
    width="900px"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      class="create-form"
    >
      <!-- 第一行 -->
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="工单编号" prop="workOrderNo">
            <el-input v-model="form.workOrderNo" placeholder="自动生成" readonly>
              <template #append>
                <el-button @click="generateNo">生成编码</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="工单名称" prop="workOrderName">
            <el-input v-model="form.workOrderName" placeholder="请输入工单名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="产品" prop="productId">
            <el-select v-model="form.productId" filterable placeholder="请选择产品" style="width: 100%">
              <el-option label="电机壳" value="P-260519" />
              <el-option label="泵体外壳" value="P-260520" />
              <el-option label="叶轮" value="P-260521" />
              <el-option label="轴承座" value="P-260522" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行 -->
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="时序控制">
            <el-select v-model="form.sequenceControl" placeholder="请选择" style="width: 100%">
              <el-option label="是" value="yes" />
              <el-option label="否" value="no" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="工单类别">
            <el-select v-model="form.workOrderType" placeholder="请选择" style="width: 100%">
              <el-option label="普通工单" value="normal" />
              <el-option label="返工工单" value="rework" />
              <el-option label="试制工单" value="trial" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="工艺路线" prop="processRoute">
            <el-select v-model="form.processRoute" filterable placeholder="请选择工艺路线" style="width: 100%">
              <el-option label="机加-装配-质检" value="route_1" />
              <el-option label="铸造-机加-质检" value="route_2" />
              <el-option label="卷制-焊接-质检" value="route_3" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行 -->
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="BOM">
            <el-select v-model="form.bom" filterable placeholder="请选择BOM" style="width: 100%">
              <el-option label="BOM-2026-001 电机壳总成" value="BOM-2026-001" />
              <el-option label="BOM-2026-002 泵体外壳" value="BOM-2026-002" />
              <el-option label="BOM-2026-003 叶轮组件" value="BOM-2026-003" />
              <el-option label="BOM-2026-004 轴承座" value="BOM-2026-004" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="计划数量" prop="scheduledQty">
            <el-input v-model.number="form.scheduledQty" placeholder="请填写计划数量" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="排产数量">
            <el-input v-model.number="form.dispatchQty" placeholder="请填写排产数量" type="number" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第四行 -->
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="工作中心" prop="workCenter">
            <el-select v-model="form.workCenter" placeholder="请选择工作中心" style="width: 100%">
              <el-option label="默认工厂" value="default_factory" />
              <el-option label="机加车间一" value="workshop_1" />
              <el-option label="机加车间二" value="workshop_2" />
              <el-option label="装配车间" value="assembly_shop" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="产品仓库" prop="warehouse">
            <el-select v-model="form.warehouse" placeholder="请选择产品仓库" style="width: 100%">
              <el-option label="机加工现场仓" value="machine_warehouse" />
              <el-option label="装配车间仓库" value="assembly_warehouse" />
              <el-option label="原材料仓库" value="raw_material" />
              <el-option label="半成品仓库" value="semi_finished" />
              <el-option label="成品仓库" value="finished_goods" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="负责人" prop="manager">
            <el-select v-model="form.manager" filterable placeholder="请选择负责人" style="width: 100%">
              <el-option label="张三" value="zhangsan" />
              <el-option label="李四" value="lisi" />
              <el-option label="王五" value="wangwu" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行 -->
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="紧急度" prop="urgency">
            <el-select v-model="form.urgency" placeholder="请选择" style="width: 100%">
              <el-option label="紧急" value="urgent" />
              <el-option label="普通" value="normal" />
              <el-option label="不紧急" value="low" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="提醒日期">
            <el-date-picker
              v-model="form.remindDate"
              type="date"
              placeholder="请选择提醒日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="计划日期" prop="planDateRange">
            <el-date-picker
              v-model="form.planDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第六行 -->
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button type="primary" :icon="CircleCheck" @click="handleSave">保存</el-button>
      <el-button :icon="Close" @click="visible = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck, Close } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref(null)

const defaultForm = () => ({
  workOrderNo: '',
  workOrderName: '',
  productId: '',
  productName: '',
  sequenceControl: 'yes',
  workOrderType: 'normal',
  processRoute: '',
  bom: '',
  scheduledQty: null,
  dispatchQty: null,
  workCenter: '',
  warehouse: '',
  manager: '',
  urgency: 'normal',
  remindDate: '',
  planDateRange: [],
  remark: '',
})

const form = ref(defaultForm())

const rules = {
  workOrderName: [{ required: true, message: '请输入工单名称', trigger: 'blur' }],
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  processRoute: [{ required: true, message: '请选择工艺路线', trigger: 'change' }],
  scheduledQty: [{ required: true, message: '请填写计划数量', trigger: 'blur' }],
  workCenter: [{ required: true, message: '请选择工作中心', trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择产品仓库', trigger: 'change' }],
  manager: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  urgency: [{ required: true, message: '请选择紧急度', trigger: 'change' }],
  planDateRange: [{ required: true, message: '请选择计划日期', trigger: 'change' }],
}

const productMap = {
  'P-260519': '电机壳',
  'P-260520': '泵体外壳',
  'P-260521': '叶轮',
  'P-260522': '轴承座',
}

watch(() => form.value.productId, (val) => {
  form.value.productName = productMap[val] || ''
})

const generateNo = () => {
  const prefix = 'T-HHHSCGD'
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = String(Math.floor(Math.random() * 9000) + 1000)
  form.value.workOrderNo = `${prefix}${date}${random}`
}

const handleSave = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const newOrder = {
    id: Date.now(),
    workOrderNo: form.value.workOrderNo || `WO-${Date.now()}`,
    workOrderName: form.value.workOrderName,
    salesOrderNo: '',
    status: 'pending',
    statusText: '待下发',
    workOrderType: form.value.workOrderType === 'normal' ? '普通工单' : form.value.workOrderType,
    workCenter: form.value.workCenter,
    scheduledQty: form.value.scheduledQty,
    productName: form.value.productName,
    productCode: form.value.productId,
    bom: form.value.bom,
    warehouse: form.value.warehouse,
    urgency: form.value.urgency,
    executionStatus: 'normal',
    planDateRange: form.value.planDateRange,
    remark: form.value.remark,
  }

  emit('success', newOrder)
  ElMessage.success('工单创建成功')
  visible.value = false
  form.value = defaultForm()
}

watch(visible, (val) => {
  if (!val) {
    form.value = defaultForm()
  }
})
</script>

<style scoped>
.create-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
</style>
