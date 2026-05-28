<template>
  <div class="tabs-bar">
    <div class="tabs-content">
      <div
        v-for="tab in tabsStore.tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: isActive(tab.path) }"
        @click="handleTabClick(tab)"
        @contextmenu.prevent="showContextMenu($event, tab)"
      >
        <span class="tab-label">{{ tab.title }}</span>
        <el-icon
          v-if="!tab.affix"
          class="tab-close"
          @click.stop="tabsStore.removeTab(tab.path)"
        >
          <Close />
        </el-icon>
      </div>
    </div>

    <!-- 右侧操作 -->
    <el-dropdown class="tabs-actions" trigger="click">
      <el-icon class="action-btn"><ArrowDown /></el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="refreshCurrentTab">
            <el-icon><Refresh /></el-icon>刷新当前
          </el-dropdown-item>
          <el-dropdown-item @click="tabsStore.closeOtherTabs(route.path)">
            <el-icon><Close /></el-icon>关闭其他
          </el-dropdown-item>
          <el-dropdown-item @click="tabsStore.closeAllTabs">
            <el-icon><FolderDelete /></el-icon>关闭全部
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @mouseleave="contextMenu.visible = false"
      >
        <div class="context-item" @click="refreshCurrentTab">
          <el-icon><Refresh /></el-icon>刷新
        </div>
        <div
          v-if="!contextMenu.tab?.affix"
          class="context-item"
          @click="tabsStore.removeTab(contextMenu.tab?.path)"
        >
          <el-icon><Close /></el-icon>关闭
        </div>
        <div class="context-item" @click="tabsStore.closeOtherTabs(contextMenu.tab?.path)">
          <el-icon><CircleClose /></el-icon>关闭其他
        </div>
        <div class="context-item" @click="tabsStore.closeAllTabs">
          <el-icon><FolderDelete /></el-icon>关闭全部
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { Close, ArrowDown, Refresh, FolderDelete, CircleClose } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

// 判断当前 tab 是否激活
const isActive = (path) => route.path === path

// 点击 tab
const handleTabClick = (tab) => {
  if (route.path !== tab.path) {
    router.push(tab.path)
  }
}

// 刷新当前 tab
const refreshCurrentTab = () => {
  tabsStore.refreshView(route.path)
  router.replace({ path: '/redirect' + route.path })
}

// 右键菜单
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  tab: null,
})

const showContextMenu = (e, tab) => {
  contextMenu.visible = true
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.tab = tab
}

// 点击其他区域关闭右键菜单
const hideContextMenu = () => {
  contextMenu.visible = false
}

onMounted(() => document.addEventListener('click', hideContextMenu))
onBeforeUnmount(() => document.removeEventListener('click', hideContextMenu))
</script>

<style scoped>
.tabs-bar {
  height: 36px;
  background: #fff;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 8px;
  gap: 4px;
}

.tabs-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 3px;
  overflow: hidden;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  height: 26px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  font-size: 12px;
  color: var(--text-regular);
  cursor: pointer;
  background: #fafafa;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}

.tab-item:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.tab-item.active {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.tab-close {
  font-size: 11px;
  border-radius: 50%;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.tab-close:hover {
  opacity: 1;
}

.tabs-actions {
  flex-shrink: 0;
}

.action-btn {
  font-size: 14px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f7fa;
  color: var(--primary-color);
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  min-width: 120px;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--text-regular);
  cursor: pointer;
  transition: background 0.15s;
}

.context-item:hover {
  background: #f5f7fa;
  color: var(--primary-color);
}
</style>
