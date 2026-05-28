<template>
  <div class="page-container">
    <!-- 欢迎 Banner -->
    <el-card class="welcome-banner" shadow="never">
      <div class="banner-content">
        <div class="banner-left">
          <h2 class="welcome-title">欢迎使用 I-DOMS 智能制造执行系统</h2>
          <p class="welcome-sub">整合生产、质量、库存、计划等核心业务，提升制造效率</p>
        </div>
        <div class="banner-date">
          <div class="date-num">{{ today }}</div>
          <div class="date-label">{{ weekday }}</div>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="12" class="stat-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card class="stat-card" shadow="never">
          <div class="stat-inner">
            <div class="stat-icon" :style="{ background: stat.bg }">
              <el-icon :size="22"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card shadow="never" class="shortcut-card">
      <template #header>
        <span class="card-title">快捷入口</span>
      </template>
      <div class="shortcut-grid">
        <div
          v-for="item in shortcuts"
          :key="item.path"
          class="shortcut-item"
          @click="$router.push(item.path)"
        >
          <el-icon :size="24" class="shortcut-icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Calendar, SetUp, Box, CircleCheck,
  ShoppingBag, Operation, ShoppingCart, Service,
} from '@element-plus/icons-vue'

// 今日日期
const now = new Date()
const today = computed(() =>
  `${now.getMonth() + 1}月${now.getDate()}日`
)
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const weekday = computed(() => weekdays[now.getDay()])

// 统计数据（TODO: 接口获取）
const stats = [
  { label: '今日生产计划', value: '12', icon: Calendar, bg: '#e8f4ff' },
  { label: '在制工单', value: '36', icon: SetUp, bg: '#fff7e6' },
  { label: '库存预警', value: '5', icon: Box, bg: '#fff1f0' },
  { label: '待检任务', value: '8', icon: CircleCheck, bg: '#f6ffed' },
]

// 快捷入口
const shortcuts = [
  { title: '生产计划', path: '/planning/production-plan', icon: Calendar },
  { title: '工单管理', path: '/production/work-order', icon: SetUp },
  { title: '库存查询', path: '/warehouse/inventory', icon: Box },
  { title: '质检管理', path: '/quality/inspection', icon: CircleCheck },
  { title: '采购订单', path: '/procurement/purchase-order', icon: ShoppingBag },
  { title: '产品工艺', path: '/process/bom', icon: Operation },
  { title: '销售订单', path: '/sales/order', icon: ShoppingCart },
  { title: '售后工单', path: '/aftersale/service', icon: Service },
]
</script>

<style scoped>
.page-container {
  padding: 16px;
}

/* 欢迎横幅 */
.welcome-banner {
  margin-bottom: 12px;
  background: linear-gradient(135deg, #e8f4ff 0%, #f0f8ff 100%);
  border-color: #c5dcf7;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-title {
  font-size: 18px;
  font-weight: 600;
  color: #1677ff;
  margin-bottom: 6px;
}

.welcome-sub {
  font-size: 13px;
  color: #666;
}

.date-num {
  font-size: 28px;
  font-weight: 700;
  color: #1677ff;
  text-align: right;
}

.date-label {
  font-size: 13px;
  color: #888;
  text-align: right;
}

/* 统计卡片 */
.stat-row {
  margin-bottom: 12px;
}

.stat-card {
  border-color: var(--border-color);
}

.stat-inner {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1677ff;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 快捷入口 */
.shortcut-card {
  border-color: var(--border-color);
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-regular);
  transition: all 0.2s;
}

.shortcut-item:hover {
  border-color: #1677ff;
  color: #1677ff;
  background: #e8f4ff;
}

.shortcut-icon {
  color: #1677ff;
}
</style>
