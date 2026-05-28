<template>
  <div class="app-layout">
    <!-- 顶部导航栏 -->
    <AppHeader
      :active-module="activeModule"
      @module-change="handleModuleChange"
    />

    <div class="layout-body">
      <!-- 左侧侧边栏 -->
      <AppSidebar
        :collapsed="sidebarCollapsed"
        :active-module="activeModule"
        @toggle="sidebarCollapsed = !sidebarCollapsed"
      />

      <!-- 主内容区 -->
      <div class="layout-main" :class="{ collapsed: sidebarCollapsed }">
        <!-- 标签栏 -->
        <TabsBar />

        <!-- 页面内容 -->
        <div class="main-content">
          <router-view v-slot="{ Component, route }">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import TabsBar from './TabsBar.vue'
import { useTabsStore } from '@/stores/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 当前激活的顶部模块
const activeModule = computed(() => route.meta?.module || 'home')

// 缓存的视图（keep-alive 使用组件名）
const cachedViews = computed(() => tabsStore.cachedViews)

// 切换模块时跳转到对应模块的默认路由
const handleModuleChange = (moduleKey) => {
  const moduleDefaultRoutes = {
    home: '/home',
    process: '/process/bom',
    sales: '/sales/order',
    planning: '/planning/production-plan',
    production: '/production/work-order',
    warehouse: '/warehouse/inventory',
    quality: '/quality/inspection',
    procurement: '/procurement/purchase-order',
    aftersale: '/aftersale/service',
  }
  const targetPath = moduleDefaultRoutes[moduleKey]
  if (targetPath && route.path !== targetPath) {
    router.push(targetPath)
  }
}

// 监听路由变化，同步标签栏
watch(
  () => route,
  (newRoute) => {
    if (newRoute.meta?.title && !newRoute.meta?.hidden) {
      tabsStore.addTab({
        path: newRoute.path,
        title: newRoute.meta.title,
        name: newRoute.name,
        affix: newRoute.meta?.affix,
      })
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.25s ease;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f0f2f5;
}
</style>
