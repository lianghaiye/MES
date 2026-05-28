<template>
  <div class="placeholder-page">
    <el-empty description="功能开发中，敬请期待">
      <el-button type="primary" @click="$router.back()">返回上一页</el-button>
    </el-empty>
  </div>
</template>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
}
</style>
