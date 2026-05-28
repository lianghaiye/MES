<template>
  <div class="app-header">
    <!-- Logo 区域 -->
    <div class="header-logo">
      <span class="logo-icon">⊞</span>
      <span class="logo-text">I-DOMS</span>
    </div>

    <!-- 主导航菜单 -->
    <nav class="header-nav">
      <div
        v-for="item in navMenus"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeModule === item.key }"
        @click="$emit('module-change', item.key)"
      >
        <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
        <span class="nav-label">{{ item.title }}</span>
      </div>

      <!-- 更多菜单 -->
      <el-dropdown class="nav-more" trigger="click">
        <div class="nav-item">
          <el-icon><MoreFilled /></el-icon>
          <span class="nav-label">更多</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>系统设置</el-dropdown-item>
            <el-dropdown-item>权限管理</el-dropdown-item>
            <el-dropdown-item>操作日志</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </nav>

    <!-- 右侧操作区 -->
    <div class="header-actions">
      <!-- 全屏 -->
      <el-tooltip content="全屏" placement="bottom">
        <el-icon class="action-icon" @click="toggleFullscreen">
          <FullScreen />
        </el-icon>
      </el-tooltip>

      <!-- 消息通知 -->
      <el-tooltip content="消息通知" placement="bottom">
        <el-badge :value="messageCount" :hidden="messageCount === 0">
          <el-icon class="action-icon"><Bell /></el-icon>
        </el-badge>
      </el-tooltip>

      <!-- 用户信息 -->
      <el-dropdown class="user-dropdown" trigger="click">
        <div class="user-info">
          <el-avatar :size="28" class="user-avatar">
            {{ userInitial }}
          </el-avatar>
          <span class="user-name">{{ userName }}</span>
          <el-icon class="user-arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-icon><User /></el-icon>个人信息
            </el-dropdown-item>
            <el-dropdown-item>
              <el-icon><Setting /></el-icon>修改密码
            </el-dropdown-item>
            <el-dropdown-item divided>
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  HomeFilled,
  Operation,
  ShoppingCart,
  Calendar,
  SetUp,
  Box,
  CircleCheck,
  ShoppingBag,
  Service,
  MoreFilled,
  FullScreen,
  Bell,
  ArrowDown,
  User,
  Setting,
  SwitchButton,
} from '@element-plus/icons-vue'

defineProps({
  activeModule: {
    type: String,
    default: 'home',
  },
})

defineEmits(['module-change'])

// 导航菜单配置
const navMenus = [
  { key: 'home', title: '首页', icon: HomeFilled },
  { key: 'process', title: '产品工艺', icon: Operation },
  { key: 'sales', title: '销售管理', icon: ShoppingCart },
  { key: 'planning', title: '计划排产', icon: Calendar },
  { key: 'production', title: '生产管理', icon: SetUp },
  { key: 'warehouse', title: '库存管理', icon: Box },
  { key: 'quality', title: '质量管理', icon: CircleCheck },
  { key: 'procurement', title: '采购管理', icon: ShoppingBag },
  { key: 'aftersale', title: '售后管理', icon: Service },
]

// 用户信息（TODO: 从用户 store 获取）
const userName = ref('admin-admin')
const messageCount = ref(3)
const userInitial = computed(() => userName.value?.[0]?.toUpperCase() || 'A')

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  background: #fff;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 12px;
  flex-shrink: 0;
  z-index: 100;
}

/* Logo */
.header-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 110px;
  cursor: pointer;
  user-select: none;
}

.logo-icon {
  font-size: 18px;
  color: var(--primary-color);
  line-height: 1;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 1px;
}

/* 导航 */
.header-nav {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 2px;
  overflow: hidden;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-regular);
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
  height: 32px;
}

.nav-item:hover {
  background: #f5f7fa;
  color: var(--primary-color);
}

.nav-item.active {
  background: #e8f4ff;
  color: var(--primary-color);
  font-weight: 500;
}

.nav-icon {
  font-size: 14px;
}

.nav-more {
  margin-left: 4px;
}

/* 右侧操作区 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-left: 12px;
}

.action-icon {
  font-size: 18px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.action-icon:hover {
  color: var(--primary-color);
}

/* 用户信息 */
.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f7fa;
}

.user-avatar {
  background: var(--primary-color);
  font-size: 12px;
  font-weight: 600;
}

.user-name {
  font-size: 13px;
  color: var(--text-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-arrow {
  font-size: 12px;
  color: #999;
}
</style>
