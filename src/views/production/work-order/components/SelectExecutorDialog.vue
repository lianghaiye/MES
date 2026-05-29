<template>
  <el-dialog
    v-model="visible"
    title="请选择人员"
    width="700px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- 搜索区 -->
    <div class="dialog-search">
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入姓名"
            clearable
            style="width: 160px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="员工编号">
          <el-input
            v-model="searchForm.employeeNo"
            placeholder="请输入员工编号"
            clearable
            style="width: 160px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 人员表格 -->
    <el-table
      ref="tableRef"
      :data="filteredEmployeeList"
      border
      size="small"
      highlight-current-row
      @current-change="handleCurrentChange"
    >
      <el-table-column width="55" align="center">
        <template #default="{ row }">
          <el-radio v-model="selectedRowId" :label="row.id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" align="center" min-width="120" />
      <el-table-column prop="employeeNo" label="员工编号" align="center" min-width="120" />
      <el-table-column prop="dept" label="部门" align="center" min-width="150" />
    </el-table>

    <!-- 空数据提示 -->
    <el-empty v-if="filteredEmployeeList.length === 0" description="暂无数据" />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="!selectedEmployee" @click="handleConfirm">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// 搜索表单
const searchForm = ref({
  name: '',
  employeeNo: '',
})

const selectedRowId = ref(null)
const selectedEmployee = ref(null)

// 模拟人员数据（TODO: 替换为真实接口）
const employeeList = ref([
  { id: 1, name: '张三', employeeNo: 'EMP001', dept: '机加车间' },
  { id: 2, name: '李四', employeeNo: 'EMP002', dept: '机加车间' },
  { id: 3, name: '王五', employeeNo: 'EMP003', dept: '焊接车间' },
  { id: 4, name: '赵六', employeeNo: 'EMP004', dept: '质检部' },
  { id: 5, name: '钱七', employeeNo: 'EMP005', dept: '装配车间' },
  { id: 6, name: '孙八', employeeNo: 'EMP006', dept: '机加车间' },
  { id: 7, name: '周九', employeeNo: 'EMP007', dept: '焊接车间' },
  { id: 8, name: '吴十', employeeNo: 'EMP008', dept: '质检部' },
])

const filteredEmployeeList = computed(() => {
  return employeeList.value.filter((item) => {
    const matchName = !searchForm.value.name || item.name.includes(searchForm.value.name)
    const matchNo = !searchForm.value.employeeNo || item.employeeNo.includes(searchForm.value.employeeNo)
    return matchName && matchNo
  })
})

const handleSearch = () => {
  // 搜索已在 computed 中实现
}

const handleCurrentChange = (row) => {
  if (row) {
    selectedRowId.value = row.id
    selectedEmployee.value = row
  }
}

const handleConfirm = () => {
  if (selectedEmployee.value) {
    emit('confirm', { ...selectedEmployee.value })
    visible.value = false
  }
}

// 打开弹窗时重置选择
watch(visible, (val) => {
  if (val) {
    selectedRowId.value = null
    selectedEmployee.value = null
    searchForm.value = { name: '', employeeNo: '' }
  }
})
</script>

<style scoped>
.dialog-search {
  margin-bottom: 16px;
}

.dialog-search :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>