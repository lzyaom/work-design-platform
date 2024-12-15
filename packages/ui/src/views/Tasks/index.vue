<script setup lang="ts">
defineOptions({
  name: 'Tasks',
})
</script>

<template>
  <div class="flex flex-col">
    <h1 class="text-2xl font-bold">Tasks</h1>
    <!-- 操作 -->
    <div class="flex flex-row items-center justify-between">
      <div class="flex flex-row items-center gap-2">
        <span class="text-sm">任务名称</span>
        <span class="text-sm">任务类型</span>
        <span class="text-sm">任务状态</span>
        <span class="text-sm">创建时间</span>
        <span class="text-sm">操作</span>
      </div>
      <div class="flex flex-row items-center gap-2">
        <a-button type="primary" size="small">新建任务</a-button>
      </div>
    </div>
  </div>
</template>
