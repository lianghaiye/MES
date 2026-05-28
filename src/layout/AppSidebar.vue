<template>
  <div class="app-sidebar" :class="{ collapsed }">
    <!-- 折叠按钮 -->
    <div class="sidebar-toggle" @click="$emit('toggle')">
      <el-icon>
        <component :is="collapsed ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>

    <!-- 侧边菜单 -->
    <el-scrollbar class="sidebar-scroll">
      <el-menu
        :default-active="activeRoute"
        :collapse="collapsed"
        :collapse-transition="false"
        router
        class="sidebar-menu"
        active-text-color="#1677ff"
        background-color="#fff"
        text-color="#606266"
      >
        <template v-for="item in currentMenus" :key="item.path">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="item.children?.length > 1" :index="item.path">
            <template #title>
              <el-icon><component :is="item.meta?.icon || 'Document'" /></el-icon>
              <span>{{ item.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="`${item.path}/${child.path}`"
            >
              <el-icon><component :is="child.meta?.icon || 'Document'" /></el-icon>
              <template #title>{{ child.meta?.title }}</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 仅有单个子菜单，直接展示 -->
          <el-menu-item
            v-else-if="item.children?.length === 1"
            :index="`${item.path}/${item.children[0].path}`"
          >
            <el-icon>
              <component :is="item.children[0].meta?.icon || item.meta?.icon || 'Document'" />
            </el-icon>
            <template #title>{{ item.children[0].meta?.title }}</template>
          </el-menu-item>

          <!-- 无子菜单 -->
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.meta?.icon || 'Document'" /></el-icon>
            <template #title>{{ item.meta?.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { moduleRoutes } from '@/router/index'
import {
  Expand, Fold, Document,
  HomeFilled, Operation, ShoppingCart, Calendar,
  SetUp, Box, CircleCheck, ShoppingBag, Service,
} from '@element-plus/icons-vue'

const props = defineProps({
  collapsed: { type: Boolean, default: false },
  activeModule: { type: String, default: 'home' },
})

defineEmits(['toggle'])

const route = useRoute()

// 当前路由激活路径
const activeRoute = computed(() => route.path)

// 根据当前模块过滤侧边栏菜单
const currentMenus = computed(() => {
  const moduleKey = props.activeModule
  // 在 moduleRoutes 中找到匹配模块
  const moduleRoute = moduleRoutes.find((r) => r.meta?.module === moduleKey)

  if (!moduleRoute) return []

  // 如果是首页这类无侧边栏模块，直接返回
  if (!moduleRoute.children) {
    return [moduleRoute]
  }

  // 返回子路由作为菜单项
  return [moduleRoute]
})
</script>

<style scoped>
.app-sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: #fff;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.app-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
  min-width: var(--sidebar-collapsed-width);
}

/* 折叠按钮 */
.sidebar-toggle {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  color: #999;
  font-size: 16px;
  flex-shrink: 0;
  transition: color 0.2s;
}

.sidebar-toggle:hover {
  color: var(--primary-color);
}

.app-sidebar.collapsed .sidebar-toggle {
  justify-content: center;
}

/* 滚动容器 */
.sidebar-scroll {
  flex: 1;
}

/* 菜单样式 */
.sidebar-menu {
  border-right: none;
  width: 100%;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: var(--sidebar-width);
}

/* 覆盖 Element Plus 菜单激活样式 */
:deep(.el-menu-item.is-active) {
  background: #e8f4ff !important;
  color: #1677ff !important;
  font-weight: 500;
}

:deep(.el-menu-item:hover) {
  background: #f5f7fa !important;
}

:deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}

:deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}
</style>
