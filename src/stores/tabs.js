import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTabsStore = defineStore('tabs', () => {
  // 已打开的标签列表
  const tabs = ref([
    // 首页默认固定
    { path: '/home', title: '首页', name: 'Home', affix: true },
  ])

  // 需要缓存的组件名
  const cachedViews = ref(['Home'])

  // 添加标签
  const addTab = (tab) => {
    const exists = tabs.value.find((t) => t.path === tab.path)
    if (!exists) {
      tabs.value.push(tab)
    }
    if (tab.name && !cachedViews.value.includes(tab.name)) {
      cachedViews.value.push(tab.name)
    }
  }

  // 移除标签
  const removeTab = (path) => {
    const idx = tabs.value.findIndex((t) => t.path === path)
    if (idx === -1) return

    const tab = tabs.value[idx]
    if (tab.affix) return // 固定标签不可关闭

    tabs.value.splice(idx, 1)

    // 从缓存中移除
    const nameIdx = cachedViews.value.indexOf(tab.name)
    if (nameIdx > -1) cachedViews.value.splice(nameIdx, 1)
  }

  // 关闭其他标签
  const closeOtherTabs = (currentPath) => {
    tabs.value = tabs.value.filter((t) => t.affix || t.path === currentPath)
    cachedViews.value = tabs.value.map((t) => t.name).filter(Boolean)
  }

  // 关闭所有标签（保留固定标签）
  const closeAllTabs = () => {
    tabs.value = tabs.value.filter((t) => t.affix)
    cachedViews.value = tabs.value.map((t) => t.name).filter(Boolean)
  }

  // 刷新视图（临时移除缓存再加回来）
  const refreshView = (path) => {
    const tab = tabs.value.find((t) => t.path === path)
    if (tab?.name) {
      const idx = cachedViews.value.indexOf(tab.name)
      if (idx > -1) {
        cachedViews.value.splice(idx, 1)
        setTimeout(() => {
          cachedViews.value.push(tab.name)
        }, 100)
      }
    }
  }

  return {
    tabs,
    cachedViews,
    addTab,
    removeTab,
    closeOtherTabs,
    closeAllTabs,
    refreshView,
  }
})
