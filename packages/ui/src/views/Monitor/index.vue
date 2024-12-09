<script setup lang="ts">
defineOptions({
  name: 'Monitor',
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- cpu -->
    <div class="flex flex-col gap-2">
      <div class="text-lg font-bold">CPU</div>
      <div class="flex flex-row gap-2">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">CPU使用率</div>
          <div class="text-2xl font-bold">0%</div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">CPU负载</div>
          <div class="text-2xl font-bold">0%</div>
        </div>
      </div>
    </div>
    <!-- 内存 -->
    <div class="flex flex-col gap-2">
      <div class="text-lg font-bold">内存</div>
      <div class="flex flex-row gap-2">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">内存使用率</div>
          <div class="text-2xl font-bold">0%</div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">内存负载</div>
          <div class="text-2xl font-bold">0%</div>
        </div>
      </div>
    </div>
    <!-- 硬盘 -->
    <div class="flex flex-col gap-2">
      <div class="text-lg font-bold">硬盘</div>
      <div class="flex flex-row gap-2">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">硬盘使用率</div>
          <div class="text-2xl font-bold">0%</div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">硬盘负载</div>
          <div class="text-2xl font-bold">0%</div>
        </div>
      </div>
    </div>
    <!-- 网络流量 -->
    <div class="flex flex-col gap-2">
      <div class="text-lg font-bold">网络流量</div>
      <div class="flex flex-row gap-2">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">上传速度</div>
          <div class="text-2xl font-bold">0KB/s</div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">下载速度</div>
          <div class="text-2xl font-bold">0KB/s</div>
        </div>
      </div>
    </div>
    <!-- 运行进程 -->
    <div class="flex flex-col gap-2">
      <div class="text-lg font-bold">运行进程</div>
      <div class="flex flex-row gap-2">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">进程数</div>
          <div class="text-2xl font-bold">0</div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">CPU负载</div>
          <div class="text-2xl font-bold">0%</div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">内存负载</div>
          <div class="text-2xl font-bold">0%</div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-sm font-bold">磁盘负载</div>
          <div class="text-2xl font-bold">0%</div>
        </div>
      </div>
    </div>
  </div>
</template>
